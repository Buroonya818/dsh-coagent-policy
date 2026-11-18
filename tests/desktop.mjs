import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const install = process.env.DSH_INSTALL_DIR;
assert.ok(install && process.versions.electron, 'Use the DSH Desktop Electron binary in Node mode.');
const bundle = dirname(dirname(fileURLToPath(import.meta.url)));
const bundleUrl = pathToFileURL(bundle + '/').href;
const req = createRequire(join(install, 'package.json'));
const hook = registerHooks({ resolve(spec, ctx, next) {
  if (ctx.parentURL?.startsWith(bundleUrl) && spec.startsWith('@deepseek-ai/')) return next(pathToFileURL(req.resolve(spec)).href, ctx);
  return next(spec, ctx);
} });
const { Config, apply: applySettings } = await import('../index.js');
const { apply } = await import('../delegate.js');
const { LEGACY_PROVIDER: CODEX, allowedOn, chooseChild } = await import('../policy.js');
const { SubagentRuntime, resolveChildAgentOptions } = await import('@deepseek-ai/dsh-subagent');
const { Context } = await import('@deepseek-ai/cordis');
const boot = await import('@deepseek-ai/dsh-app-boot');
hook.deregister();
const manifest = JSON.parse(fs.readFileSync(join(bundle, 'package.json'), 'utf8'));
const LUNA = 'gpt-6-luna';
const SOL = 'gpt-6.2-sol';
const ASTRA = 'gpt-6.2-astra';
const route = (provider, model, reasoningEffort) => ({ provider, model, ...(reasoningEffort === undefined ? {} : { reasoningEffort }) });
const DEFAULT = route(CODEX, LUNA, 'max');
const MULTI = [route(CODEX, SOL, 'xhigh'), route('other-api', SOL, 'high'), route('local', 'model-a')];
const legacy = { astraModels: [SOL, LUNA], solModels: [LUNA], rules: [], favorites: [] };
const basic = { description: 'Bounded fixture', prompt: 'No model requests should run in this test.' };

function setup(lead, { settings = { ...legacy, rules: MULTI }, depth = 0, limit = 3, preflight, catalog = [...MULTI, DEFAULT] } = {}) {
  let leadRoute = lead;
  const parent = { id: 'parent', options: { ...route(CODEX, ASTRA, 'max') }, session: { header: { delegationDepth: depth }, requestHeader: () => ({ config: leadRoute }) } };
  let policy;
  applySettings({ provide: (_id, svc) => { policy = svc; }, inject() {} },
    Object.fromEntries(Object.keys(legacy).map(field => [field, { get: () => settings[field] }])));
  const starts = [], resolutions = [];
  const provider = { name: 'spawn', capabilities: { agentOptions: true, depthLimit: true }, inheritsParentContext: false, prepareContinuable() { throw new Error('No provider I/O in this fixture'); } };
  const runtime = Object.create(SubagentRuntime.prototype, {
    providers: { value: new Map([['spawn', provider]]) },
    manager: { value: { startLocal(spec) {
      starts.push({ spec, effective: resolveChildAgentOptions(spec.parent, spec.agentOptions, 1) });
      return { name: spec.name ?? 'agent-1' };
    } } },
    ctx: { value: { get: key => key === 'agents' ? { get: id => id === parent.id ? parent : undefined } : undefined } },
    resolveMaxDepth: { value: () => limit },
  });
  let guard, context;
  const tools = new Map();
  apply({
    coagentModelPolicy: policy, subagents: runtime,
    tools: { register: (definition, options) => { tools.set(definition.name, [definition, options]); }, guard: fn => { guard = fn; } },
    systemPrompt: { getContextOrder: () => 120, context: value => { context = value; } },
    llm: {
      listModels: async id => catalog.filter(model => model.provider === id).map(model => ({ id: model.model })),
      resolveCallConfig: async config => { resolutions.push(config); return preflight ? preflight(config) : config; },
    },
  });
  const [tool, options] = tools.get('subagent');
  return { options, parent, starts, resolutions, guard, context,
    setSettings(value) { settings = value; }, setLead(value) { leadRoute = value; },
    call: (args, signal = new AbortController().signal) => tool.execute({ ...basic, ...args }, { agent: parent, signal }),
    list: args => tools.get('list_subagent_models')[0].execute(args, { agent: parent, signal: new AbortController().signal }),
  };
}

