import { Workflow, ExtractEnvVarsResult, JobEnv, StepEnv, KeyValue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  isPlainObject,
  asArray,
  asString,
  mapToSortedKVs,
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
 * Extract every `env:` block declared across the workflow: the
 * workflow-level block, each job's block, and each step's block —
 * unresolved, exactly as written (an env value that is itself an
 * expression, e.g. `${{ secrets.X }}` or `${{ vars.Y }}`, is returned as
 * that literal expression text, never evaluated). For a filtered view of
 * just the `secrets.*`-referencing subset, see ExtractSecretsUsage.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractEnvVars(ax: AxiomContext, input: Workflow): ExtractEnvVarsResult {
  const out = new ExtractEnvVarsResult();
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
    out.setWorkflowEnvList(kvMessages(mapToSortedKVs(doc.env)));

    const jobEnvs: JobEnv[] = [];
    const stepEnvs: StepEnv[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      const je = new JobEnv();
      je.setJobId(jobId);
      je.setEnvList(kvMessages(mapToSortedKVs(job.env)));
      jobEnvs.push(je);

      asArray(job.steps).forEach((rawStep, index) => {
        if (!isPlainObject(rawStep)) return;
        if (!isPlainObject(rawStep.env)) return;
        const se = new StepEnv();
        se.setJobId(jobId);
        se.setStepIndex(index);
        se.setStepName(asString(rawStep.name));
        se.setEnvList(kvMessages(mapToSortedKVs(rawStep.env)));
        stepEnvs.push(se);
      });
    }
    out.setJobEnvList(jobEnvs);
    out.setStepEnvList(stepEnvs);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting env vars'));
    return out;
  }
}
