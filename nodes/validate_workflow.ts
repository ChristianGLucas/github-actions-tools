import { Workflow, ValidateWorkflowResult, WorkflowIssue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  isPlainObject,
  listJobEntries,
  isReusableCallJob,
  jobRunsOn,
  errorMessage,
  BoundsError,
} from './lib';

function issue(path: string, message: string): WorkflowIssue {
  const i = new WorkflowIssue();
  i.setPath(path);
  i.setMessage(message);
  return i;
}

/**
 * Validate a workflow's basic structural correctness: it must have a
 * top-level `on:` key, a non-empty `jobs:` mapping, and every job must
 * declare either `runs-on:` or a job-level `uses:` (a reusable-workflow
 * call). Reports every violation found, not just the first. valid is true
 * only when the issues list is empty. This checks STRUCTURE only — it is
 * not a full GitHub Actions workflow schema validator (it does not, for
 * example, check that an `uses:` string or a cron expression is
 * well-formed).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function validateWorkflow(ax: AxiomContext, input: Workflow): ValidateWorkflowResult {
  const out = new ValidateWorkflowResult();
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
    const issues: WorkflowIssue[] = [];

    if (doc.on === undefined) {
      issues.push(issue('on', 'workflow is missing the required "on:" trigger key'));
    }

    const jobsMap = doc.jobs;
    if (!isPlainObject(jobsMap) || Object.keys(jobsMap).length === 0) {
      issues.push(issue('jobs', 'workflow is missing a non-empty "jobs:" mapping'));
    } else {
      for (const [jobId, job] of listJobEntries(doc)) {
        const hasRunsOn = jobRunsOn(job).length > 0;
        const isReusable = isReusableCallJob(job);
        if (!hasRunsOn && !isReusable) {
          issues.push(issue(`jobs.${jobId}`, `job "${jobId}" has neither "runs-on:" nor a job-level "uses:"`));
        }
      }
    }

    out.setValid(issues.length === 0);
    out.setIssuesList(issues);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'validating workflow'));
    return out;
  }
}
