import { Workflow } from '../gen/messages_pb';
import { summarizeWorkflow } from './summarize_workflow';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('SummarizeWorkflow', () => {
  it('summarizes the fixture workflow correctly', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = summarizeWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getJobCount()).toBe(4);
    // build: 7 steps, lint: 1 step, publish/notify: 0 (reusable calls).
    expect(result.getStepCount()).toBe(8);
    expect(result.getTriggerEventCount()).toBe(6);
    // build's 4 uses-steps: checkout, setup-node, local action, docker.
    expect(result.getActionStepCount()).toBe(4);
    expect(result.getDistinctActionCount()).toBe(4);
    // build: Install, Build, Deploy secret leak (3); lint: npm run lint (1).
    expect(result.getRunStepCount()).toBe(4);
    expect(result.getReusableCallCount()).toBe(2);
  });

  it('counts a repeated identical uses: as 1 distinct but 2 action steps', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/checkout@v4\n',
    );
    const result = summarizeWorkflow(ctx, input);
    expect(result.getActionStepCount()).toBe(2);
    expect(result.getDistinctActionCount()).toBe(1);
  });

  it('all-zero summary (not an error) for a workflow with an empty job', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n');
    const result = summarizeWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getJobCount()).toBe(1);
    expect(result.getStepCount()).toBe(0);
  });
});
