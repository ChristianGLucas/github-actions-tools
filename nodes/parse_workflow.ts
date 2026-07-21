import { Workflow, ParseWorkflowResult, JobBrief } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow as parseWorkflowYaml,
  looksLikeWorkflow,
  isPlainObject,
  listJobEntries,
  isReusableCallJob,
  jobRunsOn,
  jobNeeds,
  jobStepCount,
  asString,
  errorMessage,
  BoundsError,
} from './lib';

/**
 * Parse a GitHub Actions workflow file into its top-level structure: the
 * declared `name:`, the event names under `on:` (in document order), and a
 * brief per-job summary (id, name, runs-on, needs, whether the job is a
 * reusable-workflow call, step count). The quick "what does this pipeline
 * look like" overview — for a job's full attribute set use ListJobs, and
 * for one job's steps use GetJobSteps.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function parseWorkflow(ax: AxiomContext, input: Workflow): ParseWorkflowResult {
  const out = new ParseWorkflowResult();
  try {
    const { data, parseError } = parseWorkflowYaml(input.getYaml());
    if (parseError !== null) {
      out.setError(parseError);
      return out;
    }
    if (!looksLikeWorkflow(data)) {
      out.setError('workflow is not a YAML mapping');
      return out;
    }
    const doc = data as Record<string, unknown>;
    out.setName(asString(doc.name));

    const onValue = doc.on;
    const events: string[] = [];
    if (typeof onValue === 'string') {
      events.push(onValue);
    } else if (Array.isArray(onValue)) {
      for (const v of onValue) events.push(asString(v));
    } else if (isPlainObject(onValue)) {
      events.push(...Object.keys(onValue));
    }
    out.setTriggerEventsList(events.filter((e) => e !== ''));

    const jobs: JobBrief[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      const brief = new JobBrief();
      brief.setJobId(jobId);
      const name = asString(job.name);
      brief.setName(name !== '' ? name : jobId);
      brief.setRunsOnList(jobRunsOn(job));
      brief.setNeedsList(jobNeeds(job));
      brief.setIsReusableCall(isReusableCallJob(job));
      brief.setStepCount(jobStepCount(job));
      jobs.push(brief);
    }
    out.setJobsList(jobs);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'parsing workflow'));
    return out;
  }
}