test('bundle admission, preset scope and distributed resources', () => {
  assert.equal(boot.evaluatePluginCompatibility(manifest), undefined);
  const patches = boot.loadOverlayPatches('dsh', join(bundle, 'cordis.patch.yml'));
  assert.deepEqual(patches.flatMap(p => p.insert ?? []).map(p => p.id), ['coagent-model-policy', 'preset-coagent-allowlist']);
  const preset = patches[0].insert[1].config;
  assert.equal(preset.id, 'coagent-allowlist');
  for (const row of preset.plugins) assert.ok(!['tool-subagent', 'tool-subagent-fork', 'tool-workflow', 'tool-plugin-manager'].includes(row.id), row.id);
  for (const lang of ['zh', 'en']) assert.ok(JSON.parse(fs.readFileSync(join(bundle, 'locale', `${lang}.json`), 'utf8')).meta.title);
  assert.match(fs.readFileSync(join(bundle, 'icon.svg'), 'utf8'), /^<svg .*viewBox="0 0 36 36">/u);
  for (const dest of Object.values(manifest.exports)) if (!dest.includes('*')) assert.ok(fs.existsSync(join(bundle, dest)), dest);
});

test('Desktop Client resolves the model catalog and Codex transport from sibling services', async () => {
  // Exercise the shipped Client factory and installed Cordis, without rendering.
  let entry;
  runInNewContext(fs.readFileSync(join(bundle, 'client.js'), 'utf8'), {
    window: { __ModuleLoader__: { load: module => { entry = module; } } },
  }, { filename: 'client.js' });
  assert.equal(entry.id, manifest.name);
  const client = entry.factory(spec => {
    assert.equal(spec, 'react');
    return Object.freeze({}); // No React API is used while registering the slots.
  });
  const root = new Context();
  const reads = [], slots = [];
  const session = { modelCatalog: async () => ({ ok: true, value: { groups: [], failures: [] } }) };
  try {
    await root.plugin({ apply(ctx) {
      ctx.provide('remote', { get session() { reads.push('session'); return session; } });
      ctx.provide('remote.session', session);
      ctx.provide('connection', { get rpc() { reads.push('rpc'); return {}; } });
      ctx.provide('slots', {
        inject: (_name, declare) => declare(),
        register: ({ name }) => { slots.push(name); return () => {}; },
      });
      ctx.provide('locale', { register: () => () => {}, bind: () => key => key });
      ctx.provide('configForms', { get: () => ({}), whileServed: (_entries, declare) => declare() });
    } });
    await root.inject(['remote.session'], ctx => {
      assert.throws(() => ctx.remote.session, /cannot get property "remote" without inject/);
    });
    await root.plugin(client);
    assert.deepEqual(reads, ['session', 'rpc']);
    assert.deepEqual(slots, ['settings.section', 'settings.section.icon', 'plugins.bundle.config']);
  } finally { root.fiber.dispose(); }
});

test('schema retains legacy selection and accepts route tuples and optional effort', () => {
  assert.deepEqual(Config({}).rules.get(), []);
  assert.deepEqual(Config({}).favorites.get(), []);
  assert.deepEqual(Config({}).astraModels.get(), [LUNA]);
  assert.deepEqual(Config({ ...legacy, rules: MULTI }).rules.get(), MULTI);
  assert.throws(() => Config({ rules: [{ provider: CODEX }] }));
  assert.throws(() => Config({ favorites: [{ provider: '', model: LUNA }] }));
  assert.throws(() => Config({ astraModels: ['invalid-legacy'] }));
});

test('legacy lists are preserved; other leads are restricted to the intersection', () => {
  assert.deepEqual(allowedOn(route(CODEX, ASTRA), legacy), [route(CODEX, SOL, 'max'), DEFAULT]);
  assert.deepEqual(allowedOn(route(CODEX, SOL), legacy), [DEFAULT]);
  assert.deepEqual(allowedOn(route('other-api', 'any-lead'), legacy), [DEFAULT]);
  assert.deepEqual(allowedOn(route('other-api', 'any-lead'), { ...legacy, astraModels: [SOL] }), []);
  assert.deepEqual(allowedOn(route(CODEX, ASTRA), { ...legacy, rules: [DEFAULT, DEFAULT] }), []);
});

