import { Workflow } from '../gen/messages_pb';
import { extractActions } from './extract_actions';
import { ctx, FIXTURE_WORKFLOW, FIXTURE_ACTIONS_ORACLE } from './testkit';

describe('ExtractActions', () => {
  it('extracts every step-level uses:, classified by pinning/local-path/docker', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractActions(ctx, input);
    expect(result.getError()).toBe('');
    const actions = result.getActionsList();
    expect(actions).toHaveLength(FIXTURE_ACTIONS_ORACLE.length);

    actions.forEach((a, i) => {
      const want = FIXTURE_ACTIONS_ORACLE[i];
      expect(a.getJobId()).toBe(want.jobId);
      expect(a.getStepIndex()).toBe(want.stepIndex);
      expect(a.getStepName()).toBe(want.stepName);
      expect(a.getRawUses()).toBe(want.rawUses);
      expect(a.getOwner()).toBe(want.owner);
      expect(a.getRepo()).toBe(want.repo);
      expect(a.getSubPath()).toBe(want.subPath);
      expect(a.getRef()).toBe(want.ref);
      expect(a.getRefKind()).toBe(want.refKind);
      expect(a.getIsShaPinned()).toBe(want.isShaPinned);
      expect(a.getIsLocalPath()).toBe(want.isLocalPath);
      expect(a.getIsDocker()).toBe(want.isDocker);
      expect(a.getDockerImage()).toBe(want.dockerImage);
    });
  });

  it('never includes job-level reusable-workflow calls (those are ExtractReusableWorkflowCalls)', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractActions(ctx, input);
    const jobIds = new Set(result.getActionsList().map((a) => a.getJobId()));
    expect(jobIds.has('publish')).toBe(false);
    expect(jobIds.has('notify')).toBe(false);
  });

  it('parses a sub-directory action reference (owner/repo/sub_path@ref)', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: my-org/my-repo/actions/sub-action@v2\n',
    );
    const result = extractActions(ctx, input);
    const a = result.getActionsList()[0];
    expect(a.getOwner()).toBe('my-org');
    expect(a.getRepo()).toBe('my-repo');
    expect(a.getSubPath()).toBe('actions/sub-action');
    expect(a.getRef()).toBe('v2');
    expect(a.getRefKind()).toBe('floating');
  });

  it('returns no actions (not an error) for a workflow with none', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractActions(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getActionsList()).toHaveLength(0);
  });
});
