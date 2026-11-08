(() => {
const L = window.LESSONS, KEY = 'asr-prompting-progress', SIZE = 'asr-prompting-size', RAIL = 'asr-prompting-rail';
const app = document.getElementById('app');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const pad = n => String(n).padStart(2,'0');
const MODELS = [{ id: 'glm-5.3-flash', name: 'GLM-5.3-Flash' }, { id: 'glm-5.3-flashx-legal', name: 'GLM-5.3-FlashX-Legal' }];
const words = s => s.trim() ? s.trim().split(/\s+/).length : 0;
let state = {}; try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e) {}
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const done = slug => !!(state[slug] && state[slug].done);
const total = () => L.filter(l => done(l.slug)).length;
const pref = (k, d) => { try { return localStorage.getItem(k) || d; } catch(e) { return d; } };
const setPref = (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} };

// text size: five steps, two clicks down and two up from the default (18px); the
// A− and A+ buttons deepen in tone with each click away from the default
const STEPS = [[15, 12], [16, 12], [18, 12], [20, 13], [22, 13]], DEFAULT_STEP = 2;
let step = DEFAULT_STEP; { const v = parseInt(pref(SIZE, ''), 10); if (v >= 0 && v < STEPS.length) step = v; else if (pref(SIZE, '') === 'large') step = 3; }
const applySize = () => {
  const [body, label] = STEPS[step], h = document.documentElement;
  h.style.setProperty('--fs-body', body + 'px'); h.style.setProperty('--fs-label', label + 'px'); h.style.setProperty('--fs-micro', label + 'px');
  h.dataset.size = step === DEFAULT_STEP ? 'normal' : step > DEFAULT_STEP ? 'large' : 'small';
  document.querySelectorAll('.sizes button').forEach(b => { const d = +b.dataset.step, level = Math.max(0, d * (step - DEFAULT_STEP)); b.dataset.level = String(level); b.disabled = (d < 0 && step === 0) || (d > 0 && step === STEPS.length - 1); b.setAttribute('aria-label', `${d < 0 ? 'Smaller' : 'Larger'} text (now ${body}px)`); b.title = b.getAttribute('aria-label'); });
};
applySize();
document.querySelectorAll('.sizes button').forEach(b => b.onclick = () => { step = Math.max(0, Math.min(STEPS.length - 1, step + +b.dataset.step)); setPref(SIZE, String(step)); applySize(); });

// lesson rail: 'mini' (a strip of numbered squares in the left gutter, the
// article takes the full page width) or 'full' (the 240px list beside the article)
const applyRail = m => { document.documentElement.dataset.rail = m; };
applyRail(pref(RAIL, 'mini'));

function renderProg(cur) {
  document.getElementById('prog').innerHTML = L.map((l,k) => `<a class="${done(l.slug)?'on':''}${l.slug===cur?' cur':''}" href="#/${l.slug}" title="${pad(k+1)} ${esc(l.title)}" aria-label="Lesson ${pad(k+1)}: ${esc(l.title)}${done(l.slug)?', done':''}"${l.slug===cur?' aria-current="page"':''}></a>`).join('');
}

// [[text|n]] → <mark>
function marks(s) {
  return esc(s).replace(/\[\[([\s\S]*?)\|(\d+)\]\]/g, (_, t, n) => `<mark data-n="${n}">${t}<sup>${pad(+n)}</sup></mark>`);
}
const plain = s => s.replace(/\[\[([\s\S]*?)\|\d+\]\]/g, '$1');

// the lesson list, shared by the desktop rail and the mobile sheet
const lessonList = slug => `<ol>${L.map((x,k) => `<li class="${x.slug===slug?'cur':''}${done(x.slug)?' done':''}"><a href="#/${x.slug}"${x.slug===slug?' aria-current="page"':''} aria-label="Lesson ${pad(k+1)}: ${esc(x.short)}${done(x.slug)?', done':''}"><span class="n">${pad(k+1)}</span><span class="lbl">${esc(x.short)}</span><span class="d" aria-hidden="true"></span></a></li>`).join('')}</ol>`;

