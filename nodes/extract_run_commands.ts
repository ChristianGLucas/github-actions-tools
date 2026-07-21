import { Workflow, ExtractRunCommandsResult, RunCommand } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  isPlainObject,
  asArray,
  asString,
  resolveStepDefault,
  errorMessage,
  BoundsError,
} from './lib';

/**
 * Extract every `run:` shell script across the workflow, tagged with its
 * job id, step index, step name, and effective shell (resolved through the
 * documented step -> job -> workflow defaults.run.shell fallback chain;
 * "" when nothing in the document set it — GitHub's own bash/pwsh-by-OS
 * default is not inferred).
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractRunCommands(ax: AxiomContext, input: Workflow): ExtractRunCommandsResult {
  const out = new ExtractRunCommandsResult();
  try {
    const { data, parseError } = parseWorkflow(input.getYaml());
    if (parseError !== null) {
      out.setError(parseError);
      return out;
    }
    if (!looksLikeWorkflow(data)) {
      out.setError('workflow is not a YAML mapping');
      return out;
    }
    const doc = data as Record<string, unknown>;
    const commands: RunCommand[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      asArray(job.steps).forEach((rawStep, index) => {
        if (!isPlainObject(rawStep)) return;
        const script = asString(rawStep.run);
        if (script === '') return;
        const rc = new RunCommand();
        rc.setJobId(jobId);
        rc.setStepIndex(index);
        rc.setStepName(asString(rawStep.name));
        rc.setShell(resolveStepDefault(rawStep, job, doc, 'shell'));
        rc.setScript(script);
        commands.push(rc);
      });
    }
    out.setCommandsList(commands);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting run commands'));
    return out;
  }
}