test('same model ID from two providers remains distinct; single route allows omission', () => {
  assert.throws(() => chooseChild(MULTI, {}), /both provider and model/);
  assert.throws(() => chooseChild(MULTI, { model: SOL }), /both provider and model/);
  assert.throws(() => chooseChild(MULTI, { provider: 'bogus', model: SOL }), /not on/);
  assert.deepEqual(chooseChild(MULTI, { provider: 'other-api', model: SOL }), MULTI[1]);
  assert.deepEqual(chooseChild([DEFAULT], {}), DEFAULT);
});

test('shared allowlist works independently of the lead and pins the exact child route and effort', async () => {
  for (const lead of [route(CODEX, ASTRA), route('other-api', SOL, 'low'), route('local', 'model-a', 'high')]) {
    const f = setup(lead);
    assert.equal(f.options.when({ agent: f.parent, modelSelection: lead }), true);
    assert.match(f.context.text({ agent: f.parent, modelSelection: lead }), /list_subagent_models/);
    for (const rule of MULTI) {
      const { provider, model, reasoningEffort } = rule;
      const result = await f.call({ provider, model, name: 'audit' });
      assert.equal(result.provider, provider);
      assert.equal(result.model, model);
      assert.equal(result.reasoning_effort, reasoningEffort);
      const { spec, effective } = f.starts.at(-1);
      assert.equal(spec.parent, f.parent);
      assert.equal(spec.provider, 'spawn');
      assert.equal(spec.maxDepth, 1);
      assert.equal(spec.delivery, 'parent');
      assert.deepEqual(effective, { provider, model, ...(reasoningEffort === undefined && provider !== lead.provider ? {} : { reasoningEffort }), subagentDepth: 1 });
    }
  }
});

test('model default does not inherit the lead effort; favorites never grant permission', async () => {
  const child = route(CODEX, SOL);
  const f = setup(route(CODEX, SOL, 'low'), { settings: { ...legacy, rules: [child], favorites: [DEFAULT] }, preflight: proposed => ({ ...proposed, reasoningEffort: 'medium' }) });
  assert.deepEqual(await f.list({}), [child]);
  await assert.rejects(f.call({ provider: CODEX, model: LUNA }), /not on the user’s/);
  const result = await f.call({});
  assert.equal(result.reasoning_effort, 'medium');
  assert.equal(f.starts[0].effective.reasoningEffort, 'medium');
  await assert.rejects(f.call({ reasoning_effort: 'low' }), /Only the user’s saved/);
});

test('live rules, provider catalog removal, unavailable effort, and cancellation fail closed', async () => {
  const request = { provider: CODEX, model: SOL };
  const vanished = setup(route('other-api', 'lead'), { catalog: [] });
  await assert.rejects(vanished.call(request), /no longer in the provider’s available catalog/);
  assert.equal(vanished.resolutions.length, 0);
  const clamped = setup(route('other-api', 'lead'), { preflight: config => ({ ...config, reasoningEffort: 'high' }) });
  await assert.rejects(clamped.call(request), /No fallback/);
  assert.equal(clamped.starts.length, 0);
  const changed = setup(route('other-api', 'lead'), { preflight: config => {
    changed.setSettings({ ...legacy, rules: [route(CODEX, SOL, 'max')] }); return config;
  } });
  await assert.rejects(changed.call(request), /changed during validation/);
  assert.equal(changed.starts.length, 0);
  const aborted = setup(route('other-api', 'lead'));
  await assert.rejects(aborted.call(request, AbortSignal.abort()), { name: 'AbortError' });
  assert.equal(aborted.starts.length, 0);
});

test('nested and alternate direct delegation are denied; native child messaging remains', async () => {
  const lead = route(CODEX, ASTRA);
  for (const options of [{ depth: 1 }, { limit: 0 }]) {
    const f = setup(lead, options);
    assert.equal(f.options.when({ agent: f.parent, modelSelection: lead }), false);
    await assert.rejects(f.call({}), /Only a lead/);
  }
  const f = setup(lead);
  for (const name of ['workflow', 'subagent_fork', 'plugin_manager', 'spawn_teammate', 'subagent_oar']) assert.ok(f.guard({ name }));
  assert.equal(f.guard({ name: 'send_message' }), undefined);
  assert.equal(f.guard({ name: 'subagent' }), undefined);
});
