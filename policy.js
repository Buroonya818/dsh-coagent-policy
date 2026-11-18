export const LEGACY_PROVIDER = 'openai-codex';
export const LEGACY_MODELS = Object.freeze(['gpt-6.2-sol', 'gpt-6.1-terra', 'gpt-6-luna']);
export const LEGACY_DEFAULT = Object.freeze(['gpt-6-luna']);

export const routeKey = ({ provider, model }) => JSON.stringify([provider, model]);
const hasText = value => typeof value === 'string' && value.length > 0;
const isRoute = value => value !== null && typeof value === 'object' && hasText(value.provider) && hasText(value.model);

/** Before an explicit v2 save, preserve the old lists and never grant a broader fallback. */
export function allowedOn(lead, { rules, astraModels, solModels }) {
  if (!isRoute(lead)) return [];
  if (rules !== undefined && !Array.isArray(rules)) return [];
  if (rules?.length > 0) {
    const seen = new Set();
    for (const rule of rules) {
      if (!isRoute(rule) || (rule.reasoningEffort !== undefined && !hasText(rule.reasoningEffort))) return [];
      const key = routeKey(rule);
      if (seen.has(key)) return [];
      seen.add(key);
    }
    return rules;
  }
  const valid = list => Array.isArray(list) && list.every(model => LEGACY_MODELS.includes(model));
  if (!valid(astraModels) || !valid(solModels)) return [];
  const models = lead.provider === LEGACY_PROVIDER && lead.model === 'gpt-6.2-astra' ? astraModels
    : lead.provider === LEGACY_PROVIDER && lead.model === 'gpt-6.2-sol' ? solModels
    : astraModels.filter(model => solModels.includes(model));
  return [...new Set(models)].map(model => ({ provider: LEGACY_PROVIDER, model, reasoningEffort: 'max' }));
}

export function chooseChild(allowed, { provider, model }) {
  if (!allowed.length) throw new Error('No co-agent route is allowed. Save an allowlist in the Co-agent settings.');
  if (provider === undefined && model === undefined && allowed.length === 1) return allowed[0];
  if (provider === undefined || model === undefined) throw new Error('Choose both provider and model from list_subagent_models.');
  const match = allowed.find(rule => rule.provider === provider && rule.model === model);
  if (!match) throw new Error('The requested provider/model is not on the user’s co-agent allowlist.');
  return match;
}

export function sameRule(left, right) {
  return left.provider === right.provider && left.model === right.model && left.reasoningEffort === right.reasoningEffort;
}
