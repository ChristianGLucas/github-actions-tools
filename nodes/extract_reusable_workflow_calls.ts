import {
  Workflow,
  ExtractReusableWorkflowCallsResult,
  ReusableWorkflowCall,
  KeyValue,
} from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  isReusableCallJob,
  isPlainObject,
  asString,
  parseUsesRef,
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
 * Extract every job-level reusable-workflow call (a job whose own `uses:`
 * points at another workflow file, i.e. `workflow_call`) — decomposed like
 * ExtractActions (owner/repo/ref, sha-vs-floating-vs-local-path
 * classification), plus its `with:` inputs and `secrets:` (the `inherit`
 * shorthand, or the explicit map of secret name -> caller-side expression,
 * never a resolved value).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractReusableWorkflowCalls(ax: AxiomContext, input: Workflow): ExtractReusableWorkflowCallsResult {
  const out = new ExtractReusableWorkflowCallsResult();
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
    const calls: ReusableWorkflowCall[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      if (!isReusableCallJob(job)) continue;
      const raw = asString(job.uses);
      const parsed = parseUsesRef(raw);
      const call = new ReusableWorkflowCall();
      call.setJobId(jobId);
      call.setRawUses(raw);
      call.setRefKind(parsed.refKind);
      call.setIsShaPinned(parsed.isShaPinned);
      call.setIsLocalPath(parsed.isLocalPath);
      call.setWithList(kvMessages(mapToSortedKVs(job.with)));

      const secrets = job.secrets;
      if (secrets === 'inherit') {
        call.setSecretsInherit(true);
      } else if (isPlainObject(secrets)) {
        call.setSecretsList(kvMessages(mapToSortedKVs(secrets)));
      }
      calls.push(call);
    }
    out.setCallsList(calls);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting reusable workflow calls'));
    return out;
  }
}
