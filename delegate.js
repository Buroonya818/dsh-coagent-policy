import { defineTool } from '@deepseek-ai/dsh-tools';
import { delegationDepthOf, parentAgentOptionsForDelegation } from '@deepseek-ai/dsh-subagent';
import { chooseChild, sameRule } from './policy.js';

export const name = 'coagent-model-policy-delegate';
export const inject = ['tools', 'llm', 'subagents', 'systemPrompt', 'coagentModelPolicy'];
const BLOCKED = new Set([
  'subagent_fork', 'subagent_oar', 'spawn_teammate', 'workflow', 'ralph',
  'codex_subtask', 'codex_delegate', 'subagent_codex', 'plugin_manager', 'plugin_market',
]);
const ROUTE_ARGUMENTS = {
  provider: { type: 'string', description: 'Provider ID from list_subagent_models.' },
  model: { type: 'string', description: 'Model ID from list_subagent_models. Omit both provider and model only when exactly one co-agent route is selected.' },
};
const ROUTE_OUTPUT_FIELDS = {
  provider: { type: 'string', required: true },
  model: { type: 'string', required: true },
  reasoning_effort: { type: 'string' },
};
const routeText = value => `${value.provider}/${value.model} · ${value.reasoning_effort ?? 'provider default'}`;
const asOutput = ({ provider, model, reasoningEffort }) => ({
  provider, model, ...reasoningEffort === undefined ? {} : { reasoning_effort: reasoningEffort },
});

export function apply(ctx) {
  const depthAllows = agent => agent !== undefined && delegationDepthOf(agent) === 0 && ctx.subagents.resolveMaxDepth() > 0;
  const backend = () => {
    const provider = ctx.subagents.getProvider('spawn');
    return provider?.capabilities.agentOptions && provider.capabilities.depthLimit && !provider.inheritsParentContext
      ? provider : undefined;
  };
  const available = (agent, route) => depthAllows(agent) && backend() !== undefined && ctx.coagentModelPolicy.allowed(route).length > 0;
  const when = ({ agent, modelSelection }) => available(agent, modelSelection);

  ctx.tools.register(defineTool({
    name: 'subagent',
    description: 'Start a fresh co-agent on a user-approved model and effort, and return its name for send_message.',
    parameters: {
      description: { type: 'string', required: true, description: 'Short display label.' },
      prompt: { type: 'string', required: true, description: 'Complete, standalone task.' },
      name: { type: 'string', description: 'Unique short name starting with a lowercase letter, using letters, digits and hyphens.' },
      ...ROUTE_ARGUMENTS,
      reasoning_effort: { type: 'string', description: 'If provided, must match the saved effort for the route. Omit to use the saved selection.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        kind: { type: 'string', required: true, const: 'activation' },
        name: { type: 'string', required: true },
        ...ROUTE_OUTPUT_FIELDS,
      } },
      render: (_args, value) => [{ type: 'text', text: `started subagent ${value.name} on ${routeText(value)}` }],
      presentationMeta: (_args, value) => ({ kind: value.kind, name: value.name }),
    },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const parent = exec.agent;
      if (!depthAllows(parent)) throw new Error('Only a lead permitted to delegate can start a co-agent in this preset.');
      const capturedBackend = backend();
      if (!capturedBackend) throw new Error('Native fresh-child delegation is unavailable. No alternate backend will be used.');
      const selected = () => chooseChild(ctx.coagentModelPolicy.allowed(parentAgentOptionsForDelegation(parent)), args);
      const rule = selected();
      const { provider, model, reasoningEffort } = rule;
      if (args.reasoning_effort !== undefined && args.reasoning_effort !== reasoningEffort) {
        throw new Error('Only the user’s saved reasoning effort is allowed. Omit reasoning_effort or use the value from list_subagent_models.');
      }
      const models = await ctx.llm.listModels(provider);
      exec.signal.throwIfAborted();
      if (!models.some(entry => entry.id === model)) throw new Error('The selected model is no longer in the provider’s available catalog. No fallback was used.');
      const resolved = await ctx.llm.resolveCallConfig({ provider, model, reasoningEffort }, exec.signal);
      if (resolved.provider !== provider || resolved.model !== model || (reasoningEffort !== undefined && resolved.reasoningEffort !== reasoningEffort)) {
        throw new Error('The provider did not accept the exact co-agent route and reasoning effort. No fallback was used.');
      }
      exec.signal.throwIfAborted();
      if (!depthAllows(parent) || backend() !== capturedBackend || !sameRule(rule, selected())) {
        throw new Error('Co-agent settings changed during validation. Retry with a currently allowed model.');
      }
      // Explicit undefined clears same-route parent effort when the adapter declares no default.
      const agentOptions = { provider, model, reasoningEffort: resolved.reasoningEffort };
      const started = await ctx.subagents.startActivation({
        provider: 'spawn', parent, label: args.description,
        ...(args.name === undefined ? {} : { name: args.name }),
        prompt: [{ type: 'text', text: args.prompt }], maxDepth: 1,
        agentOptions, signal: exec.signal, delivery: 'parent',
      });
      return { kind: 'activation', name: started.name, ...asOutput(agentOptions) };
    },
  }), { when });

  ctx.tools.register(defineTool({
    name: 'list_subagent_models',
    description: 'List the user-approved provider/model and saved effort for this lead. Delegation rechecks availability.',
    parameters: {
      provider: { type: 'string', description: 'Optional exact provider filter.' },
      model: { type: 'string', description: 'Optional exact model filter.' },
    },
    output: {
      schema: { type: 'array', items: { type: 'object', additionalProperties: false, properties: ROUTE_OUTPUT_FIELDS } },
      render: (_args, routes) => [{ type: 'text', text: routes.length ? routes.map(routeText).join('\n') : 'No approved co-agent route matches.' }],
    },
    isConcurrencySafe: () => true,
    execute(args, { agent }) {
      if (!agent) return [];
      const lead = parentAgentOptionsForDelegation(agent);
      if (!available(agent, lead)) return [];
      return ctx.coagentModelPolicy.allowed(lead)
        .filter(({ provider, model }) => (args.provider === undefined || args.provider === provider)
          && (args.model === undefined || args.model === model))
        .map(asOutput);
    },
  }), { when });

  ctx.tools.guard(exec => BLOCKED.has(exec.name) ? 'This preset delegates only through its co-agent allowlist.' : undefined);
  ctx.systemPrompt.context({
    name: 'coagent-model-policy:allowed', order: ctx.systemPrompt.getContextOrder('SUBAGENT_DELEGATION'), required: true,
    text: context => available(context.agent, context.modelSelection)
      ? 'Call list_subagent_models to get the co-agent routes and efforts approved by the user. Pass an approved provider and model to subagent.'
      : '',
  });
}
