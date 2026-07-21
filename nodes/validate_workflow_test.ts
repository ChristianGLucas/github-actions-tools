import { Workflow } from '../gen/messages_pb';
import { validateWorkflow } from './validate_workflow';
import { ctx, FIXTURE_WORKFLOW, INVALID_WORKFLOW, NOT_A_MAPPING_WORKFLOW, UNPARSEABLE_YAML } from './testkit';

describe('ValidateWorkflow', () => {
  it('valid=true with zero issues for the fixture workflow', () => {
    const input = new Workflow();
    input.setYaml(FIXTURE_WORKFLOW);
    const result = validateWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getValid()).toBe(true);
    expect(result.getIssuesList()).toHaveLength(0);
  });

  it('reports missing on:, missing jobs:, and a job with neither runs-on nor uses — all at once', () => {
    const input = new Workflow();
    input.setYaml(INVALID_WORKFLOW);
    const result = validateWorkflow(ctx, input);
    expect(result.getError()).toBe('');
    expect(result.getValid()).toBe(false);
    const issues = result.getIssuesList();
    const paths = issues.map((i) => i.getPath());
    expect(paths).toContain('on');
    expect(paths).toContain('jobs.orphan');
    // jobs: IS present and non-empty here (it has "orphan"), so the
    // "jobs" (missing-mapping) issue should NOT also fire.
    expect(paths).not.toContain('jobs');
  });

  it('reports a missing jobs: mapping', () => {
    const input = new Workflow();
    input.setYaml('on: push\n');
    const result = validateWorkflow(ctx, input);
    expect(result.getValid()).toBe(false);
    expect(result.getIssuesList().map((i) => i.getPath())).toEqual(['jobs']);
  });

  it('treats a job-level uses: (reusable call) as satisfying the runs-on requirement', () => {
    const input = new Workflow();
    input.setYaml('on: push\njobs:\n  call:\n    uses: ./.github/workflows/x.yml\n');
    const result = validateWorkflow(ctx, input);
    expect(result.getValid()).toBe(true);
  });

  it('returns a structured error for a non-mapping document, not a crash', () => {
    const input = new Workflow();
    input.setYaml(NOT_A_MAPPING_WORKFLOW);
    const result = validateWorkflow(ctx, input);
    expect(result.getError()).not.toBe('');
    expect(result.getValid()).toBe(false);
  });

  it('returns a structured error for unparseable YAML, not a crash', () => {
    const input = new Workflow();
    input.setYaml(UNPARSEABLE_YAML);
    const result = validateWorkflow(ctx, input);
    expect(result.getError()).not.toBe('');
  });
});
