import { JobRequest, GetJobStepsResult, StepInfo, KeyValue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  isPlainObject,
  asArray,
  asString,
  mapToSortedKVs,
  resolveStepDefault,
  errorMessage,
  BoundsError,
} from './lib';

function kvMessages(pairs: { key: string; value: string }[]): KeyValue[] {
  return pairs.map((kv) => {
    const m = new KeyValue();
    m.setKey(kv.key);
    m.setValue(kv.value);
    return m;
  });
}

/**
 * Extract one job's `steps:` list in order: each step's 0-based index, its
 * own `id:`, `name:`, `uses:` (for an action step) or `run:` (for a run
 * step), the effective `shell:`/`working-directory:` resolved through the
 * documented step -> job -> workflow defaults.run fallback chain, `with:`
 * inputs, `env:`, `if:`, `continue-on-error:`, and `timeout-minutes:`.
 * found is false when job_id names a job that does not exist in the
 * workflow, or the job has no `steps:` (a reusable-workflow-call job).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function getJobSteps(ax: AxiomContext, input: JobRequest): GetJobStepsResult {
  const out = new GetJobStepsResult();
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
    const jobId = input.getJobId();
    if (jobId === '') {
      out.setError('job_id is required');
      return out;
    }
    const jobsMap = doc.jobs;
    const job = isPlainObject(jobsMap) ? jobsMap[jobId] : undefined;
    if (!isPlainObject(job)) {
      out.setError(`job "${jobId}" not found`);
      return out;
    }

    const steps: StepInfo[] = [];
    const rawSteps = asArray(job.steps);
    rawSteps.forEach((rawStep, index) => {
      if (!isPlainObject(rawStep)) return;
      const si = new StepInfo();
      si.setIndex(index);
      si.setStepId(asString(rawStep.id));
      si.setName(asString(rawStep.name));
      si.setUses(asString(rawStep.uses));
      const run = asString(rawStep.run);
      si.setRun(run);
      // shell/working-directory only apply to a run step — an action
      // (`uses:`) step ignores them entirely, so resolving the fallback
      // chain for one would report a value that plays no actual role.
      if (run !== '') {
        si.setShell(resolveStepDefault(rawStep, job, doc, 'shell'));
        si.setWorkingDirectory(resolveStepDefault(rawStep, job, doc, 'working-directory'));
      }
      si.setWithList(kvMessages(mapToSortedKVs(rawStep.with)));
      si.setEnvList(kvMessages(mapToSortedKVs(rawStep.env)));
      si.setIfCondition(asString(rawStep.if));

      const cont = rawStep['continue-on-error'];
      if (typeof cont === 'boolean') {
        si.setContinueOnError(cont);
        si.setContinueOnErrorSpecified(true);
      }
      const timeout = rawStep['timeout-minutes'];
      if (typeof timeout === 'number') {
        si.setTimeoutMinutes(timeout);
        si.setTimeoutMinutesSpecified(true);
      }
      steps.push(si);
    });

    out.setFound(true);
    out.setStepsList(steps);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'getting job steps'));
    return out;
  }
}
