import { Workflow, ExtractTriggersResult, TriggerEvent } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import {
  parseWorkflow,
  looksLikeWorkflow,
  isPlainObject,
  asStringList,
  asString,
  errorMessage,
  BoundsError,
} from './lib';

function buildTriggerEvent(event: string, config: unknown): TriggerEvent {
  const te = new TriggerEvent();
  te.setEvent(event);
  if (event === 'schedule') {
    const entries = Array.isArray(config) ? config : [];
    const crons: string[] = [];
    for (const entry of entries) {
      if (isPlainObject(entry)) {
        const c = asString(entry.cron);
        if (c !== '') crons.push(c);
      }
    }
    te.setCronSchedulesList(crons);
    return te;
  }
  if (event === 'workflow_dispatch' || event === 'workflow_call') {
    const inputs = isPlainObject(config) ? config.inputs : undefined;
    const names = new Set<string>();
    if (isPlainObject(inputs)) {
      for (const k of Object.keys(inputs)) names.add(k);
    }
    if (event === 'workflow_call') {
      const secrets = isPlainObject(config) ? config.secrets : undefined;
      if (isPlainObject(secrets)) {
        for (const k of Object.keys(secrets)) names.add(k);
      }
    }
    te.setDeclaredInputsList(Array.from(names).sort());
    return te;
  }
  if (!isPlainObject(config)) {
    // A bare event with no filter object (e.g. `push: null`, or the event
    // named via the `on: [push, pull_request]` list form) — every filter
    // stays at its empty-list zero value.
    return te;
  }
  te.setBranchesList(asStringList(config.branches));
  te.setBranchesIgnoreList(asStringList(config['branches-ignore']));
  te.setTagsList(asStringList(config.tags));
  te.setTagsIgnoreList(asStringList(config['tags-ignore']));
  te.setPathsList(asStringList(config.paths));
  te.setPathsIgnoreList(asStringList(config['paths-ignore']));
  te.setTypesList(asStringList(config.types));
  return te;
}

/**
 * Extract every event under a workflow's `on:` key together with whichever
 * filters that event type actually carries: branches/branches-ignore/tags/
 * tags-ignore/paths/paths-ignore/types for push/pull_request-family events,
 * the list of cron expressions for `schedule:`, and the declared input (+,
 * for workflow_call, secret) NAMES for workflow_dispatch/workflow_call.
 * Handles all three `on:` shapes GitHub accepts: a bare string, a list of
 * event names, or a map of event -> filters.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function extractTriggers(ax: AxiomContext, input: Workflow): ExtractTriggersResult {
  const out = new ExtractTriggersResult();
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
    const onValue = doc.on;
    const triggers: TriggerEvent[] = [];
    if (typeof onValue === 'string') {
      if (onValue !== '') triggers.push(buildTriggerEvent(onValue, undefined));
    } else if (Array.isArray(onValue)) {
      for (const v of onValue) {
        const name = asString(v);
        if (name !== '') triggers.push(buildTriggerEvent(name, undefined));
      }
    } else if (isPlainObject(onValue)) {
      for (const key of Object.keys(onValue)) {
        triggers.push(buildTriggerEvent(key, onValue[key]));
      }
    }
    out.setTriggersList(triggers);
    return out;
  } catch (e) {
    out.setError(e instanceof BoundsError ? e.message : errorMessage(e, 'extracting triggers'));
    return out;
  }
}
