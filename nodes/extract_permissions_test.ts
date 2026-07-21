import { Workflow } from '../gen/messages_pb';
import { extractPermissions } from './extract_permissions';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ExtractPermissions', () => {
  it('extracts and normalizes the workflow-level and every job-level permissions: block', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractPermissions(ctx, input);
    expect(result.getError()).toBe('');

    const wf = result.getWorkflowPermissions()!;
    expect(wf.getMode()).toBe('scoped');
    expect(wf.getScopesList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['contents', 'read'],
      ['issues', 'write'],
    ]);

    const jobPerms = result.getJobPermissionsList();
    expect(jobPerms.map((j) => j.getJobId())).toEqual(['build', 'lint', 'publish', 'notify']);
    const build = jobPerms[0].getPermissions()!;
    expect(build.getMode()).toBe('scoped');
    expect(build.getScopesList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['contents', 'read'],
      ['packages', 'write'],
    ]);
    expect(jobPerms[1].getPermissions()!.getMode()).toBe('unspecified');
  });

  it('normalizes the "read-all" / "write-all" / {} shorthands', () => {
    const cases: Array<[string, string]> = [
      ['permissions: read-all\n', 'read-all'],
      ['permissions: write-all\n', 'write-all'],
      ['permissions: {}\n', 'none'],
    ];
    for (const [snippet, wantMode] of cases) {
      const input = new Workflow();
      input.setYaml(`on: push\n${snippet}jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n`);
      const result = extractPermissions(ctx, input);
      expect(result.getWorkflowPermissions()!.getMode()).toBe(wantMode);
    }
  });

  it('mode="unspecified" when permissions: is absent entirely', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractPermissions(ctx, input);
    expect(result.getWorkflowPermissions()!.getMode()).toBe('unspecified');
    expect(result.getWorkflowPermissions()!.getScopesList()).toHaveLength(0);
  });
});
