import { Workflow } from '../gen/messages_pb';
import { parseWorkflow } from './parse_workflow';
import {
  ctx,
  FIXTURE_WORKFLOW,
  FIXTURE_TRIGGER_EVENTS_ORACLE,
  FIXTURE_JOB_IDS_ORACLE,
  MINIMAL_WORKFLOW,
  NOT_A_MAPPING_WORKFLOW,
  UNPARSEABLE_YAML,
} from './testkit';

describe('ParseWorkflow', () => {
  it('parses name, trigger event order, and a brief per-job summary', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = parseWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getName()).toBe('CI');
    expect(result.getTriggerEventsList()).toEqual(FIXTURE_TRIGGER_EVENTS_ORACLE);

    const jobs = result.getJobsList();
    expect(jobs.map((j) => j.getJobId())).toEqual(FIXTURE_JOB_IDS_ORACLE);

    const build = jobs[0];
    expect(build.getName()).toBe('Build and test');
    expect(build.getRunsOnList()).toEqual(['ubuntu-latest']);
    expect(build.getNeedsList()).toEqual([]);
    expect(build.getIsReusableCall()).toBe(false);
    expect(build.getStepCount()).toBe(7);

    const lint = jobs[1];
    // No name: set -> defaults to the job id.
    expect(lint.getName()).toBe('lint');
    expect(lint.getRunsOnList()).toEqual(['self-hosted', 'linux', 'x64']);
    expect(lint.getNeedsList()).toEqual(['build']);
    expect(lint.getStepCount()).toBe(1);

    const publish = jobs[2];
    expect(publish.getName()).toBe('publish');
    expect(publish.getRunsOnList()).toEqual([]);
    expect(publish.getNeedsList()).toEqual(['build', 'lint']);
    expect(publish.getIsReusableCall()).toBe(true);
    expect(publish.getStepCount()).toBe(0);

    const notify = jobs[3];
    expect(notify.getIsReusableCall()).toBe(true);
    expect(notify.getNeedsList()).toEqual(['publish']);
  });

  it('defaults name to "" for a workflow with no name: key', () => {
    const input = new Workflow();
    input.setYaml(MINIMAL_WORKFLOW);
    const result = parseWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getName()).toBe('');
    expect(result.getTriggerEventsList()).toEqual(['push']);
  });

  it('returns a structured error for a document that is not a mapping', () => {
    const input = new Workflow();
    input.setYaml(NOT_A_MAPPING_WORKFLOW);
    const result = parseWorkflow(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getJobsList()).toHaveLength(0);
  });

  it('returns a structured error for unparseable YAML, never a crash', () => {
    const input = new Workflow();
    input.setYaml(UNPARSEABLE_YAML);
    const result = parseWorkflow(ctx, input);
    expect(result.getError()).not.toBe('');
  });

  it('rejects oversized input with a structured error', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: ' + 'x'.repeat(2_100_000));
    const result = parseWorkflow(ctx, input);
    expect(result.getError()).toMatch(/exceeds/);
  });

  it('is deterministic across repeated calls on the same input', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const r1 = parseWorkflow(ctx, input);
    const r2 = parseWorkflow(ctx, input);
    expect(r1.getJobsList().map((j) => j.getJobId())).toEqual(r2.getJobsList().map((j) => j.getJobId()));
  });
});
