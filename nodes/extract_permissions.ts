import { Workflow, ExtractPermissionsResult, JobPermissions, PermissionsBlock, KeyValue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseWorkflow, looksLikeWorkflow, listJobEntries, parsePermissions, errorMessage, BoundsError } from './lib';

function permissionsMessage(v: unknown): PermissionsBlock {
  const parsed = parsePermissions(v);
  const pb = new PermissionsBlock();
  pb.setMode(parsed.mode);
  pb.setScopesList(
    parsed.scopes.map((kv) => {
      const m = new KeyValue();
      m.setKey(kv.key);
      m.setValue(kv.value);
      return m;
    }),
  );
  return pb;
}

/**
 * Extract the workflow-level `permissions:` block and every job-level
 * `permissions:` block, each normalized to a single shape regardless of
 * how it was declared: mode is "unspecified" (key absent — GitHub then
 * applies the repository's default), "read-all", "write-all", "none"
 * (written as `permissions: {}`), or "scoped" (an explicit
 * permission -> level map, returned in scopes).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractPermissions(ax: AxiomContext, input: Workflow): ExtractPermissionsResult {
  const out = new ExtractPermissionsResult();
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
    out.setWorkflowPermissions(permissionsMessage(doc.permissions));

    const jobPerms: JobPermissions[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      const jp = new JobPermissions();
      jp.setJobId(jobId);
      jp.setPermissions(permissionsMessage(job.permissions));
      jobPerms.push(jp);
    }
    out.setJobPermissionsList(jobPerms);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting permissions'));
    return out;
  }
}
