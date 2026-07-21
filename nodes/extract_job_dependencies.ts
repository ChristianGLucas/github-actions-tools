import { Workflow, ExtractJobDependenciesResult, JobDependencyEdge } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseWorkflow, looksLikeWorkflow, listJobEntries, jobNeeds, errorMessage, BoundsError } from './lib';

/**
 * Extract the workflow's job dependency graph (`needs:` relationships) as
 * an edge list — one JobDependencyEdge per (job, depends_on) pair — plus
 * the full set of job ids in the workflow (including jobs with no `needs:`
 * at all), ready for topological-sort / DAG analysis. The graph-shaped
 * counterpart of ListJobs's per-job `needs` attribute.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractJobDependencies(ax: AxiomContext, input: Workflow): ExtractJobDependenciesResult {
  const out = new ExtractJobDependenciesResult();
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
    const jobIds: string[] = [];
    const edges: JobDependencyEdge[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      jobIds.push(jobId);
      for (const dep of jobNeeds(job)) {
        const edge = new JobDependencyEdge();
        edge.setJobId(jobId);
        edge.setDependsOn(dep);
        edges.push(edge);
      }
    }
    out.setJobIdsList(jobIds);
    out.setEdgesList(edges);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting job dependencies'));
    return out;
  }
}
