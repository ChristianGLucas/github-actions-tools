import { Workflow, DetectRunnersResult, RunnerUsage } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseWorkflow, looksLikeWorkflow, listJobEntries, jobRunsOn, errorMessage, BoundsError } from './lib';

/**
 * Detect which runner labels (`runs-on:` values) each job uses. Flags a
 * job as dynamic when any of its labels is an unevaluated `${{ ... }}`
 * expression (typically a matrix-driven `runs-on: ${{ matrix.os }}`) — the
 * actual runner cannot be known without evaluating the expression, which
 * this package never does. distinct_labels is the alphabetically-sorted
 * set of every literal (non-expression) label used anywhere in the
 * workflow — the quick "which OS/runner families does this pipeline
 * touch" answer.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function detectRunners(ax: AxiomContext, input: Workflow): DetectRunnersResult {
  const out = new DetectRunnersResult();
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
    const jobs: RunnerUsage[] = [];
    const distinct = new Set<string>();
    for (const [jobId, job] of listJobEntries(doc)) {
      const labels = jobRunsOn(job);
      const isDynamic = labels.some((l) => l.includes('${{'));
      const usage = new RunnerUsage();
      usage.setJobId(jobId);
      usage.setRunsOnList(labels);
      usage.setIsDynamic(isDynamic);
      jobs.push(usage);
      for (const label of labels) {
        if (!label.includes('${{')) distinct.add(label);
      }
    }
    out.setJobsList(jobs);
    out.setDistinctLabelsList(Array.from(distinct).sort());
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'detecting runners'));
    return out;
  }
}
