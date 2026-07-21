import { Workflow } from '../gen/messages_pb';
import { detectSecurityPatterns } from './detect_security_patterns';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('DetectSecurityPatterns', () => {
  it('detects pull_request_target, one unpinned action, and one secret-in-run-command — factually, in order', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = detectSecurityPatterns(ctx, input);
    expect(result.getError()).toBe('');
    const findings = result.getFindingsList();

    expect(findings).toHaveLength(3);

    expect(findings[0].getPattern()).toBe('pull_request_target_trigger');
    expect(findings[0].getJobId()).toBe('');
    expect(findings[0].getStepIndex()).toBe(-1);

    expect(findings[1].getPattern()).toBe('unpinned_action');
    expect(findings[1].getJobId()).toBe('build');
    expect(findings[1].getStepIndex()).toBe(0);
    expect(findings[1].getDetail()).toBe('actions/checkout@v4');

    expect(findings[2].getPattern()).toBe('secret_in_run_command');
    expect(findings[2].getJobId()).toBe('build');
    expect(findings[2].getStepIndex()).toBe(6);
    expect(findings[2].getDetail()).toContain('DEPLOY_TOKEN');
  });

  it('does NOT flag a SHA-pinned action, a local-path action, or a Docker-image step as unpinned', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = detectSecurityPatterns(ctx, input);
    const unpinned = result.getFindingsList().filter((f) => f.getPattern() === 'unpinned_action');
    expect(unpinned).toHaveLength(1); // only the floating-tag checkout@v4
    expect(unpinned[0].getDetail()).not.toContain('setup-node');
    expect(unpinned[0].getDetail()).not.toContain('custom-setup');
    expect(unpinned[0].getDetail()).not.toContain('docker://');
  });

  it('does NOT flag a secret referenced only in env: (not run:) as secret_in_run_command', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n        env:\n          TOKEN: ${{ secrets.TOKEN }}\n',
    );
    const result = detectSecurityPatterns(ctx, input);
    expect(result.getFindingsList().filter((f) => f.getPattern() === 'secret_in_run_command')).toHaveLength(0);
  });

  it('returns zero findings (not an error) for a clean, fully-pinned workflow', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@8f4b7f84864484a7bf31766abe9204da3cbe65b3\n        run: echo hi\n',
    );
    const result = detectSecurityPatterns(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getFindingsList()).toHaveLength(0);
  });

  it('dedupes repeated references to the same secret within one run: script', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo ${{ secrets.X }} && echo ${{ secrets.X }}\n',
    );
    const result = detectSecurityPatterns(ctx, input);
    const hits = result.getFindingsList().filter((f) => f.getPattern() === 'secret_in_run_command');
    expect(hits).toHaveLength(1);
  });
});
