import {
  JobRequest,
  ExtractMatrixStrategyResult,
  MatrixDimension,
  MatrixCombination,
  KeyValue,
} from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { parseWorkflow, looksLikeWorkflow, isPlainObject, asArray, matrixValueToString, errorMessage, BoundsError } from './lib';

function combinationsToMessages(entries: unknown[]): MatrixCombination[] {
  const out: MatrixCombination[] = [];
  for (const entry of entries) {
    if (!isPlainObject(entry)) continue;
    const combo = new MatrixCombination();
    const kvs: KeyValue[] = [];
    for (const key of Object.keys(entry)) {
      const kv = new KeyValue();
      kv.setKey(key);
      kv.setValue(matrixValueToString(entry[key]));
      kvs.push(kv);
    }
    combo.setEntriesList(kvs);
    out.push(combo);
  }
  return out;
}

/**
 * Extract one job's `strategy:` matrix: each dimension's key and its raw
 * (stringified) value list — skipping the reserved `include`/`exclude`
 * keys, which are returned separately as explicit combinations — plus
 * `fail-fast` and `max-parallel`. found is false when the job has no
 * `strategy:` at all, or job_id does not exist in the workflow (see
 * error). has_matrix is false when `strategy:` exists but has no
 * `matrix:` sub-key (e.g. a bare `strategy: {max-parallel: 2}`).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractMatrixStrategy(ax: AxiomContext, input: JobRequest): ExtractMatrixStrategyResult {
  const out = new ExtractMatrixStrategyResult();
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
    const strategy = job.strategy;
    if (!isPlainObject(strategy)) {
      // found=false, everything else stays at its zero value.
      return out;
    }
    out.setFound(true);

    const failFast = strategy['fail-fast'];
    if (typeof failFast === 'boolean') {
      out.setFailFast(failFast);
      out.setFailFastSpecified(true);
    } else {
      out.setFailFast(true); // GitHub's own default when strategy: is present.
    }
    const maxParallel = strategy['max-parallel'];
    if (typeof maxParallel === 'number') {
      out.setMaxParallel(maxParallel);
      out.setMaxParallelSpecified(true);
    }

    const matrix = strategy.matrix;
    if (!isPlainObject(matrix)) {
      return out;
    }
    out.setHasMatrix(true);

    const dimensions: MatrixDimension[] = [];
    for (const key of Object.keys(matrix)) {
      if (key === 'include' || key === 'exclude') continue;
      const dim = new MatrixDimension();
      dim.setKey(key);
      dim.setValuesList(asArray(matrix[key]).map(matrixValueToString));
      dimensions.push(dim);
    }
    out.setDimensionsList(dimensions);
    out.setIncludeList(combinationsToMessages(asArray(matrix.include)));
    out.setExcludeList(combinationsToMessages(asArray(matrix.exclude)));
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting matrix strategy'));
    return out;
  }
}
