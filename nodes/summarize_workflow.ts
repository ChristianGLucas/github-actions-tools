import { Workflow, SummarizeWorkflowResult } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  isPlainObject,
  listJobEntries,
  isReusableCallJob,
  asArray,
  asString,
  errorMessage,
  BoundsError,
} from './lib';

/**
 * Summarize a workflow: job count, total step count, the number of trigger
 * events under `on:`, the number of action-step (`uses:` at step level)
 * invocations (total and distinct raw `uses:` values), the number of
 * run-steps, and the number of jobs that are reusable-workflow calls. A
 * quick "how big/what shape is this pipeline" overview.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function summarizeWorkflow(ax: AxiomContext, input: Workflow): SummarizeWorkflowResult {
  const out = new SummarizeWorkflowResult();
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

    const onValue = doc.on;
    let triggerCount = 0;
    if (typeof onValue === 'string') {
      triggerCount = onValue === '' ? 0 : 1;
    } else if (Array.isArray(onValue)) {
      triggerCount = onValue.filter((v) => asString(v) !== '').length;
    } else if (isPlainObject(onValue)) {
      triggerCount = Object.keys(onValue).length;
    }
    out.setTriggerEventCount(triggerCount);

    let jobCount = 0;
    let stepCount = 0;
    let actionStepCount = 0;
    let runStepCount = 0;
    let reusableCallCount = 0;
    const distinctActions = new Set<string>();

    for (const [, job] of listJobEntries(doc)) {
      jobCount += 1;
      if (isReusableCallJob(job)) reusableCallCount += 1;
      const steps = asArray(job.steps);
      for (const rawStep of steps) {
        if (!isPlainObject(rawStep)) continue;
        stepCount += 1;
        const uses = asString(rawStep.uses);
        const run = asString(rawStep.run);
        if (uses !== '') {
          actionStepCount += 1;
          distinctActions.add(uses);
        }
        if (run !== '') runStepCount += 1;
      }
    }

    out.setJobCount(jobCount);
    out.setStepCount(stepCount);
    out.setActionStepCount(actionStepCount);
    out.setDistinctActionCount(distinctActions.size);
    out.setRunStepCount(runStepCount);
    out.setReusableCallCount(reusableCallCount);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'summarizing workflow'));
    return out;
  }
}
