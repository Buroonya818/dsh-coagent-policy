import z from '@deepseek-ai/schemastery';
import { allowedOn, LEGACY_MODELS, LEGACY_DEFAULT } from './policy.js';

export const name = 'coagent-model-policy';
const legacySelection = () => z.array(z.union(LEGACY_MODELS.map(id => z.const(id))))
  .min(1).max(LEGACY_MODELS.length).default([...LEGACY_DEFAULT]).volatile();
const routeFields = { provider: z.string().min(1).max(256).required(), model: z.string().min(1).max(512).required() };
export const Config = z.object({
  astraModels: legacySelection(),
  solModels: legacySelection(),
  rules: z.array(z.object({ ...routeFields, reasoningEffort: z.string().min(1).max(128) })).default([]).volatile(),
  favorites: z.array(z.object(routeFields)).default([]).volatile(),
});

export function apply(ctx, config) {
  ctx.provide('coagentModelPolicy', {
    allowed(lead) {
      return allowedOn(lead, {
        rules: config.rules.get(), astraModels: config.astraModels.get(), solModels: config.solModels.get(),
      });
    },
  });
  ctx.inject(['settings'], scoped => {
    scoped.effect(() => scoped.settings.configure({ auto: false }, ctx.fiber));
  });
}
