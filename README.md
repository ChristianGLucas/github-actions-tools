# github-actions-tools

Deterministic, **GitHub-Actions-semantic** parsing and inspection of GitHub
Actions workflow YAML (`.github/workflows/*.yml`) — built for the
[Axiom](https://axiomide.com) marketplace, handle `christiangeorgelucas`.

This is deliberately distinct from generic YAML/JSON conversion (see
[`dataformat-tools`](https://github.com/ChristianGLucas/dataformat-tools)) and
from other config-file packages (`config-tools`, `dockerfile-tools`,
`k8s-manifest-tools`): this package understands the GitHub Actions workflow
schema — `on:`/`jobs:`/`steps:`/`uses:`/`strategy:`/`permissions:` — and pulls
out exactly what a CI/CD-auditing agent needs, rather than converting text
between formats.

The workflow file is always supplied as text by the caller — there is no
GitHub API call, no git checkout, no network, no wall-clock, and no
randomness. Every node is a pure, deterministic function of its input.

## Use it from your agent or app

Every node in this package is a **live, auto-scaling API endpoint** on the
[Axiom](https://axiomide.com) marketplace — call it from an AI agent or your own
code, with nothing to self-host.

**📦 See it on the marketplace:**
https://dev.axiomide.com/marketplace/christiangeorgelucas/github-actions-tools@0.1.0

**Hook it up to an AI agent (MCP).** Add Axiom's hosted MCP server to any MCP
client and every node becomes a typed tool your agent can call — search the
catalog, inspect a schema, and invoke it directly.

```bash
# Claude Code
claude mcp add --transport http axiom https://api.axiomide.com/mcp \
  --header "Authorization: Bearer $AXIOM_API_KEY"
```

Claude Desktop, Cursor, or any config-based client:

```json
{
  "mcpServers": {
    "axiom": {
      "type": "http",
      "url": "https://api.axiomide.com/mcp",
      "headers": { "Authorization": "Bearer YOUR_AXIOM_API_KEY" }
    }
  }
}
```

**Call it from the CLI.**

```bash
axiom invoke christiangeorgelucas/github-actions-tools/ParseWorkflow --input '{ ... }'
```

**Call it over HTTP.**

```bash
curl -X POST https://api.axiomide.com/invocations/v1/nodes/christiangeorgelucas/github-actions-tools/0.1.0/ParseWorkflow \
  -H "Authorization: Bearer $AXIOM_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ ... }'
```

> Input/output schema for each node is on the marketplace page above, or via
> `axiom inspect node christiangeorgelucas/github-actions-tools/ParseWorkflow`.

### Get started free

Install the CLI:

```bash
# macOS / Linux — Homebrew
brew install axiomide/tap/axiom

# macOS / Linux — install script
curl -fsSL https://raw.githubusercontent.com/AxiomIDE/axiom-releases/main/install.sh | sh
```

**Windows:** download the `windows/amd64` `.zip` from the
[releases page](https://github.com/AxiomIDE/axiom-releases/releases), unzip it,
and put `axiom.exe` on your `PATH`.

Then `axiom version` to verify, `axiom login` (GitHub or Google) to authenticate,
and create an API key under **Console → API Keys**. Docs and sign-up at
**[axiomide.com](https://axiomide.com)**.

## Nodes

- **ParseWorkflow** — top-level overview: name, `on:` trigger event names, and
  a brief per-job summary.
- **ExtractTriggers** — every `on:` event with its filters (branches/tags/
  paths(-ignore)/types, `schedule:`'s cron list, workflow_dispatch/
  workflow_call's declared inputs).
- **ListJobs** — every job's full attribute set (runs-on, needs, if, timeout,
  continue-on-error, environment, concurrency, container image, reusable-call
  target, permissions, step count).
- **GetJobSteps** — one job's steps in order, with `shell`/`working-directory`
  resolved through the documented step → job → workflow `defaults.run`
  fallback chain.
- **ExtractActions** — every third-party action (`uses:`) referenced across
  the workflow, decomposed into owner/repo/sub_path/ref and classified as
  SHA-pinned vs floating (tag/branch) vs local-path vs Docker-image — the key
  node for supply-chain auditing.
- **ExtractJobDependencies** — the `needs:` graph as an edge list, ready for
  topological analysis.
- **ExtractMatrixStrategy** — a job's `strategy.matrix` (dimensions +
  include/exclude) and fail-fast/max-parallel.
- **ExtractSecretsUsage** — every `secrets.<NAME>` reference anywhere in the
  workflow, with its location — names only, never a value.
- **ExtractEnvVars** — every `env:` block (workflow/job/step level).
- **ExtractPermissions** — the workflow-level and every job-level
  `permissions:` block, normalized to one shape.
- **ExtractRunCommands** — every `run:` script, tagged with its resolved
  effective shell.
- **DetectRunners** — each job's `runs-on:` labels, flagging matrix-driven/
  dynamic runners, plus the distinct label set used across the workflow.
- **ExtractReusableWorkflowCalls** — every job-level `uses:` (workflow_call)
  with its `with:`/`secrets:` shape.
- **SummarizeWorkflow** — job/step/trigger/action counts.
- **ValidateWorkflow** — basic structural correctness (`on:`, `jobs:`, each
  job has `runs-on:` or `uses:`), reporting every violation found.
- **DetectSecurityPatterns** — three security-relevant patterns as structured
  FACTS, never opinionated lint: unpinned (non-SHA) third-party actions,
  `pull_request_target` trigger usage, and `secrets.*` embedded directly in a
  `run:` script.

## Implementation

Parsing is done with [`js-yaml`](https://github.com/nodeca/js-yaml) (MIT),
using its default `CORE_SCHEMA` — safe by construction, since js-yaml v4+ has
no tag capable of constructing an arbitrary JS object or executing code (no
`!!js/function`, no `!!js/regexp`). Explicit `maxDepth`/`maxAliases` bounds
are set on every parse call as defense-in-depth, on top of this package's own
2 MB byte-size ceiling. All GitHub-Actions-workflow-schema knowledge (which
field, at which path, means "job", "step", "trigger filter", "matrix
dimension", "reusable-workflow call") is this package's own code — not a
wrapped GitHub client.

A workflow file is a single YAML document (unlike a Kubernetes manifest,
there is no `---`-multi-document convention here); a malformed or oversized
document returns a structured error, never a crash.

`DetectSecurityPatterns` reports facts, not opinions — it never assigns a
severity; deciding whether a given occurrence is actually risky in its
context is left to the caller/agent.

## License

MIT — see [LICENSE](LICENSE).
