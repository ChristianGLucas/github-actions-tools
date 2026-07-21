import { Workflow, ExtractActionsResult, ActionRef } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  listJobEntries,
  asArray,
  isPlainObject,
  asString,
  parseUsesRef,
  errorMessage,
  BoundsError,
} from './lib';

/**
 * Extract every third-party action referenced via a step-level `uses:`
 * across the whole workflow, decomposed into owner/repo/sub_path/ref and
 * classified by pinning: "sha" (a 40-character commit SHA — the only
 * pinning form verifiable without calling the GitHub API), "floating" (a
 * tag or branch name — this package cannot distinguish the two offline),
 * a local-path action (`./...`), or a Docker-image action (`docker://...`).
 * The key node for supply-chain auditing: every action a workflow actually
 * executes, with enough structure to check pinning policy in bulk. Does
 * NOT include job-level reusable-workflow calls — see
 * ExtractReusableWorkflowCalls for those.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractActions(ax: AxiomContext, input: Workflow): ExtractActionsResult {
  const out = new ExtractActionsResult();
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
    const actions: ActionRef[] = [];
    for (const [jobId, job] of listJobEntries(doc)) {
      const rawSteps = asArray(job.steps);
      rawSteps.forEach((rawStep, index) => {
        if (!isPlainObject(rawStep)) return;
        const uses = asString(rawStep.uses);
        if (uses === '') return;
        const parsed = parseUsesRef(uses);
        const ar = new ActionRef();
        ar.setJobId(jobId);
        ar.setStepIndex(index);
        ar.setStepName(asString(rawStep.name));
        ar.setRawUses(uses);
        ar.setOwner(parsed.owner);
        ar.setRepo(parsed.repo);
        ar.setSubPath(parsed.subPath);
        ar.setRef(parsed.ref);
        ar.setRefKind(parsed.refKind);
        ar.setIsShaPinned(parsed.isShaPinned);
        ar.setIsLocalPath(parsed.isLocalPath);
        ar.setIsDocker(parsed.isDocker);
        ar.setDockerImage(parsed.dockerImage);
        actions.push(ar);
      });
    }
    out.setActionsList(actions);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting actions'));
    return out;
  }
}