function home() {
  renderProg();
  document.body.classList.remove('in-lesson');
  const n = total(), first = L.find(l => !done(l.slug)) || L[0];
  app.innerHTML = `
<section class="hero">
<p class="eyebrow mono rise"><span class="sq"></span>/ A short course · ten lessons</p>
<h1 class="h1 rise d1">Prompting for attorneys — <span class="mark">ten techniques</span> that change the answer.</h1>
<p class="lede rise d2">Each lesson puts a weak prompt and a strong one side by side, marks exactly what was added and why, checks that it landed, and lets you run the prompt yourself. About an hour, in any order.</p>
<div class="hero-meta rise d3"><span><span class="mono">${pad(n)} / ${pad(L.length)}</span> complete</span><span><span class="mono">${L.reduce((a,l)=>a+l.minutes,0)} min</span> total</span><span><span class="mono">EN</span> · examples from U.S., English and Brazilian law</span></div>
<p class="rise d4" style="margin-top:32px"><a class="btn" href="#/${first.slug}">${n ? 'Continue' : 'Start'} with lesson ${pad(L.indexOf(first)+1)} →</a></p>
</section>
<div class="sechead"><span class="mono"><span class="sq"></span>/ Lessons</span><span class="mono">Weak → strong · why · check · try</span></div>
<div class="list">${L.map((l,i) => `<a class="row ${done(l.slug)?'done':''}" href="#/${l.slug}">
<span class="num">${pad(i+1)}</span>
<span><span class="t">${esc(l.title)}</span><span class="o" style="display:block">${esc(l.one)}</span></span>
<span class="go"><span class="st">${done(l.slug) ? 'Done' : l.minutes + ' min'}</span><span class="arrow">→</span></span></a>`).join('')}</div>
<div class="sechead"><span class="mono"><span class="sq"></span>/ After the course</span></div>
<section class="cta"><div><h2>Let's get rid of that problem nobody wants to solve.</h2><p>Teams whose work now touches product, data and AI — fractional general counsel, legal-AI advisory and implementation.</p></div><a class="btn ondark" href="https://arthur.law/contact/">Contact →</a></section>`;
}

