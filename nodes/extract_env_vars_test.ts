import { Workflow } from '../gen/messages_pb';
import { extractEnvVars } from './extract_env_vars';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ExtractEnvVars', () => {
  it('extracts workflow-level, job-level, and step-level env blocks', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractEnvVars(ctx, input);
    expect(result.getError()).toBe('');

    expect(result.getWorkflowEnvList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['CI', 'true'],
      ['NODE_ENV', 'production'],
    ]);

    const jobEnv = result.getJobEnvList();
    expect(jobEnv.map((j) => j.getJobId())).toEqual(['build', 'lint', 'publish', 'notify']);
    expect(jobEnv[0].getEnvList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([['BUILD_ENV', 'ci']]);
    expect(jobEnv[1].getEnvList()).toHaveLength(0);

    const stepEnv = result.getStepEnvList();
    expect(stepEnv).toHaveLength(1);
    expect(stepEnv[0].getJobId()).toBe('build');
    expect(stepEnv[0].getStepIndex()).toBe(4);
    expect(stepEnv[0].getStepName()).toBe('Install');
    expect(stepEnv[0].getEnvList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['NPM_TOKEN', '${{ secrets.NPM_TOKEN }}'],
    ]);
  });

  it('returns an empty JobEnv entry (not omitted) for a job with no env: at all', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n');
    const result = extractEnvVars(ctx, input);
    const jobEnv = result.getJobEnvList();
    expect(jobEnv).toHaveLength(1);
    expect(jobEnv[0].getJobId()).toBe('build');
    expect(jobEnv[0].getEnvList()).toHaveLength(0);
  });
});
