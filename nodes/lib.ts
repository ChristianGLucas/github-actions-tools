// Shared bounds, SAFE YAML parsing, and GitHub-Actions-workflow-semantic
// extraction helpers for the github-actions-tools nodes. Not a node and not
// a test file, so it is neither registered nor collected by jest.
//
// The parse layer is entirely owned by js-yaml (js-yaml.github.io) — nothing
// here reimplements YAML parsing. What lives here is: (a) an input-size
// bound enforced BEFORE js-yaml ever sees the input, (b) a single-document
// safe parse, and (c) the GitHub Actions workflow-schema knowledge (which
// field, at which path, means "job", "step", "trigger filter", "matrix
// dimension", etc.) — that knowledge is this package's actual value-add,
// not something any generic YAML library provides.
//
// SAFETY: js-yaml v5's `load()` uses CORE_SCHEMA by default, which resolves
// only plain YAML scalars/sequences/mappings (strings, numbers, bools,
// null, arrays, objects) — there is no `!!js/function`, `!!js/regexp`, or
// any other tag capable of constructing an arbitrary JS object or executing
// code. That capability does not exist anywhere in js-yaml's codebase (it
// was fully removed, not merely opt-in, since v4) unless a caller
// explicitly installs the separate `js-yaml-js-types` package, which this
// package does not depend on. We additionally pass explicit `maxDepth` and
// `maxAliases` bounds on every parse call as defense-in-depth against
// deeply-nested or alias-amplified input, on top of this module's own
// byte-size ceiling.
//
// VERIFIED GOTCHA (see parse_workflow_test.ts / lib_test.ts): the classic
// "Norway problem" — a YAML 1.1 parser resolving an unquoted `on` mapping
// key to the boolean `true` — does NOT apply here. js-yaml v5's CORE_SCHEMA
// implements YAML 1.2 Core Schema bool resolution (only
// true/True/TRUE/false/False/FALSE), so `on:` always parses as the string
// key "on". This was empirically verified against js-yaml 5.2.1, not
// assumed.

import * as yaml from 'js-yaml';

/** Ceiling for a whole workflow file's raw text (Workflow.yaml /
 * JobRequest.yaml). 2 MB — comfortably under the ~4 MiB Axiom transport cap
 * even after run-script text is echoed back in output fields, and far
 * beyond any real GitHub Actions workflow file (GitHub itself limits a
 * single workflow file to a small fraction of this). */
export const MAX_YAML_BYTES = 2_000_000;

/** js-yaml's own collection-nesting-depth bound (does not count aliases).
 * Real workflow files rarely nest more than ~10 levels; 100 is generous
 * headroom while still bounding pathological input. */
export const MAX_YAML_DEPTH = 100;

/** js-yaml's own per-document alias-node ceiling — bounds "billion laughs"-
 * style alias amplification. Real workflow files essentially never use YAML
 * anchors/aliases; 200 is generous headroom for the rare legitimate use
 * while bounding pathological expansion. */
export const MAX_YAML_ALIASES = 200;

export class BoundsError extends Error {}

/** Rejects oversized input (by UTF-8 byte length, not JS string length). */
export function checkBytes(value: string, field: string, max: number): void {
  if (Buffer.byteLength(value, 'utf8') > max) {
    throw new BoundsError(`${field} exceeds ${max} bytes`);
  }
}

/** Turns a caught value into a stable error message. */
export function errorMessage(e: unknown, context: string): string {
  if (e instanceof Error) {
    return `${context}: ${e.message}`;
  }
  return `${context}: ${String(e)}`;
}

// ---------------------------------------------------------------------------
// Safe single-document parse
// ---------------------------------------------------------------------------

export interface ParsedWorkflow {
  data: unknown;
  /** Non-null exactly when data is undefined. */
  parseError: string | null;
}

/** Bounds + safely parses one workflow file's raw YAML text. A workflow
 * file is always a SINGLE YAML document — unlike a Kubernetes manifest,
 * there is no `---`-separated multi-document convention here, so a
 * multi-document input (or any other YAML/size problem) is reported as a
 * parse error rather than silently taking the first document. Never
 * throws for a parse problem (captured in parseError); throws BoundsError
 * only for oversized input. */
export function parseWorkflow(text: string, field = 'yaml'): ParsedWorkflow {
  checkBytes(text, field, MAX_YAML_BYTES);
  try {
    const data = yaml.load(text, {
      maxDepth: MAX_YAML_DEPTH,
      maxAliases: MAX_YAML_ALIASES,
    });
    return { data, parseError: null };
  } catch (e) {
    return { data: undefined, parseError: errorMessage(e, 'YAML parse error') };
  }
}

