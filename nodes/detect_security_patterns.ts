import { Workflow, DetectSecurityPatternsResult, SecurityFinding } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  isPlainObject,
  listJobEntries,
  asArray,
  asString,
  parseUsesRef,
  findSecretReferences,
  errorMessage,
  BoundsError,
} from './lib';

function finding(jobId: string, stepIndex: number, pattern: string, detail: string): SecurityFinding {
  const f = new SecurityFinding();
  f.setJobId(jobId);
  f.setStepIndex(stepIndex);
  f.setPattern(pattern);
  f.setDetail(detail);
  return f;
}

/**
 * Detect three security-relevant patterns as structured FACTS — this node
 * never assigns a severity or opinion, it only reports that a pattern is
 * present and where; judging whether a given occurrence is actually risky
 * in its context is left to the caller/agent:
 *  - "unpinned_action": a step-level third-party action (`uses:`, not a
 *    local path or Docker image) whose ref is not a 40-character commit
 *    SHA (i.e. a floating tag or branch name, or no @ref at all).
 *  - "pull_request_target_trigger": the workflow's `on:` includes
 *    `pull_request_target`.
 *  - "secret_in_run_command": a `run:` step script contains a
 *    `secrets.<NAME>` reference (embedding a secret directly in a shell
 *    script is a common script-injection vector, since the expression is
 *    substituted into the script text before the shell ever runs).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function detectSecurityPatterns(ax: AxiomContext, input: Workflow): DetectSecurityPatternsResult {
  const out = new DetectSecurityPatternsResult();
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
    const findings: SecurityFinding[] = [];

    const onValue = doc.on;
    let hasPullRequestTarget = false;
    if (typeof onValue === 'string') {
      hasPullRequestTarget = onValue === 'pull_request_target';
    } else if (Array.isArray(onValue)) {
      hasPullRequestTarget = onValue.some((v) => asString(v) === 'pull_request_target');
    } else if (isPlainObject(onValue)) {
      hasPullRequestTarget = Object.prototype.hasOwnProperty.call(onValue, 'pull_request_target');
    }
    if (hasPullRequestTarget) {
      findings.push(finding('', -1, 'pull_request_target_trigger', 'workflow triggers on pull_request_target'));
    }

    for (const [jobId, job] of listJobEntries(doc)) {
      asArray(job.steps).forEach((rawStep, index) => {
        if (!isPlainObject(rawStep)) return;

        const uses = asString(rawStep.uses);
        if (uses !== '') {
          const parsed = parseUsesRef(uses);
          if (!parsed.isLocalPath && !parsed.isDocker && parsed.refKind !== 'sha') {
            findings.push(finding(jobId, index, 'unpinned_action', uses));
          }
        }

        const run = asString(rawStep.run);
        if (run !== '') {
          const seen = new Set<string>();
          for (const hit of findSecretReferences(run)) {
            if (seen.has(hit.name)) continue;
            seen.add(hit.name);
            findings.push(finding(jobId, index, 'secret_in_run_command', `secrets.${hit.name} referenced in run: script`));
          }
        }
      });
    }

    out.setFindingsList(findings);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'detecting security patterns'));
    return out;
  }
}
