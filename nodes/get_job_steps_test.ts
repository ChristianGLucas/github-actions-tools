import { JobRequest } from '../gen/messages_pb';
import { getJobSteps } from './get_job_steps';
import { ctx, FIXTURE_WORKFLOW, FIXTURE_BUILD_RUN_STEP } from './testkit';

describe('GetJobSteps', () => {
  it("extracts the build job's steps in order, with resolved shell/working-directory only on run steps", () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('build');
    const result = getJobSteps(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getFound()).toBe(true);
    const steps = result.getStepsList();
    expect(steps).toHaveLength(7);

    const checkout = steps[0];
    expect(checkout.getStepId()).toBe('checkout');
    expect(checkout.getName()).toBe('Checkout');
    expect(checkout.getUses()).toBe('actions/checkout@v4');
    expect(checkout.getRun()).toBe('');
    // A uses step never gets a resolved shell/working-directory, even
    // though the job sets defaults.run for both.
    expect(checkout.getShell()).toBe('');
    expect(checkout.getWorkingDirectory()).toBe('');

    const setupNode = steps[1];
    expect(setupNode.getUses()).toBe('actions/setup-node@d6cd328b831104f9adbeded410aae9f60296cc25');
    expect(setupNode.getWithList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([['node-version', '20']]);

    const install = steps[4];
    expect(install.getName()).toBe('Install');
    expect(install.getRun()).toBe('npm ci');
    // No step-level shell/working-directory -> falls back to the job's
    // defaults.run.
    expect(install.getShell()).toBe('bash');
    expect(install.getWorkingDirectory()).toBe('./app');
    expect(install.getEnvList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([['NPM_TOKEN', '${{ secrets.NPM_TOKEN }}']]);

    const build = steps[FIXTURE_BUILD_RUN_STEP.index];
    expect(build.getStepId()).toBe(FIXTURE_BUILD_RUN_STEP.stepId);
    expect(build.getName()).toBe(FIXTURE_BUILD_RUN_STEP.name);
    expect(build.getRun()).toBe(FIXTURE_BUILD_RUN_STEP.run);
    // Step's own shell/working-directory win over the job defaults.
    expect(build.getShell()).toBe(FIXTURE_BUILD_RUN_STEP.shell);
    expect(build.getWorkingDirectory()).toBe(FIXTURE_BUILD_RUN_STEP.workingDirectory);
    expect(build.getIfCondition()).toBe(FIXTURE_BUILD_RUN_STEP.ifCondition);
    expect(build.getContinueOnError()).toBe(FIXTURE_BUILD_RUN_STEP.continueOnError);
    expect(build.getContinueOnErrorSpecified()).toBe(true);
    expect(build.getTimeoutMinutes()).toBe(FIXTURE_BUILD_RUN_STEP.timeoutMinutes);
    expect(build.getTimeoutMinutesSpecified()).toBe(true);
  });

  it("falls back to '' shell for a job with no defaults.run at all", () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('lint');
    const result = getJobSteps(ctx, input);
    const steps = result.getStepsList();
    expect(steps).toHaveLength(1);
    expect(steps[0].getRun()).toBe('npm run lint');
    expect(steps[0].getShell()).toBe('');
    expect(steps[0].getWorkingDirectory()).toBe('');
  });

  it('found=false with a structured error for a job id that does not exist', () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('does-not-exist');
    const result = getJobSteps(ctx, input);
    expect(result.getFound()).toBe(false);
    expect(result.getError()).not.toBe('');
    expect(result.getStepsList()).toHaveLength(0);
  });

  it('requires job_id', () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('');
    const result = getJobSteps(ctx, input);
    expect(result.getFound()).toBe(false);
    expect(result.getError()).toBe('job_id is required');
  });

  it('found=true with zero steps for a reusable-call job (no steps: at all)', () => {
    const input = new JobRequest();
    input.setYaml(FIXTURE_WORKFLOW);
    input.setJobId('publish');
    const result = getJobSteps(ctx, input);
    expect(result.getFound()).toBe(true);
    expect(result.getStepsList()).toHaveLength(0);
  });
});
