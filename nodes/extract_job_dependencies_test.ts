import { Workflow } from '../gen/messages_pb';
import { extractJobDependencies } from './extract_job_dependencies';
import { ctx, FIXTURE_WORKFLOW, FIXTURE_JOB_IDS_ORACLE } from './testkit';

describe('ExtractJobDependencies', () => {
  it('extracts the full job_ids set and every needs: edge', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractJobDependencies(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getJobIdsList()).toEqual(FIXTURE_JOB_IDS_ORACLE);

    const edges = result.getEdgesList().map((e) => [e.getJobId(), e.getDependsOn()]);
    expect(edges).toEqual([
      ['lint', 'build'],
      ['publish', 'build'],
      ['publish', 'lint'],
      ['notify', 'publish'],
    ]);
  });

  it('includes jobs with no needs: at all in job_ids with zero edges', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  solo:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractJobDependencies(ctx, input);
    expect(result.getJobIdsList()).toEqual(['solo']);
    expect(result.getEdgesList()).toHaveLength(0);
  });
});
