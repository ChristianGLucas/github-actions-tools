import { Workflow } from '../gen/messages_pb';
import { extractSecretsUsage } from './extract_secrets_usage';
import { ctx, FIXTURE_WORKFLOW, FIXTURE_SECRETS_ORACLE } from './testkit';

describe('ExtractSecretsUsage', () => {
  it('finds every secrets.<NAME> reference across env/container/run/job-secrets locations', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractSecretsUsage(ctx, input);
    expect(result.getError()).toBe('');
    const refs = result.getReferencesList();
    expect(refs).toHaveLength(FIXTURE_SECRETS_ORACLE.length);
    refs.forEach((r, i) => {
      const want = FIXTURE_SECRETS_ORACLE[i];
      expect(r.getJobId()).toBe(want.jobId);
      expect(r.getStepIndex()).toBe(want.stepIndex);
      expect(r.getLocation()).toBe(want.location);
      expect(r.getSecretName()).toBe(want.secretName);
    });
    // The raw expression is captured verbatim, never a resolved value.
    expect(refs[2].getRawExpression()).toBe('${{ secrets.DEPLOY_TOKEN }}');
  });

  it('never reports github.actor / non-secret expressions as a hit', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractSecretsUsage(ctx, input);
    const names = result.getReferencesList().map((r) => r.getSecretName());
    expect(names).not.toContain('actor');
  });

  it('does not scan the "inherit" shorthand as if it had per-key text', () => {
    const input = new Workflow();
    input.setYaml(
      'on: push\njobs:\n  a:\n    uses: ./.github/workflows/x.yml\n    secrets: inherit\n',
    );
    const result = extractSecretsUsage(ctx, input);
    expect(result.getReferencesList()).toHaveLength(0);
  });

  it('returns no references (not an error) for a workflow with none', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractSecretsUsage(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getReferencesList()).toHaveLength(0);
  });
});
