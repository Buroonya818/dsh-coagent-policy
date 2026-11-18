window.__ModuleLoader__.load({
  id: '@local/dsh-coagent-policy',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const PACKAGE = '@local/dsh-coagent-policy';
    const ENTRY = 'coagent-model-policy';
    const NS = 'coagent.modelPolicy';
    const CODEX = 'openai-codex';
    const SPEEDS = ['standard', 'fast', 'ultrafast'];
    const text = {
      zh: {
        nav: 'Co-agent 模型', title: 'Co-agent 模型白名单',
        intro: '在新会话选择「Co-agent 白名单」预设后，任何主模型只能把任务交给这里勾选的子模型。主模型不变，也不会自动启动所有勾选项。',
        migrate: '下方预填了旧版 Astra / Sol 名单。勾选「为所有主模型启用共用名单」并保存后才会切换。只改常用模型，不会迁移或放宽旧名单。',
        enableShared: '为所有主模型启用共用名单', enabled: '共用名单已启用',
        load: '正在读取设置…', refresh: '刷新模型目录', refreshing: '正在加载模型…', search: '搜索模型或提供方',
        allowed: '允许的子代理模型', count: '已选', selectHelp: '勾选一项即固定该模型；勾选多项时，主代理可以从中选择。',
        effort: '推理档位', modelDefault: '模型默认', unsupported: '当前不支持', savedOffline: '已保存，但当前不在目录中',
        remove: '移除', favorite: '常用', favorites: '编辑常用模型', favoriteHint: '勾选后，会在上方列表置顶。常用与白名单互相独立。',
        save: '保存更改', discard: '放弃更改', saving: '正在保存…', saved: '已保存。设置适用于下一次委派。',
        failed: '未能保存，草稿仍保留。', conflict: '设置已在别处更新。请放弃草稿后重新编辑。', readonly: '此窗口不能编辑设置。',
        invalid: '请至少勾选一个子代理模型。', invalidEffort: '请修改或移除当前不支持的推理档位。',
        partial: '有提供方暂时无法加载；已保存的模型不会被清除。', unavailable: '暂时无法读取模型目录。可刷新重试。', none: '没有匹配的模型。',
        speed: 'Codex 速度 · 全局', speedHint: '当前 DSH 无法为单个子代理设置速度。这里只调整 Codex 订阅的全局速度，会影响此 App 中所有支持的 Codex 会话（含主代理）；不会随名单保存。Fast 和 Ultrafast 可能增加用量。',
        codeSpeed: '支持的速度', standard: '标准', fast: 'Fast', ultrafast: 'Ultrafast', applySpeed: '应用全局速度', speedSaved: '已应用全局速度。', speedFailed: '未能应用全局速度，请刷新重试。',
        speedUnavailable: '速度由提供方管理。没有可在本页单独设置的子代理速度。',
      },
      en: {
        nav: 'Co-agent models', title: 'Co-agent model allowlist',
        intro: 'In a new session using the Co-agent 白名单 preset, any lead model can delegate only to the checked co-agent models. The lead stays unchanged; checking several does not start them all.',
        migrate: 'The old Astra/Sol lists are suggested below. Check “Enable a shared list for all lead models” and save to switch. Editing favorites alone never migrates or widens the old lists.',
        enableShared: 'Enable a shared list for all lead models', enabled: 'Shared list is active',
        load: 'Reading settings…', refresh: 'Refresh model catalog', refreshing: 'Loading models…', search: 'Search models or providers',
        allowed: 'Allowed co-agent models', count: 'Selected:', selectHelp: 'Check one to pin that model, or several to let the lead choose among them.',
        effort: 'Reasoning effort', modelDefault: 'Model default', unsupported: 'Currently unsupported', savedOffline: 'Saved, but missing from the current catalog',
        remove: 'Remove', favorite: 'Favorite', favorites: 'Edit favorites', favoriteHint: 'Checked favorites move to the top above. Favorites and permissions are independent.',
        save: 'Save changes', discard: 'Discard changes', saving: 'Saving…', saved: 'Saved. Changes apply to the next delegation.',
        failed: 'Could not save. Your draft is retained.', conflict: 'Settings changed elsewhere. Discard this draft and edit again.', readonly: 'This window cannot edit settings.',
        invalid: 'Select at least one co-agent model.', invalidEffort: 'Change or remove the unsupported reasoning effort.',
        partial: 'Some providers could not be loaded. Saved models are retained.', unavailable: 'The model catalog could not be read. Refresh to try again.', none: 'No matching models.',
        speed: 'Codex speed · global', speedHint: 'This DSH version cannot set speed per co-agent. This setting changes Codex subscription speed for all supported Codex sessions in this app, including leads. It is not saved with the allowlist. Fast and Ultrafast may use more quota.',
        codeSpeed: 'Supported speeds', standard: 'Standard', fast: 'Fast', ultrafast: 'Ultrafast', applySpeed: 'Apply global speed', speedSaved: 'Global speed applied.', speedFailed: 'The global speed could not be applied. Refresh and try again.',
        speedUnavailable: 'Speed is managed by the provider. There is no per-co-agent speed control here.',
      },
    };
    const stack = { display: 'grid', gap: 12, maxWidth: 860, minWidth: 0, padding: '12px 0', color: 'var(--dsw-alias-label-primary)' };
    const muted = { margin: 0, fontSize: 12, lineHeight: 1.55, color: 'var(--dsw-alias-label-secondary)' };
    const warn = { ...muted, color: 'var(--dsw-alias-state-error-primary)' };
    const heading = { margin: 0, fontSize: 15, fontWeight: 600 };
    const field = { display: 'grid', gap: 8, minWidth: 0, padding: '9px 12px', margin: 0, border: '1px solid var(--dsw-alias-border-l4)', borderRadius: 'var(--dsw-radius-lg)' };
    const legend = { fontSize: 13, fontWeight: 600, padding: '0 4px' };
    const controls = { display: 'flex', gap: '6px 10px', flexWrap: 'wrap', alignItems: 'center', minWidth: 0 };
    const control = { fontSize: 13, padding: '5px 9px', maxWidth: '100%', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)', border: '1px solid var(--dsw-alias-border-l3)', borderRadius: 'var(--dsw-radius-lg)' };
    const checks = { display: 'flex', gap: 8, alignItems: 'flex-start', minWidth: 0, overflowWrap: 'anywhere', fontSize: 13 };
    const key = ({ provider, model }) => JSON.stringify([provider, model]);
    const route = ({ provider, model }) => ({ provider, model });
    const byKey = entries => new Map(entries.map(entry => [key(entry), entry]));
    const omit = (entries, model) => entries.filter(entry => key(entry) !== key(model));
    const toLegacyRules = value => [...new Set([...(value.astraModels ?? []), ...(value.solModels ?? [])])]
      .map(model => ({ provider: CODEX, model, reasoningEffort: 'max' }));
    const decodeCatalog = result => {
      if (!result?.ok || !Array.isArray(result.value?.groups)) throw new Error('Model catalog unavailable');
      return {
        rows: [...byKey(result.value.groups.flatMap(group => (group.models ?? []).map(model => ({
          provider: group.id, providerName: group.name ?? group.id, model: model.id, title: model.name ?? model.id,
          efforts: [...new Map((model.reasoning?.efforts ?? []).filter(effort => typeof effort.id === 'string')
            .map(effort => [effort.id, effort])).values()],
          defaultEffort: model.reasoning?.defaultEffort,
        })))).values()],
        partial: (result.value.failures?.length ?? 0) > 0,
      };
    };
    const useForm = form => React.useSyncExternalStore(cb => form.subscribe(cb), () => form.getSnapshot());
    const checkbox = (props, label) => h('label', { style: checks },
      h('input', { type: 'checkbox', style: { accentColor: 'var(--dsw-alias-brand-primary)' }, ...props }), label);
    const button = (props, label) => h('button', { type: 'button', style: control, ...props }, label);

    function CodexSpeed({ t, form, capability }) {
      const snapshot = useForm(form);
      const current = snapshot.value?.speedMode;
      const [draft, setDraft] = React.useState(null);
      const [status, setStatus] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      // The optional provider plugin owns this field. Do not write through a fallback transport.
      if (!capability || !SPEEDS.includes(current)) return h('p', { style: muted }, t('speedUnavailable'));
      const options = ['standard', ...(capability.fast.size ? ['fast'] : []), ...(capability.ultrafast.size ? ['ultrafast'] : [])];
      const selected = draft?.mode ?? current;
      const conflict = draft !== null && draft.revision !== snapshot.revision;
      const writable = snapshot.status === 'ready' && snapshot.writable === true;
      const apply = async () => {
        if (!writable || busy || conflict || !options.includes(selected) || selected === current) return;
        setBusy(true); setStatus(null);
        try {
          const ok = await form.mutate([{ op: 'set', path: ['speedMode'], value: selected }], draft.revision);
          if (ok) { setDraft(null); setStatus('speedSaved'); } else setStatus('speedFailed');
        } catch { setStatus('speedFailed'); }
        finally { setBusy(false); }
      };
      return h('fieldset', { style: field, disabled: busy },
        h('legend', { style: legend }, t('speed')),
        h('p', { style: muted }, t('speedHint')),
        h('div', { style: controls },
          h('select', { 'aria-label': t('speed'), value: selected, disabled: !writable || conflict, style: control,
            onChange: event => { setDraft({ mode: event.currentTarget.value, revision: snapshot.revision }); setStatus(null); } },
          ...[...new Set([...options, selected])].map(mode => h('option', { key: mode, value: mode, disabled: !options.includes(mode) }, t(mode)))),
          button({ disabled: !writable || conflict || !options.includes(selected) || selected === current, onClick: () => { void apply(); } }, t('applySpeed')),
          draft ? button({ onClick: () => { setDraft(null); setStatus(null); } }, t('discard')) : null),
        h('p', { role: 'status', style: conflict || status === 'speedFailed' ? warn : muted },
          conflict ? t('conflict') : !writable ? t('readonly') : busy ? t('saving') : status ? t(status) : ''));
    }

    function makeCard(ctx) {
      const form = ctx.configForms.get(ENTRY);
      const codexForm = ctx.configForms.get('codex-subscription');
      return function CoagentPolicyCard({ t }) {
        const snapshot = useForm(form);
        const [draft, setDraft] = React.useState(null);
        const [search, setSearch] = React.useState('');
        const [catalog, setCatalog] = React.useState({ rows: [], status: 'loading', partial: false, speed: null });
        const [generation, refresh] = React.useReducer(n => n + 1, 0);
        const [saving, setSaving] = React.useState(false);
        const [status, setStatus] = React.useState(null);
        React.useEffect(() => {
          const lifetime = new AbortController();
          const signal = lifetime.signal;
          setCatalog(old => ({ ...old, status: 'loading' }));
          async function load() {
            let rows, partial;
            try { ({ rows, partial } = decodeCatalog(await ctx.remote.session.modelCatalog())); }
            catch { if (!signal.aborted) setCatalog(old => ({ ...old, status: 'error', speed: null })); return; }
            if (signal.aborted) return;
            setCatalog({ rows, partial, status: 'ready', speed: null });
            if (!rows.some(model => model.provider === CODEX)) return;
            try {
              const response = await ctx.get('connection')?.rpc.call('/api', 'codex-subscription/preferences/status', {}, signal);
              if (!signal.aborted && response?.ok && Array.isArray(response.value?.fastModels) && Array.isArray(response.value?.ultrafastModels)) {
                const ids = new Set(rows.filter(model => model.provider === CODEX).map(model => model.model));
                const supported = field => new Set(response.value[field].filter(id => ids.has(id)));
                setCatalog(old => ({ ...old, speed: { fast: supported('fastModels'), ultrafast: supported('ultrafastModels') } }));
              }
            } catch { /* Optional provider metadata. */ }
          }
          void load();
          return () => lifetime.abort();
        }, [generation]);
        if (snapshot.status !== 'ready' || !snapshot.value) return h('p', { role: 'status', style: muted }, t('load'));
        const value = snapshot.value;
        const legacy = !(value.rules?.length > 0);
        const base = { rules: legacy ? toLegacyRules(value) : value.rules, favorites: value.favorites ?? [], activate: !legacy };
        const state = draft?.value ?? base;
        const writable = snapshot.writable === true;
        const conflict = draft !== null && draft.revision !== snapshot.revision;
        const dirty = draft !== null && JSON.stringify(state) !== JSON.stringify(base);
        const disabled = !writable || saving || conflict;
        const change = patch => { setDraft({ revision: draft?.revision ?? snapshot.revision, value: { ...state, ...patch } }); setStatus(null); };
        const models = byKey(catalog.rows);
        const selected = byKey(state.rules);
        const favorites = byKey(state.favorites);
        const query = search.trim().toLowerCase();
        const matches = model => `${model.provider} ${model.providerName ?? ''} ${model.model} ${model.title ?? ''}`.toLowerCase().includes(query);
        const listed = catalog.rows.filter(matches).sort((a, b) => Number(favorites.has(key(b))) - Number(favorites.has(key(a)))
          || a.providerName.localeCompare(b.providerName) || a.title.localeCompare(b.title) || key(a).localeCompare(key(b)));
        const saveRules = state.activate && (legacy || JSON.stringify(state.rules) !== JSON.stringify(base.rules));
        const saveFavorites = JSON.stringify(state.favorites) !== JSON.stringify(base.favorites);
        const invalid = saveRules && !state.rules.length;
        const invalidEffort = saveRules && state.rules.some(rule => {
          const model = models.get(key(rule));
          return rule.reasoningEffort && model && !model.efforts.some(effort => effort.id === rule.reasoningEffort);
        });
        const save = async () => {
          if (disabled || !dirty || (!saveRules && !saveFavorites) || invalid || invalidEffort) return;
          const ops = [];
          if (saveRules) ops.push({ op: 'set', path: ['rules'], value: state.rules });
          if (saveFavorites) ops.push({ op: 'set', path: ['favorites'], value: state.favorites });
          setSaving(true); setStatus(null);
          try {
            if (await form.mutate(ops, draft.revision)) { setDraft(null); setStatus('saved'); } else setStatus('failed');
          } catch { setStatus('failed'); }
          finally { setSaving(false); }
        };
        const label = model => h('span', null, model.title ?? model.model,
          h('small', { style: { ...muted, display: 'block' } }, `${model.provider}${model.title && model.title !== model.model ? ' / ' + model.model : ''}`));
        const offline = (entries, update) => entries.filter(model => !models.has(key(model))).map(model => h('div', { key: key(model), style: controls },
          h('span', { style: muted }, `${model.provider}/${model.model}${model.reasoningEffort ? ' · ' + model.reasoningEffort : ''} — ${t('savedOffline')}`),
          button({ onClick: () => update(omit(entries, model)) }, t('remove'))));
        const renderModel = model => {
          const k = key(model);
          const rule = selected.get(k);
          const unsupported = !!rule?.reasoningEffort && !model.efforts.some(effort => effort.id === rule.reasoningEffort);
          const speeds = model.provider === CODEX && catalog.speed
            ? ['standard', ...SPEEDS.slice(1).filter(mode => catalog.speed[mode].has(model.model))] : [];
          return h('div', { key: k, style: { display: 'grid', gap: 5, padding: '5px 0', borderBottom: '1px solid var(--dsw-alias-border-l4)' } },
            h('div', { style: controls }, checkbox({ checked: !!rule, onChange: event => change({
              rules: event.currentTarget.checked ? [...state.rules, route(model)] : omit(state.rules, model),
            }) }, label(model)), favorites.has(k) ? h('span', { style: muted }, `★ ${t('favorite')}`) : null),
            rule && (model.efforts.length || unsupported) ? h('label', { style: { ...controls, ...muted } }, t('effort'),
              h('select', { value: rule.reasoningEffort ?? '', style: control, onChange: event => {
                const effort = event.currentTarget.value;
                change({ rules: state.rules.map(entry => key(entry) === k ? { ...route(entry), ...(effort ? { reasoningEffort: effort } : {}) } : entry) });
              } }, h('option', { value: '' }, `${t('modelDefault')}${model.defaultEffort ? ' (' + model.defaultEffort + ')' : ''}`),
              unsupported ? h('option', { value: rule.reasoningEffort, disabled: true }, `${rule.reasoningEffort} · ${t('unsupported')}`) : null,
              ...model.efforts.map(effort => h('option', { key: effort.id, value: effort.id, title: effort.description }, effort.name ?? effort.id)))) : null,
            speeds.length > 1 ? h('p', { style: muted }, `${t('codeSpeed')}: ${speeds.map(t).join(' / ')}`) : null);
        };
        const msg = saving ? 'saving' : conflict ? 'conflict' : !writable ? 'readonly' : invalid ? 'invalid' : invalidEffort ? 'invalidEffort' : status;
        return h('section', { style: stack },
          h('h3', { style: heading }, t('title')), h('p', { style: muted }, t('intro')),
          legacy ? h('div', { style: stack }, h('p', { style: muted }, t('migrate')),
            checkbox({ checked: state.activate, disabled, onChange: event => change({ activate: event.currentTarget.checked }) }, t('enableShared'))) : h('p', { style: muted }, t('enabled')),
          h('div', { style: controls }, h('input', { type: 'search', 'aria-label': t('search'), placeholder: t('search'), style: control, value: search, onChange: event => setSearch(event.currentTarget.value) }),
            button({ disabled: catalog.status === 'loading', onClick: refresh }, t(catalog.status === 'loading' ? 'refreshing' : 'refresh'))),
          catalog.status === 'error' || catalog.partial ? h('p', { style: warn, role: 'status' }, t(catalog.status === 'error' ? 'unavailable' : 'partial')) : null,
          h('fieldset', { style: field, disabled: disabled || !state.activate }, h('legend', { style: legend }, `${t('allowed')} · ${t('count')} ${state.rules.length}`),
            h('p', { style: muted }, t('selectHelp')), ...(listed.length ? listed.map(renderModel) : [h('p', { key: 'no-model', style: muted }, t(catalog.status === 'loading' ? 'refreshing' : 'none'))]),
            ...offline(state.rules, rules => change({ rules }))),
          h('fieldset', { style: field, disabled }, h('legend', { style: legend }, t('favorites')), h('p', { style: muted }, t('favoriteHint')),
            ...listed.map(model => h(React.Fragment, { key: key(model) }, checkbox({ checked: favorites.has(key(model)), onChange: event => {
              change({ favorites: event.currentTarget.checked ? [...state.favorites, route(model)] : omit(state.favorites, model) });
            } }, label(model)))), ...offline(state.favorites, items => change({ favorites: items }))),
          h('div', { style: controls }, button({ disabled: disabled || !dirty || (!saveRules && !saveFavorites) || invalid || invalidEffort, onClick: () => { void save(); } }, t('save')),
            draft ? button({ disabled: saving, onClick: () => { setDraft(null); setStatus(null); } }, t('discard')) : null),
          h('p', { role: 'status', style: ['failed', 'conflict', 'invalid', 'invalidEffort'].includes(msg) ? warn : muted }, msg ? t(msg) : ''),
          h(CodexSpeed, { t, form: codexForm, capability: catalog.speed }));
      };
    }
    return {
      inject: ['slots', 'locale', 'configForms', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, text), 'co-agent UI copy');
        const t = ctx.locale.bind(NS);
        const Card = makeCard(ctx);
        const icon = ({ size = 18 }) => h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
          h('path', { d: 'M5 12h6m0 0V6h6m-6 6v6h6', strokeLinecap: 'round', strokeLinejoin: 'round' }),
          h('circle', { cx: 4, cy: 12, r: 2 }), h('circle', { cx: 19, cy: 6, r: 2 }), h('circle', { cx: 19, cy: 18, r: 2 }));
        ctx.effect(() => ctx.configForms.whileServed([ENTRY], () => {
          const stops = [
            ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: ENTRY, order: 41, label: () => t('nav'), locale: NS }, Card)),
            ctx.slots.inject('settings.section.icon', () => ctx.slots.register({ name: 'settings.section.icon', id: ENTRY }, icon)),
            ctx.slots.inject('plugins.bundle.config', () => ctx.slots.register({ name: 'plugins.bundle.config', key: PACKAGE, locale: NS }, Card)),
          ];
          return () => { for (const stop of stops.reverse()) stop(); };
        }), 'co-agent settings and bundle configuration');
      },
    };
  },
});
