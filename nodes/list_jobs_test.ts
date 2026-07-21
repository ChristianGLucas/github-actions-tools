import { Workflow } from '../gen/messages_pb';
import { listJobs } from './list_jobs';
import { ctx, FIXTURE_WORKFLOW } from './testkit';

describe('ListJobs', () => {
  it('lists every job with its full attribute set', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = listJobs(ctx, input);
    expect(result.getError()).toBe('');
    const jobs = result.getJobsList();
    expect(jobs.map((j) => j.getJobId())).toEqual(['build', 'lint', 'publish', 'notify']);

    const build = jobs[0];
    expect(build.getName()).toBe('Build and test');
    expect(build.getRunsOnList()).toEqual(['ubuntu-latest']);
    expect(build.getTimeoutMinutes()).toBe(15);
    expect(build.getTimeoutMinutesSpecified()).toBe(true);
    expect(build.getContinueOnError()).toBe(false);
    expect(build.getContinueOnErrorSpecified()).toBe(true);
    expect(build.getEnvironmentName()).toBe('staging');
    expect(build.getConcurrencySpecified()).toBe(false);
    expect(build.getContainerImage()).toBe('node:20-bullseye');
    expect(build.getIsReusableCall()).toBe(false);
    const buildPerms = build.getPermissions()!;
    expect(buildPerms.getMode()).toBe('scoped');
    expect(buildPerms.getScopesList().map((kv) => [kv.getKey(), kv.getValue()])).toEqual([
      ['contents', 'read'],
      ['packages', 'write'],
    ]);
    expect(build.getStepCount()).toBe(7);

    const lint = jobs[1];
    expect(lint.getName()).toBe('lint');
    expect(lint.getRunsOnList()).toEqual(['self-hosted', 'linux', 'x64']);
    expect(lint.getNeedsList()).toEqual(['build']);
    expect(lint.getTimeoutMinutesSpecified()).toBe(false);
    expect(lint.getContinueOnErrorSpecified()).toBe(false);
    expect(lint.getEnvironmentName()).toBe('');
    expect(lint.getContainerImage()).toBe('');
    expect(lint.getPermissions()!.getMode()).toBe('unspecified');
    expect(lint.getStepCount()).toBe(1);

    const publish = jobs[2];
    expect(publish.getIsReusableCall()).toBe(true);
    expect(publish.getReusableWorkflowRef()).toBe('./.github/workflows/publish.yml');
    expect(publish.getNeedsList()).toEqual(['build', 'lint']);
  });

  it('returns "" job_id-not-found style error when the workflow has no jobs', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs: {}\n');
    const result = listJobs(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getJobsList()).toHaveLength(0);
  });
});
