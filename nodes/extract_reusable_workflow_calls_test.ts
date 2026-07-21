import { Workflow } from '../gen/messages_pb';
import { extractReusableWorkflowCalls } from './extract_reusable_workflow_calls';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ExtractReusableWorkflowCalls', () => {
  it('extracts both reusable-workflow-call jobs with their with/secrets shape', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractReusableWorkflowCalls(ctx, input);
    expect(result.getError()).toBe('');
    const calls = result.getCallsList();
    expect(calls.map((c) => c.getJobId())).toEqual(['publish', 'notify']);

    const publish = calls[0];
    expect(publish.getRawUses()).toBe('./.github/workflows/publish.yml');
    expect(publish.getIsLocalPath()).toBe(true);
    expect(publish.getRefKind()).toBe('');
    expect(publish.getIsShaPinned()).toBe(false);
    expect(publish.getWithList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([['tag', 'v1.0.0']]);
    expect(publish.getSecretsInherit()).toBe(true);
    expect(publish.getSecretsList()).toHaveLength(0);

    const notify = calls[1];
    expect(notify.getRawUses()).toBe(
      'my-org/shared-workflows/.github/workflows/notify.yml@abcdefabcdefabcdefabcdefabcdefabcdefabcd',
    );
    expect(notify.getIsLocalPath()).toBe(false);
    expect(notify.getRefKind()).toBe('sha');
    expect(notify.getIsShaPinned()).toBe(true);
    expect(notify.getSecretsInherit()).toBe(false);
    expect(notify.getSecretsList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['SLACK_WEBHOOK', '${{ secrets.SLACK_WEBHOOK }}'],
    ]);
  });

  it('excludes ordinary (non-reusable-call) jobs', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractReusableWorkflowCalls(ctx, input);
    const jobIds = result.getCallsList().map((c) => c.getJobId());
    expect(jobIds).not.toContain('build');
    expect(jobIds).not.toContain('lint');
  });

  it('returns no calls (not an error) for a workflow with none', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractReusableWorkflowCalls(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCallsList()).toHaveLength(0);
  });
});