function lesson(slug) {
  const i = L.findIndex(l => l.slug === slug); if (i < 0) return (location.hash = '#/');
  const l = L[i], prev = L[i-1], next = L[i+1], st = state[slug] || {};
  const weakText = l.weak, strongText = plain(l.strong);
  renderProg(slug);
  document.body.classList.add('in-lesson');
  window.scrollTo(0,0);
  app.innerHTML = `
<div class="lesson">
<aside class="rail" id="rail" aria-label="Lessons">
<div class="rail-head"><span class="mono"><span class="sq"></span>/ Lessons</span><button class="rail-pin" id="railpin" type="button"></button></div>
${lessonList(slug)}
<a class="back mono" href="#/"><span class="arr">←</span><span class="lbl">Overview</span></a>
</aside>
<article class="art">
<p class="eyebrow mono rise"><span><span class="sq"></span>Lesson ${pad(i+1)} of ${pad(L.length)}</span><span>${l.minutes} min</span>${done(slug)?'<span>Done</span>':''}</p>
<h1 class="rise d1">${esc(l.title)}</h1>
<p class="one rise d2">${esc(l.one)}</p>

<section class="sec rise d3"><div class="lab"><span class="mono"><span class="sq"></span>/ The situation</span></div>
<div class="situation">${esc(l.situation)}</div></section>

<section class="sec rise d4"><div class="lab"><span class="mono"><span class="sq"></span>/ Two prompts</span><span class="mono r">Tap a highlight</span></div>
<div class="seg"><button class="on" data-show="without">Without</button><button data-show="with">With the technique</button></div>
<div class="cmp" id="cmp" data-show="without">
<div class="pane without"><div class="ph"><span class="mono">Without</span><span class="meta">${words(weakText)} words</span></div><div class="prompt">${esc(l.weak)}</div></div>
<div class="pane with"><div class="ph"><span class="mono">With the technique</span><span class="meta">${words(strongText)} words · ${pad(l.notes.length)} changes</span></div><div class="prompt" id="strong">${marks(l.strong)}</div></div>
</div>
<ol class="notes" id="notes">${l.notes.map((n,k) => `<li data-n="${k+1}"><span class="n">${pad(k+1)}</span><span>${esc(n)}</span></li>`).join('')}</ol>
</section>

<section class="sec why"><div class="lab"><span class="mono"><span class="sq"></span>/ Why it works</span></div>
${l.why.map(p => `<p>${esc(p)}</p>`).join('')}
${l.aside ? `<div class="aside"><span class="mono">Field note</span><span>${esc(l.aside)}</span></div>` : ''}
</section>

<section class="sec"><div class="lab"><span class="mono"><span class="sq"></span>/ Check yourself</span><span class="mono r">One question</span></div>
<div class="quiz" id="quiz"><div class="q">${esc(l.check.q)}</div>
<div class="opts">${l.check.opts.map((o,k) => `<button class="opt" data-k="${k}"><span class="k">${String.fromCharCode(65+k)}</span><span>${esc(o)}</span></button>`).join('')}</div>
<div class="fb" id="fb"><span class="mono" id="fbl"></span><span id="fbt"></span></div></div>
</section>

<section class="sec"><div class="lab"><span class="mono"><span class="sq"></span>/ Try it</span><span class="mono r">Edit, then run</span></div>
<div class="try">
<div class="chips" role="group" aria-label="Load a prompt"><button class="chip" data-load="weak" aria-pressed="false">Load weak prompt</button><button class="chip" data-load="strong" aria-pressed="true">Load strong prompt</button></div>
<textarea id="ta" placeholder="Write your own prompt, or load one above and improve it." spellcheck="false">${esc(strongText)}</textarea>
<div class="tryfoot">
<div class="opts-row">
<div class="along" role="group" aria-label="Run alongside"><span class="mono">Run alongside</span><div class="segc"><button class="aopt" data-along="weak" aria-pressed="true">Weak</button><button class="aopt" data-along="strong" aria-pressed="false">Strong</button></div></div>
<div class="along" role="group" aria-label="Model"><span class="mono">Model</span><div class="segc">${MODELS.map((m, k) => `<button class="mopt" data-model="${m.id}" aria-pressed="${k === 0}">${m.name}</button>`).join('')}</div></div>
</div>
<div class="tryact"><button class="btn ghost" id="clear">Clear</button><button class="btn ghost" id="copy">Copy</button><button class="btn" id="run">Run →</button></div>
</div>
<p class="trynote mono" id="trynote">Runs on a live model · responses are not legal advice</p>
<div class="resp" id="resp"></div>
</div></section>

<section class="sec"><div class="lab"><span class="mono"><span class="sq"></span>/ Further reading</span></div>
<a class="res" href="${l.resource.url}" target="_blank" rel="noopener"><span><span class="t" style="display:block">${esc(l.resource.title)}</span><span class="d" style="display:block">${esc(l.resource.desc)}</span></span><span class="arrow">→</span></a></section>

<nav class="lnav">
${prev ? `<a class="prev" href="#/${prev.slug}"><span class="mono">← Lesson ${pad(i)}</span><span class="tt">${esc(prev.title)}</span></a>` : `<a class="prev" href="#/"><span class="mono">← Overview</span><span class="tt">All lessons</span></a>`}
<div class="mid"><button class="btn ${done(slug)?'ghost':''}" id="mark">${done(slug) ? 'Completed ✓' : 'Mark complete'}</button></div>
${next ? `<a class="next" href="#/${next.slug}"><span class="mono">Lesson ${pad(i+2)} →</span><span class="tt">${esc(next.title)}</span></a>` : `<a class="next" href="#/"><span class="mono">Finish →</span><span class="tt">Back to overview</span></a>`}
</nav>
</article></div>
<div class="mbar">${prev ? `<a href="#/${prev.slug}">← ${pad(i)}</a>` : `<a href="#/">← Home</a>`}<button class="c" id="sheettog" type="button" aria-expanded="false" aria-controls="sheet">Lesson <b>${pad(i+1)}</b>&nbsp;/ ${pad(L.length)}<span class="up" aria-hidden="true">↑</span></button>${next ? `<a class="r" href="#/${next.slug}">${pad(i+2)} →</a>` : `<a class="r" href="#/">Finish →</a>`}</div>
<div class="sheet-bd" id="sheetbd" hidden></div>
<section class="sheet" id="sheet" aria-label="Lessons" hidden>
<div class="sheet-head"><span class="mono"><span class="sq"></span>/ Lessons</span><a class="mono" href="#/">Overview →</a><button class="sheet-x" id="sheetx" type="button" aria-label="Close lesson list">↓</button></div>
${lessonList(slug)}
</section>`;

  // rail: pin or collapse
  const pin = document.getElementById('railpin');
  const paintPin = () => { const mini = document.documentElement.dataset.rail === 'mini'; pin.textContent = mini ? 'Pin' : 'Collapse'; pin.title = mini ? 'Keep the lesson list open' : 'Collapse the list to a strip'; pin.setAttribute('aria-pressed', String(!mini)); };
  paintPin();
  pin.onclick = () => { const m = document.documentElement.dataset.rail === 'mini' ? 'full' : 'mini'; applyRail(m); setPref(RAIL, m); paintPin(); };
  // the mini strip opens as a flyout on hover or focus; close it after a pick
  document.querySelectorAll('#rail ol a').forEach(a => a.onclick = () => document.activeElement && document.activeElement.blur());

  // mobile sheet
  const sheet = document.getElementById('sheet'), bd = document.getElementById('sheetbd'), tog = document.getElementById('sheettog');
  const openSheet = o => { sheet.hidden = !o; bd.hidden = !o; tog.setAttribute('aria-expanded', String(o)); document.body.classList.toggle('sheet-open', o); if (o) { const cur = sheet.querySelector('li.cur a'); cur && cur.focus(); } else tog.focus(); };
  tog.onclick = () => openSheet(sheet.hidden);
  bd.onclick = () => openSheet(false);
  document.getElementById('sheetx').onclick = () => openSheet(false);
  sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', () => openSheet(false)));
  document.onkeydown = e => { if (e.key === 'Escape' && !sheet.hidden) openSheet(false); };

  // highlight linking
  const sync = (n, on) => { document.querySelectorAll(`#strong mark[data-n="${n}"], #notes li[data-n="${n}"]`).forEach(e => e.classList.toggle('on', on)); };
  document.querySelectorAll('#strong mark, #notes li').forEach(e => {
    e.onmouseenter = () => sync(e.dataset.n, true); e.onmouseleave = () => sync(e.dataset.n, false);
    e.onclick = () => { const was = e.classList.contains('on'); document.querySelectorAll('.on[data-n]').forEach(x => x.classList.remove('on')); if (!was) sync(e.dataset.n, true); if (window.innerWidth <= 900 && e.tagName === 'MARK') { const li = document.querySelector(`#notes li[data-n="${e.dataset.n}"]`); const r = li.getBoundingClientRect(); if (r.bottom > innerHeight - 70) window.scrollBy({top: r.bottom - innerHeight + 90, behavior: 'smooth'}); } };
  });
  // mobile segmented
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => { document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); document.getElementById('cmp').dataset.show = b.dataset.show; });
  // quiz
  const markDone = d => { document.querySelectorAll('#rail li, #sheet li').forEach((li, k) => { if (k % L.length === i) li.classList.toggle('done', d); }); };
  const answer = k => {
    const opts = document.querySelectorAll('.opt'); opts.forEach(o => { o.disabled = true; o.classList.toggle('right', +o.dataset.k === l.check.answer); o.classList.toggle('wrong', +o.dataset.k === k && k !== l.check.answer); });
    const ok = k === l.check.answer; document.getElementById('fbl').textContent = ok ? 'Correct' : 'Not quite'; document.getElementById('fbt').textContent = l.check.fb[k]; document.getElementById('fb').classList.add('show');
    state[slug] = Object.assign({}, state[slug], { answered: k, done: true }); save(); renderProg(slug);
    const m = document.getElementById('mark'); m.textContent = 'Completed ✓'; m.classList.add('ghost');
    markDone(true);
  };
  document.querySelectorAll('.opt').forEach(o => o.onclick = () => answer(+o.dataset.k));
  if (typeof st.answered === 'number') answer(st.answered);
  // mark complete
  document.getElementById('mark').onclick = () => { const d = !done(slug); state[slug] = Object.assign({}, state[slug], { done: d }); save(); renderProg(slug); const m = document.getElementById('mark'); m.textContent = d ? 'Completed ✓' : 'Mark complete'; m.classList.toggle('ghost', d); markDone(d); };

  // try it: the textarea, what it holds, and what runs alongside it
  const ta = document.getElementById('ta');
  const which = () => { const v = ta.value.trim(); return v === weakText.trim() ? 'weak' : v === strongText.trim() ? 'strong' : v ? 'custom' : 'empty'; };
  // along: the companion prompt ('weak' | 'strong' | ''); model: one MODELS id
  let along = 'weak', model = pref('asr-prompting-model', MODELS[0].id);
  if (!MODELS.some(x => x.id === model)) model = MODELS[0].id;
  const runs = () => { const w = which(); return 1 + (along && along !== w ? 1 : 0); };
  const paint = () => {
    const w = which();
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.load === w)));
    // the prompt already in the box cannot also run alongside itself; it fades, the other stays live
    document.querySelectorAll('.aopt').forEach(b => { const same = b.dataset.along === w; b.disabled = same; b.setAttribute('aria-pressed', String(!same && b.dataset.along === along)); b.title = same ? 'This prompt is already in the box' : (b.dataset.along === along ? 'Click to run only the prompt in the box' : `Also run the ${b.dataset.along} prompt`); });
    document.querySelectorAll('.mopt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === model)));
    const n = runs();
    document.getElementById('trynote').textContent = (n > 1 ? `${n} runs, one after the other, count as ${n} practice tries` : 'Runs on a live model') + ' · responses are not legal advice';
  };
  const setAlong = a => { along = a; paint(); };
  // loading the weak prompt pairs it with the strong one, and the other way round;
  // a custom prompt keeps whatever was picked
  const autoAlong = () => { const w = which(); if (w === 'weak') along = 'strong'; else if (w === 'strong') along = 'weak'; paint(); };
  document.querySelectorAll('.chip').forEach(c => c.onclick = () => { ta.value = c.dataset.load === 'weak' ? weakText : strongText; ta.focus(); autoAlong(); });
  document.getElementById('clear').onclick = () => { ta.value = ''; ta.focus(); paint(); };
  // a pressed option toggles off (run the box alone); an unpressed one selects
  document.querySelectorAll('.aopt').forEach(b => b.onclick = () => setAlong(along === b.dataset.along ? '' : b.dataset.along));
  document.querySelectorAll('.mopt').forEach(b => b.onclick = () => { model = b.dataset.model; setPref('asr-prompting-model', model); paint(); });
  ta.addEventListener('input', paint);
  autoAlong();
  document.getElementById('copy').onclick = e => { navigator.clipboard && navigator.clipboard.writeText(ta.value); e.target.textContent = 'Copied'; setTimeout(() => e.target.textContent = 'Copy', 1200); };

  const label = w => w === 'weak' ? 'Weak prompt' : w === 'strong' ? 'Strong prompt' : 'Your prompt';
  const column = (id, title, sub, p) => `<div class="rcol" id="${id}"><div class="rh"><span><span class="mono">${title}</span><span class="mono rsub">${sub}</span></span><span class="mono rmeta">${words(p)} words in</span></div><div class="rb"><span class="spin"></span>Generating</div></div>`;
  const ask = async (col, p, m) => {
    const rb = col.querySelector('.rb'), rm = col.querySelector('.rmeta'), t0 = Date.now();
    try {
      // Practice instruction only. The val uses this same sentence and ignores any other system text.
      // `model` names the model asked for; the val falls back to its default until it routes by model.
      const res = await fetch('/api/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system: 'You are assisting a lawyer who is practising prompting techniques. Answer the prompt directly and professionally. Do not add disclaimers about seeking legal counsel.', prompt: p, model: m }) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) { rb.textContent = 'Too many practice runs. Copy the prompt into your own assistant and try again in a minute.'; rm.textContent = 'limit'; }
      else if (!res.ok || typeof data.text !== 'string' || !data.text.trim()) throw new Error('empty');
      else { rb.textContent = data.text; rm.textContent = `${((Date.now()-t0)/1000).toFixed(1)} s · ${words(data.text)} words`; }
    } catch (err) { rb.textContent = 'The model could not be reached. Copy the prompt into your own assistant instead.'; rm.textContent = 'error'; }
  };
  document.getElementById('run').onclick = async () => {
    const p = ta.value.trim(); if (!p) return;
    const run = document.getElementById('run'), resp = document.getElementById('resp'), w = which();
    const other = along && along !== w ? (along === 'weak' ? weakText : strongText) : '';
    const prompts = other ? [[label(w), p], [label(along), other]] : [[label(w), p]];
    const mdl = MODELS.find(x => x.id === model) || MODELS[0];
    const jobs = prompts.map(([t, q]) => ({ t, q, mdl }));
    run.disabled = true;
    resp.classList.add('show'); resp.classList.toggle('pair', prompts.length > 1); resp.dataset.cols = String(prompts.length);
    resp.innerHTML = jobs.map((j, k) => column('r' + k, j.t, j.mdl.name, j.q)).join('');
    // one after the other: the shared quota allows four calls a minute across every visitor
    for (let k = 0; k < jobs.length; k++) await ask(document.getElementById('r' + k), jobs[k].q, jobs[k].mdl.id);
    run.disabled = false;
  };
}

function route() {
  const path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (location.hash === '#/' || location.hash === '#') return home();
  const fromHash = location.hash.replace(/^#\/?/, '');
  const slug = fromHash || (L.some(l => l.slug === path) ? path : '');
  slug ? lesson(slug) : home();
}
addEventListener('hashchange', route); route();
})();