// ---------------------------------------------------------------------------
// Generic shape helpers
// ---------------------------------------------------------------------------

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

export function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/** Normalizes a field that GitHub Actions accepts as either a single
 * string or a list of strings (runs-on, needs) into a string array.
 * Non-string list entries are stringified defensively; undefined/null
 * yields an empty array. */
export function asStringList(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.map(asString).filter((s) => s !== '');
  const s = asString(v);
  return s === '' ? [] : [s];
}

export function getIn(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

export interface KV {
  key: string;
  value: string;
}

/** Converts a plain map[string]<scalar>-shaped YAML mapping to KV pairs,
 * sorted by key for a deterministic, order-independent result (map key
 * order in source YAML carries no semantic meaning for env/with/
 * permissions-scope blocks, unlike a list). Non-string scalar values are
 * stringified (GitHub Actions itself coerces e.g. an unquoted numeric env
 * value to a string). */
export function mapToSortedKVs(m: unknown): KV[] {
  if (!isPlainObject(m)) return [];
  return Object.keys(m)
    .sort()
    .map((key) => ({ key, value: asString(m[key]) }));
}

/** True when the workflow document is at least a mapping — the minimum
 * shape needed to look for on:/jobs: at all. */
export function looksLikeWorkflow(data: unknown): boolean {
  return isPlainObject(data);
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

/** Returns the workflow's `jobs:` map (job_id -> job object) in document
 * order, or an empty array if `jobs:` is absent/not a mapping. */
export function listJobEntries(data: Record<string, unknown>): Array<[string, Record<string, unknown>]> {
  const jobs = data.jobs;
  if (!isPlainObject(jobs)) return [];
  const out: Array<[string, Record<string, unknown>]> = [];
  for (const key of Object.keys(jobs)) {
    const job = jobs[key];
    if (isPlainObject(job)) out.push([key, job]);
  }
  return out;
}

export function isReusableCallJob(job: Record<string, unknown>): boolean {
  return typeof job.uses === 'string' && job.uses.length > 0;
}

export function jobRunsOn(job: Record<string, unknown>): string[] {
  return asStringList(job['runs-on']);
}

export function jobNeeds(job: Record<string, unknown>): string[] {
  return asStringList(job.needs);
}

export function jobStepCount(job: Record<string, unknown>): number {
  return asArray(job.steps).length;
}

// ---------------------------------------------------------------------------
// permissions:
// ---------------------------------------------------------------------------

export interface PermissionsBlockValue {
  mode: string;
  scopes: KV[];
}

/** Normalizes a `permissions:` value (absent | "read-all" | "write-all" |
 * {} | {scope: level, ...}) to a single shape. */
export function parsePermissions(v: unknown): PermissionsBlockValue {
  if (v === undefined) return { mode: 'unspecified', scopes: [] };
  if (typeof v === 'string') {
    return { mode: v === 'read-all' || v === 'write-all' ? v : 'unspecified', scopes: [] };
  }
  if (isPlainObject(v)) {
    const keys = Object.keys(v);
    if (keys.length === 0) return { mode: 'none', scopes: [] };
    return { mode: 'scoped', scopes: mapToSortedKVs(v) };
  }
  return { mode: 'unspecified', scopes: [] };
}

// ---------------------------------------------------------------------------
// environment: / concurrency: / container: (bare-string-or-object fields)
// ---------------------------------------------------------------------------

/** environment: is either a bare string (the environment name) or
 * {name, url}. Returns just the name either way. */
export function environmentName(v: unknown): string {
  if (typeof v === 'string') return v;
  if (isPlainObject(v)) return asString(v.name);
  return '';
}

export interface ConcurrencyValue {
  group: string;
  cancelInProgress: boolean;
  specified: boolean;
}

/** concurrency: is either a bare string (the group) or
 * {group, cancel-in-progress}. */
export function parseConcurrency(v: unknown): ConcurrencyValue {
  if (typeof v === 'string') return { group: v, cancelInProgress: false, specified: true };
  if (isPlainObject(v)) {
    return {
      group: asString(v.group),
      cancelInProgress: v['cancel-in-progress'] === true,
      specified: true,
    };
  }
  return { group: '', cancelInProgress: false, specified: false };
}

/** container: is either a bare string (the image) or {image, ...}. */
export function containerImage(v: unknown): string {
  if (typeof v === 'string') return v;
  if (isPlainObject(v)) return asString(v.image);
  return '';
}

// ---------------------------------------------------------------------------
// defaults.run.shell / defaults.run.working-directory fallback chain
// ---------------------------------------------------------------------------

export function defaultsRunField(container: unknown, field: 'shell' | 'working-directory'): string {
  const defaults = getIn(container, ['defaults', 'run']);
  if (!isPlainObject(defaults)) return '';
  return asString(defaults[field]);
}

/** Resolves an effective step.shell / step.working-directory through the
 * documented fallback chain: step's own value -> job.defaults.run.<field>
 * -> workflow.defaults.run.<field> -> "" (GitHub then falls back to an
 * OS-dependent default this package does not infer). */
export function resolveStepDefault(
  step: Record<string, unknown>,
  job: Record<string, unknown>,
  workflow: Record<string, unknown>,
  field: 'shell' | 'working-directory',
): string {
  const stepKey = field === 'shell' ? 'shell' : 'working-directory';
  const own = asString(step[stepKey]);
  if (own !== '') return own;
  const jobLevel = defaultsRunField(job, field);
  if (jobLevel !== '') return jobLevel;
  return defaultsRunField(workflow, field);
}

// ---------------------------------------------------------------------------
// uses: reference parsing (actions AND reusable-workflow calls share the
// same owner/repo[/sub-path]@ref grammar)
// ---------------------------------------------------------------------------

export interface UsesRef {
  owner: string;
  repo: string;
  subPath: string;
  ref: string;
  refKind: string; // "sha" | "floating" | ""
  isShaPinned: boolean;
  isLocalPath: boolean;
  isDocker: boolean;
  dockerImage: string;
}

const SHA_RE = /^[0-9a-fA-F]{40}$/;

/** Parses a `uses:` value into its owner/repo/sub-path/ref, or flags it as
 * a local-path or Docker-image reference (neither of which has an
 * owner/repo/ref shape). Never throws — an unparseable/empty string comes
 * back with every field at its zero value. */
export function parseUsesRef(raw: string): UsesRef {
  const empty: UsesRef = {
    owner: '',
    repo: '',
    subPath: '',
    ref: '',
    refKind: '',
    isShaPinned: false,
    isLocalPath: false,
    isDocker: false,
    dockerImage: '',
  };
  if (!raw) return empty;
  if (raw.startsWith('docker://')) {
    return { ...empty, isDocker: true, dockerImage: raw.slice('docker://'.length) };
  }
  if (raw.startsWith('./') || raw.startsWith('../')) {
    return { ...empty, isLocalPath: true };
  }
  const atIdx = raw.lastIndexOf('@');
  const refPart = atIdx >= 0 ? raw.slice(atIdx + 1) : '';
  const pathPart = atIdx >= 0 ? raw.slice(0, atIdx) : raw;
  const segments = pathPart.split('/').filter((s) => s.length > 0);
  const owner = segments[0] ?? '';
  const repo = segments[1] ?? '';
  const subPath = segments.length > 2 ? segments.slice(2).join('/') : '';
  const refKind = refPart === '' ? '' : SHA_RE.test(refPart) ? 'sha' : 'floating';
  return {
    ...empty,
    owner,
    repo,
    subPath,
    ref: refPart,
    refKind,
    isShaPinned: refKind === 'sha',
  };
}

// ---------------------------------------------------------------------------
// strategy.matrix
// ---------------------------------------------------------------------------

/** Stringifies one matrix dimension value or include/exclude entry value:
 * scalars use asString; a non-scalar (object/array — an uncommon but real
 * matrix value shape) falls back to JSON so no information is silently
 * dropped. */
export function matrixValueToString(v: unknown): string {
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return asString(v);
  if (v === null || v === undefined) return '';
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// ---------------------------------------------------------------------------
// secrets.<NAME> reference scanning
// ---------------------------------------------------------------------------

export interface SecretHit {
  name: string;
  rawExpression: string;
}

const SECRET_RE = /\$\{\{[^}]*?\bsecrets\.([A-Za-z_][A-Za-z0-9_]*)[^}]*?\}\}|\bsecrets\.([A-Za-z_][A-Za-z0-9_]*)/g;

/** Finds every `secrets.<NAME>` reference in a string, preferring to
 * capture the full `${{ ... }}` expression as raw_expression when the hit
 * is wrapped in one, else just the bare `secrets.NAME` text. Returns one
 * entry per occurrence (a string with the same secret referenced twice
 * yields two hits; callers that want distinct names dedupe themselves). */
export function findSecretReferences(text: string): SecretHit[] {
  if (!text || !text.includes('secrets.')) return [];
  const hits: SecretHit[] = [];
  let m: RegExpExecArray | null;
  SECRET_RE.lastIndex = 0;
  while ((m = SECRET_RE.exec(text)) !== null) {
    const name = m[1] ?? m[2];
    if (!name) continue;
    hits.push({ name, rawExpression: m[0] });
  }
  return hits;
}
