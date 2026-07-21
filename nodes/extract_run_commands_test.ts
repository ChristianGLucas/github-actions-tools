import { Workflow } from '../gen/messages_pb';
import { extractRunCommands } from './extract_run_commands';
import { ctx, FIXTURE_WORKFLOW, FIXTURE_BUILD_RUN_STEP } from './testkit';

describe('ExtractRunCommands', () => {
  it('extracts every run: script across the workflow with its resolved shell', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = extractRunCommands(ctx, input);
    expect(result.getError()).toBe('');
    const commands = result.getCommandsList();
    expect(commands).toHaveLength(4);

    expect(commands[0].getJobId()).toBe('build');
    expect(commands[0].getStepIndex()).toBe(4);
    expect(commands[0].getStepName()).toBe('Install');
    expect(commands[0].getScript()).toBe('npm ci');
    expect(commands[0].getShell()).toBe('bash'); // job defaults.run.shell

    expect(commands[1].getStepIndex()).toBe(FIXTURE_BUILD_RUN_STEP.index);
    expect(commands[1].getScript()).toBe(FIXTURE_BUILD_RUN_STEP.run);
    expect(commands[1].getShell()).toBe(FIXTURE_BUILD_RUN_STEP.shell); // step's own shell

    expect(commands[2].getStepIndex()).toBe(6);
    expect(commands[2].getScript()).toContain('secrets.DEPLOY_TOKEN');

    expect(commands[3].getJobId()).toBe('lint');
    expect(commands[3].getScript()).toBe('npm run lint');
    expect(commands[3].getShell()).toBe(''); // no defaults.run anywhere for lint
  });

  it('returns no commands (not an error) for a workflow with only uses: steps', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n');
    const result = extractRunCommands(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getCommandsList()).toHaveLength(0);
  });
});
