import { Workflow } from '../gen/messages_pb';
import { detectRunners } from './detect_runners';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('DetectRunners', () => {
  it('detects each job\'s runner labels and the distinct set across the workflow', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = detectRunners(ctx, input);
    expect(result.getError()).toBe('');
    const jobs = result.getJobsList();
    expect(jobs.map((j) => j.getJobId())).toEqual(['build', 'lint', 'publish', 'notify']);

    expect(jobs[0].getRunsOnList()).toEqual(['ubuntu-latest']);
    expect(jobs[0].getIsDynamic()).toBe(false);
    expect(jobs[1].getRunsOnList()).toEqual(['self-hosted', 'linux', 'x64']);
    expect(jobs[2].getRunsOnList()).toEqual([]); // reusable call, no runs-on

    expect(result.getDistinctLabelsList()).toEqual(['linux', 'self-hosted', 'ubuntu-latest', 'x64']);
  });

  it('flags a matrix-driven runs-on expression as dynamic and excludes it from distinct_labels', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ${{ matrix.os }}\n    strategy:\n      matrix:\n        os: [ubuntu-latest]\n    steps:\n      - run: echo hi\n',
    );
    const result = detectRunners(ctx, input);
    const job = result.getJobsList()[0];
    expect(job.getRunsOnList()).toEqual(['${{ matrix.os }}']);
    expect(job.getIsDynamic()).toBe(true);
    expect(result.getDistinctLabelsList()).toEqual([]);
  });
});
