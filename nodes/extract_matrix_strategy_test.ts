import { JobRequest } from '../gen/messages_pb';
import { extractMatrixStrategy } from './extract_matrix_strategy';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ExtractMatrixStrategy', () => {
  it("extracts the build job's full matrix strategy", () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('build');
    const result = extractMatrixStrategy(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getFound()).toBe(true);
    expect(result.getHasMatrix()).toBe(true);
    expect(result.getFailFast()).toBe(false);
    expect(result.getFailFastSpecified()).toBe(true);
    expect(result.getMaxParallel()).toBe(2);
    expect(result.getMaxParallelSpecified()).toBe(true);

    const dims = result.getDimensionsList().map((d) => [d.getKey(), d.getValuesList()]);
    expect(dims).toEqual([
      ['os', ['ubuntu-latest', 'macos-latest']],
      ['node', ['18', '20']],
    ]);

    const include = result.getIncludeList().map((c) => c.getEntriesList().map((kv) => [kv.getKey(), kv.getValue()]));
    expect(include).toEqual([
      [
        ['os', 'ubuntu-latest'],
        ['node', '20'],
        ['coverage', 'true'],
      ],
    ]);

    const exclude = result.getExcludeList().map((c) => c.getEntriesList().map((kv) => [kv.getKey(), kv.getValue()]));
    expect(exclude).toEqual([
      [
        ['os', 'macos-latest'],
        ['node', '18'],
      ],
    ]);
  });

  it('found=false, has_matrix=false for a job with no strategy: at all', () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('lint');
    const result = extractMatrixStrategy(ctx, input);
    expect(result.getFound()).toBe(false);
    expect(result.getHasMatrix()).toBe(false);
    expect(result.getDimensionsList()).toHaveLength(0);
    expect(result.getFailFastSpecified()).toBe(false);
  });

  it('defaults fail_fast to true (GitHub default) when strategy: is present but fail-fast: is not', () => {
    const input = new JobRequest();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        node: [18, 20]\n    steps:\n      - run: echo hi\n',
    );
    input.setJobId('build');
    const result = extractMatrixStrategy(ctx, input);
    expect(result.getFound()).toBe(true);
    expect(result.getFailFast()).toBe(true);
    expect(result.getFailFastSpecified()).toBe(false);
  });

  it('found=false with a structured error for a nonexistent job', () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('nope');
    const result = extractMatrixStrategy(ctx, input);
    expect(result.getFound()).toBe(false);
    expect(result.getError()).not.toBe('');
  });
});
