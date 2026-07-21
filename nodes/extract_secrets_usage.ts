import { Workflow, ExtractSecretsUsageResult, SecretReference } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  isPlainObject,
  asArray,
  asString,
  findSecretReferences,
  errorMessage,
  BoundsError,
} from './lib';

function scan(text: unknown, jobId: string, stepIndex: number, location: string, into: SecretReference[]): void {
  const s = asString(text);
  if (s === '') return;
  for (const hit of findSecretReferences(s)) {
    const ref = new SecretReference();
    ref.setJobId(jobId);
    ref.setStepIndex(stepIndex);
    ref.setLocation(location);
    ref.setSecretName(hit.name);
    ref.setRawExpression(hit.rawExpression);
    into.push(ref);
  }
}

function scanMap(m: unknown, jobId: string, stepIndex: number, location: string, into: SecretReference[]): void {
  if (!isPlainObject(m)) return;
  for (const key of Object.keys(m)) scan(m[key], jobId, stepIndex, location, into);
}

function scanContainerLike(v: unknown, jobId: string, into: SecretReference[]): void {
  if (typeof v === 'string') {
    scan(v, jobId, -1, 'container', into);
    return;
  }
  if (!isPlainObject(v)) return;
  scan(v.image, jobId, -1, 'container', into);
  scanMap(v.env, jobId, -1, 'container', into);
  const creds = v.credentials;
  if (isPlainObject(creds)) {
    scan(creds.username, jobId, -1, 'container', into);
    scan(creds.password, jobId, -1, 'container', into);
  }
}

/**
 * Extract every `secrets.<NAME>` reference used anywhere in the workflow —
 * workflow-level `env:`, and per job: `env:`, `if:`, `concurrency:` group,
 * `container:`/`services:` image/env/credentials, a reusable-call job's
 * `with:` inputs and explicit `secrets:` map, and per step: `env:`,
 * `with:`, `if:`, `run:`. Each hit carries the secret's NAME and
 * the matched raw expression text — never a value (no value exists here;
 * `secrets.*` resolves only at GitHub's own run time). For the auditor
 * question "which of these are dangerous" see DetectSecurityPatterns,
 * which flags the specific case of a secret embedded directly in a `run:`
 * script.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractSecretsUsage(ax: AxiomContext, input: Workflow): ExtractSecretsUsageResult {
  const out = new ExtractSecretsUsageResult();
  try {
    const { data, parseError } = parseWorkflow(input.getYaml());
    if (parseError !== null) {
      out.setError(parseError);
      return out;
    }
    if (!looksLikeWorkflow(data)) {
      out.setError('workflow is not a YAML mapping');
      return out;
    }
    const doc = data as Record<string, unknown>;
    const refs: SecretReference[] = [];

    scanMap(doc.env, '', -1, 'env', refs);

    for (const [jobId, job] of listJobEntries(doc)) {
      scanMap(job.env, jobId, -1, 'env', refs);
      scan(job.if, jobId, -1, 'if', refs);
      const conc = job.concurrency;
      if (typeof conc === 'string') scan(conc, jobId, -1, 'concurrency', refs);
      else if (isPlainObject(conc)) scan(conc.group, jobId, -1, 'concurrency', refs);
      scanContainerLike(job.container, jobId, refs);
      const services = job.services;
      if (isPlainObject(services)) {
        for (const svcKey of Object.keys(services)) scanContainerLike(services[svcKey], jobId, refs);
      }
      // Job-level `with:`/`secrets:` — only meaningful on a reusable-
      // workflow-call job, but harmless (a no-op scan) on any other job
      // that doesn't set them. secrets: "inherit" (the shorthand) is a
      // string, not a map, so scanMap correctly skips it — there is no
      // per-secret text to find in that form.
      scanMap(job.with, jobId, -1, 'with', refs);
      scanMap(job.secrets, jobId, -1, 'secrets', refs);

      asArray(job.steps).forEach((rawStep, index) => {
        if (!isPlainObject(rawStep)) return;
        scanMap(rawStep.env, jobId, index, 'env', refs);
        scanMap(rawStep.with, jobId, index, 'with', refs);
        scan(rawStep.if, jobId, index, 'if', refs);
        scan(rawStep.run, jobId, index, 'run', refs);
      });
    }

    out.setReferencesList(refs);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting secrets usage'));
    return out;
  }
}
