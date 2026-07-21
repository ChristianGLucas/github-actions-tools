import { Workflow, ListJobsResult, JobInfo, PermissionsBlock, KeyValue } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  isReusableCallJob,
  jobRunsOn,
  jobNeeds,
  jobStepCount,
  asString,
  parsePermissions,
  environmentName,
  parseConcurrency,
  containerImage,
  errorMessage,
  BoundsError,
} from './lib';

function permissionsMessage(job: Record<string, unknown>): PermissionsBlock {
  const parsed = parsePermissions(job.permissions);
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
 * List every job in a workflow with its full attribute set: id, name,
 * runs-on, needs, the raw `if:` condition, timeout-minutes,
 * continue-on-error, the `environment:` name, the `concurrency:` group,
 * the `container:` image, whether the job is a reusable-workflow call (+
 * its target), the job's `permissions:` block, and its step count. The
 * dedicated, deep job registry — for a lighter whole-workflow overview use
 * ParseWorkflow instead.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function listJobs(ax: AxiomContext, input: Workflow): ListJobsResult {
  const out = new ListJobsResult();
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
    const jobs: JobInfo[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      const info = new JobInfo();
      info.setJobId(jobId);
      const name = asString(job.name);
      info.setName(name !== '' ? name : jobId);
      info.setRunsOnList(jobRunsOn(job));
      info.setNeedsList(jobNeeds(job));
      info.setIfCondition(asString(job.if));

      const timeout = job['timeout-minutes'];
      if (typeof timeout === 'number') {
        info.setTimeoutMinutes(timeout);
        info.setTimeoutMinutesSpecified(true);
      }

      const cont = job['continue-on-error'];
      if (typeof cont === 'boolean') {
        info.setContinueOnError(cont);
        info.setContinueOnErrorSpecified(true);
      }

      info.setEnvironmentName(environmentName(job.environment));

      const conc = parseConcurrency(job.concurrency);
      info.setConcurrencyGroup(conc.group);
      info.setConcurrencyCancelInProgress(conc.cancelInProgress);
      info.setConcurrencySpecified(conc.specified);

      info.setContainerImage(containerImage(job.container));

      const reusable = isReusableCallJob(job);
      info.setIsReusableCall(reusable);
      info.setReusableWorkflowRef(reusable ? asString(job.uses) : '');

      info.setPermissions(permissionsMessage(job));
      info.setStepCount(jobStepCount(job));
      jobs.push(info);
    }
    out.setJobsList(jobs);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'listing jobs'));
    return out;
  }
}
