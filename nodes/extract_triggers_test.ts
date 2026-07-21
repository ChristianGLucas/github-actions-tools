import { Workflow } from '../gen/messages_pb';
import { extractTriggers } from './extract_triggers';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ExtractTriggers', () => {
  it('extracts every on: event with its correct filters, in document order', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractTriggers(ctx, input);
    expect(result.getError()).toBe('');
    const triggers = result.getTriggersList();
    expect(triggers.map((t) => t.getEvent())).toEqual([
      'push',
      'pull_request',
      'pull_request_target',
      'schedule',
      'workflow_dispatch',
      'workflow_call',
    ]);

    const push = triggers[0];
    expect(push.getBranchesList()).toEqual(['main', 'release/*']);
    expect(push.getPathsIgnoreList()).toEqual(['docs/**']);
    expect(push.getTagsList()).toEqual([]);
    expect(push.getTypesList()).toEqual([]);

    const pr = triggers[1];
    expect(pr.getTypesList()).toEqual(['opened', 'synchronize']);
    expect(pr.getBranchesList()).toEqual([]);

    const prTarget = triggers[2];
    expect(prTarget.getBranchesList()).toEqual(['main']);

    const schedule = triggers[3];
    expect(schedule.getCronSchedulesList()).toEqual(['0 3 * * *', '30 15 * * 1-5']);

    const dispatch = triggers[4];
    expect(dispatch.getDeclaredInputsList()).toEqual(['dry_run', 'environment']);

    const call = triggers[5];
    // Union of workflow_call's inputs + secrets names, sorted — capital
    // "NPM_TOKEN" sorts before lowercase "tag" in plain string comparison.
    expect(call.getDeclaredInputsList()).toEqual(['NPM_TOKEN', 'tag']);
  });

  it('handles a bare string on: (no filters at all)', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractTriggers(ctx, input);
    expect(result.getError()).toBe('');
    const triggers = result.getTriggersList();
    expect(triggers).toHaveLength(1);
    expect(triggers[0].getEvent()).toBe('push');
    expect(triggers[0].getBranchesList()).toEqual([]);
  });

  it('handles the on: [list] shorthand', () => {
    const input = new Workflow();
    input.setYaml('on: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractTriggers(ctx, input);
    expect(result.getTriggersList().map((t) => t.getEvent())).toEqual(['push', 'pull_request']);
  });

  it('returns a structured error, not a crash, for unparseable YAML', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n   runs-on: x\n  bad indent\n');
    const result = extractTriggers(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getTriggersList()).toHaveLength(0);
  });
});
