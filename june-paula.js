// PaulaJS (Portable Adaptable Utility for Lightweight Applications)
// https://github.com/EduardoRuizM/june-paulajs (2.1.5) - Copyright (c) 2025 Eduardo Ruiz <eruiz@dataclick.es>

'use strict';

class JuNePAU {
  constructor() {
    this.module = 0;
    this.data = {};
    this.funcs = {};
    this.main = 0;
    this.outlet = 0;
    this.routes = [];
    this.params = {};
    this.getparams = {};
    this.wins = [];
    this.toasts = [];
    this.files = {total: {size: 0, upload: 0, percent: 0}};
    this.lng = window.navigator.language;
    this.lang = -1;
    this.bgmod = {};
    this._evnmap = new WeakMap();
    this._stopup = {s: 0, g: 0, o: new MutationObserver((mutationList, observer) => {for(const mutation of mutationList) {if(mutation.type === 'childList' && [...mutation.addedNodes].some(n => n.nodeType === 1 && !n.closest('[data-jpau-ignore]'))) {this.prepHTML(); break;}}})};
    this.path = document.currentScript.getAttribute('path') || '/';
  }
  setProxy(d) {
    const mod_proxy = {
      set: function(obj, p, v) {
	if(p === '_SetN_') {
	  this._N_1 = v;
	  return true;
	}
	if(p === '_SetN2_') {
	  this._N_2 = v;
	  return true;
	}
	obj[p] = v;
	this.updHTML(document, (this._N_2) ? this._N_2 : p);
	return true;
      }.bind(this),
      get: function(t, p) {
	const v = t[p];
	if(typeof v === 'function') {
	  if(!Array.prototype[p])
	    return v.bind(this);
	  return function() {
	    const r = Array.prototype[p].apply(t, arguments);
	    if(!this._stopup.g)
	      this.updHTML(document, this._N_1);
	    return r;
	  }.bind(this);
	}
	if(typeof v === 'object' && v) {
	  let o = new Proxy(v, {...mod_proxy});
	  o._SetN_ = p;
	  o._SetN2_ = (p >= 0) ? this._N_1 : '';
	  return o;
	}
	return v;
      }.bind(this)
    };
    return new Proxy(d || {}, {...mod_proxy});
  }
  boundHnd(e, n, h) {
    const bh = h.bind(this);
    e.addEventListener(n, bh);
    if(!this._evnmap.has(e)) this._evnmap.set(e, []);
    this._evnmap.get(e).push({n, bh});
  }
  createHnd(c) {
    try {
      return new Function('event', `with(this) {${c}}`);
    } catch(e) {
      console.error('Error compiling event handler:', c, e);
      return () => {};
    }
  }
  prepEvn(e, p, d, t) {
    if((!d && this.inFor(e, t)) || t?.dataset?.jpauIgnore)
      return;

    Array.prototype.slice.call(e.attributes || {}).forEach(i => {
      if(i.name.startsWith('@')) {
	const n = i.name.substring(1);
	e.dataset.jpauproc = 1;
	const h = this.createHnd(this.replHTML(this.d2d(d) + e.getAttribute(i.name).replaceAll('$this.', 'event.target.'), d));
	this.boundHnd(e, n, h);
      }
    });
  }
  prepElm(e, p, d, t) {
    if(e.dataset?.jpauproc)
      return;

    if(!d && this.inFor(e, t))
      return;

    this.prepEvn(e, p, d, t);
    Array.prototype.slice.call(e.attributes || {}).forEach(function(i) {
      if(i.name.startsWith(':') || i.name.startsWith('*')) {
	e.dataset.jpauproc = e.dataset?.jpauproc || 1;
	e.dataset.jpauattr = 1;
      }
      if(/^\*(value|selected|checked)$/.test(i.name) && this.chkVar(e.getAttribute(i.name))) {
	let n = i.name.substring(1).toLowerCase(), o = (n === 'selected') ? e.parentNode : e, r = (n === 'value') ? 'change textInput keyup paste' : ((n === 'checked') ? 'click' : 'change');
	if(o.dataset.jpauproc == 2)
	  return;
	o.dataset.jpauproc = 2;
	r.split(' ').forEach(v => o.addEventListener(v, this.chgElm.bind(this)));
      }
    }.bind(this));

    let c;
    if(!e.dataset?.jpauihtml && !/^SCRIPT|PRE$/.test(e.tagName) && (e.content || e.innerHTML) && (c = (e.innerHTML) ? 'innerHTML' : 'content') && e[c] && e[c].toString().includes('{{ ') && !e.childElementCount) {
      e.dataset.jpauproc = e.dataset.jpauattr = 1;
      e.dataset.jpauihtml = e[c];
    }

    if((e.dataset?.jpauIf || e.dataset?.jpauFor) && !e.dataset?.jpauid) {
      e.dataset.jpauproc = 1;
      e.dataset.jpauid = this.genJId();
    }
  }
  prepHTML(m, p, d, t) {
    const elms = (m ?? document).querySelectorAll('*:not([data-jpau-ignore])');
    for(let i of elms)
      this.prepElm(i, p, d, t);
    this.updHTML(m ?? document, p, d, t);
  }
  replHTML(v, d) {
    let t = v;
    const p = d ? { ...d, ...this.data } : this.data, o = t;
    [...v.matchAll(/{{\s*([^{}]+)\s*}}/g)].forEach(i => {
      const e = i[1];
      if(p[e] !== undefined) {
	t = t.replace(i[0], p[e]);
	return;
      }
      try {
	const c = e.replaceAll(/([a-z]{1}[a-z0-9_\-\.,]*)([\s\[\]\)]+|$)/gi, s => (/^(this|june_pau|data)\./.test(s)) ? s : 'p.' + s);
	const fn = new Function('p', `with(this) { return (${c}); }`), r = fn.call(this, p);
	if(r !== undefined)
	  t = t.replace(i[0], r);
      } catch(e) {}
    });
    return (t !== o && t.match(/{{\s*[^{}]+\s*}}/)) ? this.replHTML(t, d) : t;
  }
  chkDo(p, v, d) {
    return (this.main.data?.forceUpdate || !p || (p && typeof v === 'string' && (v.includes(p) || (d && Object.keys(d).some(e => v.includes(e))))));
  }
  chkVar(v) {
    return /^[\w\._\-\[\]]+$/.test(v);
  }
  d2v(d) {
    let s = '';
    if(d) {
      for(let v in d)
	s+= ((s) ? ', ' : '') + v + " = d['" + v + "']";
      s = (s) ? `let ${s}; ` : '';
    }
    return s;
  }
  d2d(d) {
    let s = '';
    for(let v in d)
      s+= ((s) ? ', ' : '') + v + ' = ' + JSON.stringify(d[v]);
    return (s) ? `let ${s}; ` : '';
  }
  inFor(e, t, p) {
    let o = (p) ? e.parentNode : e;
    while(o && o !== t) {
      if(o.dataset?.jpauFor || o.dataset?.jpauDep)
	return true;

      o = o.parentNode;
    }
  }
  updElm(e, p, d, t) {
    const pp = (p) ? ((e.dataset.jpauihtml) ? e.dataset.jpauihtml : `{{ ${p} }}`) : 0;

    if(this.inFor(e, t, true))
      return;

    e._jpau_cache ??= {};
    Array.prototype.slice.call(e.attributes || {}).forEach(function(i) {
      let t = i.name.substring(1);
      if(i.name.startsWith(':')) {
	let v = e.getAttribute(i.name);
	if(this.chkDo(pp, v) || this.chkDo(p, v)) {
	  let r = this.replHTML(v, d);
	  if(e._jpau_cache[t] !== r) {
	    e.setAttribute(t, r);
	    e._jpau_cache[t] = r;
	  }
	}
      }

      if(i.name.startsWith('*')) {
	let a = this.d2v(d), v = this.replHTML(e.getAttribute(i.name), d), c = /^selected|checked|disabled|required|readonly|multiple|autofocus$/i.test(t), r;
	if(this.chkDo(p, v)) {
	  if((c || t === 'value') && this.chkVar(v))
	    r = eval(`${a}(typeof ${v} === 'object' && ${v} !== null) ? ${v}['${(t === 'selected') ? e.value : (e.id || e.name)}'] : ((t === 'selected') ? ${v} == e.value : ((${v} === 'checked') ? e.checked : ${v}));`);
	  else
	    r = eval(`${a}${v};`);
	  e._jpau_cache ??= {};
	  if(!r && c) {
	    if(e.hasAttribute(t)) {
	      e.removeAttribute(t);
	      delete e._jpau_cache[t];
	    }
	  } else {
	    if(e.tagName === 'TEXTAREA' && t === 'value') {
	      if(e._jpau_cache.value !== r) {
		e.value = r;
		e._jpau_cache.value = r;
	      }
	    } else {
	      if(e.parentNode.tagName === 'SELECT' && !e.parentNode.multiple)
		e.parentNode.value = e.value;
	      else {
		let v = (c) ? '' : r;
		if(e._jpau_cache[t] !== v) {
		  e.setAttribute(t, v);
		  e._jpau_cache[t] = v;
		}
	      }
	    }
	  }
	}
      }
    }.bind(this));

    if(e.dataset?.jpauihtml) {
      let v = e.dataset.jpauihtml, c = (e.content) ? 'content' : 'innerHTML';
      if(this.chkDo(p, v, d) || this.chkDo(p, e[c], d)) {
	let r = this.replHTML(v, d);
	if(e._jpau_html !== r) {
	  e[c] = r;
	  e._jpau_html = r;
	}
      }
    }
  }
  updIf(e, p, d, t) {
    if(e.dataset?.jpauIf && this.chkDo(p, e.dataset.jpauIf))
      e.hidden = !eval(this.d2v(d) + this.replHTML(e.dataset.jpauIf, d));
  }
  updForLn(v) {
    if(++v.n > 1) {
	let c = v.e.cloneNode(true);
	c.querySelectorAll('[data-jpau-dep]').forEach(e => e.remove());
	c.querySelectorAll('[data-jpauid]').forEach(e => e.dataset.jpauid = this.genJId());
	c.dataset.jpauid = this.genJId();
	c.dataset.jpauDep = v.e.dataset.jpauid;
	c.dataset.jpauDepId = `${v.e.dataset.jpauid}_${v.n}`;
	c.removeAttribute('data-jpau-for');
	c.querySelectorAll('[data-jpauproc]').forEach(e => e.removeAttribute('data-jpauproc'));
	v.lst.insertAdjacentHTML('afterend', c.outerHTML);
	v.lst = document.querySelector(`[data-jpauid='${c.dataset.jpauid}']`);
    } else
	v.e.hidden = false;

    v.lst.removeAttribute('data-jpauproc');
    this.prepElm(v.lst, undefined, v.d, v.e);
    this.updElm(v.lst, undefined, v.d, v.e);
    v.lst.querySelectorAll('*').forEach(e => this.prepElm(e, undefined, v.d, v.e));
    this.updHTML(v.lst, undefined, v.d);
    v.lst.querySelectorAll('*').forEach(e => this.prepEvn(e, undefined, v.d, v.e));
    return v;
  }
  updForv(e) {
    let a = '', n = /^for[^\(]*\(([^;]+)/i.exec(e.dataset.jpauFor);
    n && n[1] && n[1].split(',').forEach(e => {e = /^((let|var|const)\s+)*([^\s|=]+)/i.exec(e.trim()); a+= ((a) ? ', ' : '') + `${e[3]}: ${e[3]}`;});
    return a;
  }
  updFore(v, p, d) {
    v.n++;
    let m = (v.n > 1) ? v.p.querySelector(`[data-jpau-dep-id='${v.e.dataset.jpauid}_${v.n}']`) : v.e;
    this.updHTML(m, p, d);
    return v;
  }
  updFor(e, p, d, t) {
    if(this.inFor(e, t, true))
      return;

    if(!this.chkDo(p, e.dataset.jpauFor)) {
      if(e.dataset.jpauid) {
	let v = {n: 0, e: e, p: e.parentNode}, a = this.updForv(e);
	eval(`${e.dataset.jpauFor} v = this.updFore(v, p, {${a}, ...d});`);
      }
      if(!(e instanceof HTMLOptionElement))
	return;
    }
    if(!isNaN(parseInt(p, 10)))
      return;

    let a = this.updForv(e);
    if(!a)
      return;

    let v = {n: 0, lst: e, id: e.dataset.jpauid, e: e, p: p};
    document.querySelectorAll(`[data-jpau-dep='${v.id}']`).forEach(e => e.remove());
    e.hidden = true;
    if(e.parentNode.tagName === 'SELECT' && !e.parentNode.multiple)
      e.parentNode.selectedIndex = -1;

    eval(`${this.d2v(d)}${e.dataset.jpauFor} v = this.updForLn({...v, d: {${a}, ...d}});`);
  }
  updHTML(t, p, d) {
    if(!t || t?.dataset?.jpauIgnore) return;
    this.DOMobs(1);
    t.querySelectorAll('[data-jpauattr]').forEach(e => this.updElm(e, p, d, t));
    t.querySelectorAll('[data-jpau-if]').forEach(e => this.updIf(e, p, d, t));
    this._stopup.g++;
    t.querySelectorAll('[data-jpau-for]').forEach(e => this.updFor(e, p, d, t));
    this._stopup.g--;
    t.querySelectorAll('[data-jpau-upload]').forEach(e => {
	if(!e.dataset?.jpauprocu) {
	  e.dataset.jpauprocu = 1;
	  e.addEventListener('change', this.uplFile.bind(this));
	}
    });
    t.querySelectorAll('[data-jpau-upload-target]').forEach(e => {
	if(!e.dataset?.jpauprocu) {
	  e.dataset.jpauprocu = 1;
	  e.addEventListener('drop', this.uplFile.bind(this));
	  e.addEventListener('paste', this.uplFile.bind(this));
	  e.addEventListener('dragover', e => {e.preventDefault(); event.target.style.backgroundColor = (this.main.data?.dragColor) ?? '#CFC'});
	  e.addEventListener('dragleave', e => event.target.style.backgroundColor = '');
	}
    });
    this.DOMobs(-1);
  }
  recElm(m, e, p, d, t, o) {
    if(o)
      this[m](e, p, d, t);

    e.querySelectorAll('*').forEach(e => this[m](e, p, d, t));
  }
  chgElm(e) {
    let o = e.target, v = o.getAttribute('*value'), c = o.getAttribute('*checked');
    if(v)
      eval(`if(typeof ${v} === 'object' && ${v} !== null) ${v}[(o.id) ? o.id : o.name] = o.value; else ${v} = o.value;`);
    else if(c)
      eval(`if(typeof ${c} === 'object' && ${c} !== null) ${c}[(o.id) ? o.id : o.name] = o.checked; else ${c} = o.checked;`);
    else {
      let a = {}, v = o.firstElementChild.getAttribute('*selected');
      for(let i of o.options)
	a[i.value] = i.selected;
      if(v) eval(`if(o.multiple) ${v} = a; else ${v} = (o.selectedOptions.length) ? o.selectedOptions[0].value : null;`);
    }
  }
  async load(m) {
    try {
      if(this.main === 0) {
	m = (m) ? m : await import(this.path + 'main.js');
	this.main = {};
	for(let v in m)
	  this.main[v] = m[v];
	this.bnd(this.main.funcs);
	this.main.data = this.setProxy(this.main.data);
      }
    } catch(e) {
      console.error(e.stack);
    }

    if(this.lang === -1)
      this.setLang(localStorage.getItem('lang') || window.navigator.language);
    if(this.main?.funcs?.onLoad)
      this.main.funcs.onLoad.bind(this)();

    this.link();
  }
  DOMobs(s) {
    this._stopup.s+= s;
    if(!this._stopup.s)
      this._stopup.o.observe(document.body, {attributes: false, childList: true, subtree: true});
    else
      this._stopup.o.disconnect();
  }
  bnd(f) {
    for(const i in f)
      f[i] = f[i].bind(this);
  }
  async importMod(n, bg) {
    n = n || {};
    const m = (typeof n === 'object') ? n : await import(`${this.path}${n}.js`), prev = this.module, mod = (typeof n === 'object') ? (bg || 'index') : n.split('/').pop();
    if(this.module === mod && this.main.data?.skipReload) {
      if(this.funcs.onMount)
	this.funcs.onMount.bind(this)(true);
      return;
    }
    this.module = mod;

    if(prev && this.bgmod[prev]) {
      this.bgmod[prev] = {data: this.data, funcs: this.funcs, top: document.documentElement.scrollTop};
      this.e(`PAUBGDIV_${prev}`).style.display = 'none';
      if(this.funcs.onVisible)
      this.funcs.onVisible.bind(this)(false);
    }

    if(this.bgmod[mod]) {
      this.data = this.bgmod[mod].data;
      this.funcs = this.bgmod[mod].funcs;
      !prev && this.outlet && (this.outlet.style.display = 'none');
      this.e(`PAUBGDIV_${mod}`).style.display = '';
      window.scrollTo({top: this.bgmod[mod].top, behavior: 'smooth'});
    } else {
      this.DOMobs(1);
      this.data = this.setProxy(m.data);
      this.funcs = m.funcs ?? {};
      this.bnd(this.funcs);
      if(bg) {
	this.bgmod[mod] = {data: this.data, funcs: this.funcs};
	this.outlet?.insertAdjacentHTML('afterend', `<div id="PAUBGDIV_${mod}"></div>`);
      }
      if(this.funcs.onLoad)
	this.funcs.onLoad.bind(this)();

      this.outlet && (this.outlet.style.display = 'none');
      if(bg) {
	this.outlet && (this.outlet.innerHTML = '');
	this.e(`PAUBGDIV_${mod}`).innerHTML = m.html?.call?.(m) ?? m.html ?? '';
      } else
	this.outlet && (this.outlet.innerHTML = m.html?.call?.(m) ?? m.html ?? '');

      this.prepHTML();
      !bg && this.outlet && (this.outlet.style.display = '');
      this.DOMobs(-1);
      window.scrollTo({top: 0, behavior: 'smooth'});
    }

    if(bg && this.funcs.onVisible)
      this.funcs.onVisible.bind(this)(true);
    if(this.main?.funcs?.onMount) {
      this.main.funcs.onMount();
      delete this.main.funcs.onMount;
    }
    if(this.funcs.onMount)
      this.funcs.onMount.bind(this)();
    if(this.main.funcs.onReady)
      this.main.funcs.onReady.bind(this)();
  }
  link(u) {
    let p = new URL(u ?? '', window.location).pathname;
    if(this.main?.funcs?.onLink && this.main.funcs.onLink.bind(this)(p))
      return;

    this.params = {};
    this.getparams = new URLSearchParams(window.location.search);
    let g, i = this.routes.findIndex(e => {
      g = p.match(new RegExp('^' + e.r.replace(/:([^/]+)/g, '(?<$1>[^/]+)') + '$'));
      return g;
    });

    if(i === -1 && (i = this.routes.findIndex(e => e.r === '(default)')) === -1)
      return;

    history.pushState({url: u}, document.title, u);
    this.params = g?.groups || {};
    this.importMod(this.routes[i].m, this.routes[i].bg === 'true');
  }
  setLang(c) {
    if(!this?.main?.langs)
      return;

    let p = this.lang, l = this.main.langs.findIndex(i => i.code === c);
    if((l === -1) && (l = this.main.langs.findIndex(i => i.default === c.substring(0, 2))) === -1)
      l = 0;

    this.lng = c;
    this.lang = l;
    localStorage.setItem('lang', c);
    if(p !== -1)
      this.updHTML(document);
  }
  genId() {
    return ~~(Math.random() * 9999999) + 100;
  }
  genJId() {
    return 'JPID' + this.genId();
  }
  e(e) {
    return document.getElementById(e);
  }
  stopp() {
    event?.preventDefault(), event?.stopPropagation();
  }
  html2text(s) {
    let e = document.createElement('div');
    e.innerHTML = s.replace(/\r|\n/g,'').replace(/<\s*\/?br\s*[\/]?>/gi,"\n");
    return e.innerText;
  }
  htmlEntities(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  sizeUnit(l) {
    let s = 'KB MB GB TB'.split(' '), j;
    for(let i = 3; i >= 0; --i) {
      if(l >= (j = (1024 ** (i + 1))))
	return (new Intl.NumberFormat(this.lng, {maximumFractionDigits: 2}).format(l / j)) + ' ' + s[i];
    }
    return l + ' bytes';
  }
  text(c) {
    if(this.main.langs)
      return this?.main?.texts[this.lng][c];
  }
  idle(s) {
    let e;
    if(this.main.data?.loader && (e = this.e(this.main.data.loader)))
      e.style.visibility = (s) ? '' : 'hidden';
  }
  shake(n) {
    const o = this.e(n);
    o.addEventListener('animationend', () => o.classList.toggle('shake'));
    o.classList.toggle('shake');
  }
  windowShow(t, o) {
    this.wins.push(new this.win(this, t, o));
  }
  windowHide() {
    const id = this.wins.length - 1;
    if(id >= 0)
      this.wins[id].hide();
  }
  windowDel(f, t) {
    this.windowShow(`${(t) ? t + '<br>' : ''}<b>${this.text('deleteAsk') ?? '&#10060; Delete?'}</b>`, {okAction: f, cancelAction: 0})
  }
  win = class {
    constructor(p, t, o) {
      this.p = p;
      this.id = p.wins.length;
      this.t = t;
      this.o = o = o || {};
      o.cancelAction = (o.cancelAction === 0) ? () => {} : o.cancelAction
      this.tok = (o.okAction || o.okText !== undefined) ? ((o.okText) ? o.okText : (p.text('ok') ?? 'Ok')) : '';
      this.tcancel = (o.cancelAction || o.input !== undefined) ? ((o.cancelText) ? o.cancelText : (p.text('cancel') ?? 'Cancel')) : '';
      this.input = o.input;
      this.winCSSbg = o.winCSSbg || p.main.data?.winCSSbg;
      this.winCSSfg = o.winCSSfg || p.main.data?.winCSSfg;
      this.ekeydown = this.keydown.bind(this);
      this.show();
    }
    button(b) {
      return '<input id="JPWB_' + b + this.id + '" type="button" value="' + this[`t${b}`] + '" style="width: 100px; margin: 0 4px" class="button">';
    }
    ok() {
      this.o.okAction?.((this.input === undefined) ? undefined : this.p.e(`JPWI_${this.id}`).value);
      !this.o?.noHide && this.hide();
    }
    cancel() {
      this.o.cancelAction?.();
      !this.o?.noHide && this.hide();
    }
    show() {
      let s='<div id="JPWD_' + this.id + '" style="z-index: ' + (30 + this.id) + '; display: flex; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 0' +
		((this.o.winCSSbg) ? `" class="${this.o.winCSSbg}` : '; background: rgba(255,255,255,0.83); backdrop-filter: blur(2px); transition: .5s ease') + '">' +
	'<div id="JPWC_' + this.id + '" style="position: relative' +
		((this.o.winCSSfg) ? `" class="${this.o.winCSSfg}` : '; margin: auto; padding: 8px; text-align: center; border-radius: 6px; color: #333; background: #FFF; box-shadow: 1px 1px 10px #444; transform: scale(1.4); transition: .3s ease') + '">' +
	'<div style="text-align: right' + ((this.o.winCSSfg) ? '' : '; color: #333') + '"><span id="JPWX_' + this.id + '" style="cursor: pointer; font-size: 12px">&#9587;</span></div><div style="padding: 10px 4px' + ((this.o.winCSSfg) ? '' : '; color: #333; line-height: 1.7em') + '">' +
	this.t + ((this.input === undefined) ? '' : `<br><br><input id="JPWI_${this.id}" type="text" value="${this.input}" autocomplete="off" style="width: 90%" class="txt">`) +
	'</div>' + ((this.tok || this.tcancel) ? '<br>' : '') + ((this.tok) ? this.button('ok') : '') + ((this.tcancel) ? this.button('cancel') : '') + '</div></div>';

      document.body.insertAdjacentHTML('afterbegin', s);
      this.p.e('JPWD_' + this.id).addEventListener('click', this.close.bind(this));
      this.p.e('JPWX_' + this.id).addEventListener('click', this.hide.bind(this));
      (this.tok) && this.p.e('JPWB_ok' + this.id).addEventListener('click', this.ok.bind(this));
      (this.tcancel) && this.p.e('JPWB_cancel' + this.id).addEventListener('click', this.cancel.bind(this));
      window.addEventListener('keydown', this.ekeydown);
      setTimeout(() => {this.p.e('JPWD_' + this.id).style.opacity = 1; this.p.e('JPWC_' + this.id).style.transform = 'scale(1)'}, 100);
      this.o.showAction?.();
    }
    keydown() {
      let i = event.target, k = event.which;
      if(i.type && i.type === 'text')
	return true;

      if(k !== 13 && k !== 27 && k !== 32)
	return true;

      if(this.id === this.p.wins.length - 1) (k === 27 && this.tcancel) ? this.cancel() : this.ok();
      this.p.stopp();

      return false;
    }
    close() {
      if(event.target.id === 'JPWD_' + this.id)
	this.hide();
    }
    hide() {
      this.o.closeAction?.();
      this.p.e('JPWD_' + this.id).style.opacity = 0;
      this.p.e('JPWC_' + this.id).style.transform = 'scale(0.8)';
      setTimeout(() => {if(this.p.wins[this.id]) this.destroy()}, 500);
    }
    destroy() {
      window.removeEventListener('keydown', this.ekeydown);
      this.p.e('JPWD_' + this.id).remove();
      this.p.wins.pop();
    }
  }
  toastShow(t, o) {
    this.toasts.push(new this.toast(this, t, o));
  }
  toastHide() {
    const n = this.toasts.length - 1;
    if(n >= 0)
      this.toasts[this.toasts[n].id].hide();
  }
  toast = class {
    constructor(p, t, o) {
      this.p = p;
      this.id = p.genId();
      this.t = t;
      this.o = o = o || {};
      this.bgc = o.toastBG || '0,0,0';
      this.pos = o.toastPos || p.main.data?.toastPos || 'top';
      this.py = o.toastPY || p.main.data?.toastPY || '50px';
      this.time = o.toastTime || p.main.data?.toastTime || 5000;
      this.toastCSS = o.toastCSS || p.main.data?.toastCSS;
      this.tmr = 0;
      this.show();
    }
    idx() {
      return this.p.toasts.findIndex(t => t.id === this.id);
    }
    show() {
      let s='<div id="JPT_' + this.id + '" role="alert" aria-live="polite" style="z-index: ' + (50 + this.id) + '; position: fixed; ' + ((this.pos === 'bottom') ? 'bottom' : 'top') + ': -40px; opacity: 0' +
		((this.o.toastCSS) ? `" class="${this.o.toastCSS}` : '; width: 80%; left: 10%; right: 10%; padding: 7px 9px 20px; text-align: center; border-radius: 6px; box-shadow: 1px 1px 10px #CCC; color: #FFF; background: rgba(' + this.bgc +  ',0.83); backdrop-filter: blur(2px); transition: .3s ease') + '">' +
	'<span id="JPTX_' + this.id + '" style="cursor: pointer; display: block; text-align: right; font-size: 12px">' +
        '<div id="JPTP_' + this.id + '" style="width: 20px" class="ib vt">&nbsp;</div> &nbsp; &#9587;</span>' + this.t + '</div>';

      document.body.insertAdjacentHTML('afterbegin', s);
      this.p.e('JPTX_' + this.id).addEventListener('click', this.hide.bind(this));
      setTimeout(() => {this.p.e('JPT_' + this.id).style.opacity = 1; this.p.e('JPT_' + this.id).style[(this.pos === 'bottom') ? 'bottom' : 'top'] = (parseInt(this.py, 10) + ((this.p.toasts.length - 1) * (this.p.e('JPT_' + this.id).clientHeight + 4))) + 'px'}, 100);
      if(this.time) {
	if(document.hidden) {
	  this.ehtmr = this.htmr.bind(this);
	  document.addEventListener('visibilitychange', this.ehtmr);
	} else
	  this.htmr(-1);
      }
    }
    htmr(t) {
      if(!document.hidden) {
	if(this.p.e('JPTP_' + this.id)) this.p.e('JPTP_' + this.id).innerHTML = '<svg style="width: 18px" viewBox="0 0 120 120"><circle cx="60" cy="60" r="25" transform="rotate(-90 60 60)" style="stroke: #555; stroke-width: 50; fill: none" /><circle cx="60" cy="60" r="25" transform="rotate(-90 60 60)" pointer-events="all" style="stroke: var(--jcbtheme); stroke-width: 50; fill: none; stroke-dasharray: 219; stroke-dashoffset: 219; animation: toast-circle ' + (this.time + 1000) + 'ms linear 1 forwards" /></svg>';
	this.tmr = setTimeout(() => this.hide(), this.time + ((t === -1) ? 0 : 1000));
      }
    }
    hide() {
      clearTimeout(this.tmr);
      if(this.ehtmr)
	document.addEventListener('visibilitychange', this.ehtmr);

      if(this.p.e('JPT_' + this.id)) {
	this.p.e('JPT_' + this.id).style[(this.pos === 'bottom') ? 'bottom' : 'top'] = '-40px';
	this.p.e('JPT_' + this.id).style.opacity = 0;
      }
      setTimeout(() => {if(this.idx() !== -1) this.destroy()}, 500);
    }
    destroy() {
      this.p.e('JPT_' + this.id).remove();
      this.p.toasts.splice(this.idx(), 1);
    }
  }
  sendReqIni(url, method, data, pget = {}) {
    let u = new URL(url, window.location), d = (data && data instanceof FormData), o = {method: method ?? 'GET', headers: (d) ? {} : {'Content-Type': 'application/json'}};
    if(this.main.data?._token)
      o.headers['x-access-token'] = this.main.data._token;
    if(this.main.data?._auth)
      o.headers['authorization'] = this.main.data._auth;
    if(/^POST|PUT|PATCH$/i.test(method))
      o.body = (d) ? data : JSON.stringify(data);
    if(pget) {
      for(const k in pget)
	u.searchParams.append(k, pget[k]);
    }
    this.idle(true);
    this.stopp();
    return {url: u, options: o};
  }
  sendReqEnd(r) {
    if(this.main.data?.auth) {
      let t = r.headers.get('x-access-token');
      if(t)
	this.main.data._token = t;
      t = r.headers.get('authorization');
      if(t)
	this.main.data._auth = t;
    }
    this.idle(false);
    let hs = {};
    for(let h of r.headers.entries())
      hs[h[0]] = h[1];
    return hs;
  }
  async sendRequest(url, method, data, pget = {}) {
    const u = this.sendReqIni(url, method, data, pget);
    try {
      const r = await fetch(u.url, u.options), h = this.sendReqEnd(r), j = await r.json();
      return {ok: r.ok, status: r.status, headers: h, response: j};
    } catch(e) {
      this.idle(false);
      return {ok: false, error: e, status: 404};
    }
  }
  fdata(id, c = true) {
    if(c && !this.e(id).reportValidity())
      return false;
    let e = this.e(id).elements, f = new FormData();
    for(let i of e) {
      if(i.name === '' || i.disabled || ((i.type === 'checkbox' || i.type === 'radio') && !i.checked))
	continue;

      let v = ((i.type === 'checkbox' || i.type === 'radio') && i.value === '') ? 1 : i.value;
      if(i.type === 'file') {
	if(i.dataset.jpauUpload === 'small') {
	  for(let j = 0; j < i.files.length; ++j) {
	    if(i._files && i._files[j]) {
	      f.append(`${i.name}_WIDTH[${j}]`, i._files[j]._RW);
	      f.append(`${i.name}_HEIGHT[${j}]`, i._files[j]._RH);
	      f.append(`${i.name}[]`, i._files[j]);
	    } else
	      f.append(`${i.name}[]`, i.files[j]);
	  }
	}
      } else
	f.append(i.name, v);
    }
    return f;
  }
  async captcha(f, u) {
    const k = await this.sendRequest(u);
    f.append('captcha', k.response.k);
    return f;
  }
  uplChunk(f, n, u, b, id, p, ps, r, x) {
    let fd = new FormData();
    fd.append(`${n}_ID`, id);
    fd.append(`${n}_RND`, r);
    fd.append(`${n}_NAME`, f.name);
    fd.append(`${n}_TYPE`, f.type);
    fd.append(`${n}_SIZE`, f.size);
    f._RW && fd.append(`${n}_WIDTH`, f._RW);
    f._RH && fd.append(`${n}_HEIGHT`, f._RH);
    fd.append(`${n}_PATH`, f.webkitRelativePath);
    fd.append(`${n}_PART`, p);
    fd.append(`${n}_PARTS`, ps);
    fd.append(n, f.slice(p * b, (p + 1) * b));
    x.open('PUT', u, true);
    if(this.main.data?._token)
      x.setRequestHeader['x-access-token'] = this.main.data._token;
    if(this.main.data?._auth)
      x.setRequestHeader['authorization'] = this.main.data._auth;
    x.send(fd);
  }
  uplLarge(f, n, u, id, c, d, o) {
    let b = 1024 * 1024 * 2, p = 0, ps = Math.ceil(f.size / b), r = this.genId(), x = new XMLHttpRequest();
    x.upload.addEventListener('progress', e => this.uplInf(c, (p * b) + e.loaded, f.size, d));
    x.addEventListener('loadend', e => {
      this.uplInf(c, (p + 1) * b, f.size, d);
      if(p < ps && x) {
	++p;
	this.uplChunk(f, n, u, b, id, p, ps, r, x);
	this.files[`${id}_${r}_${n}`].upload = Math.min(p * b, f.size);
	if(this.funcs.onUploading)
	  this.funcs.onUploading.bind(this)(f, n, id, p, ps);
      } else {
	delete this.files[`${id}_${r}_${n}`];
	this.uplCnt(c, false, x, !x);
	if(o)
	  o.value = '';
	if(this.funcs.onUploadEnd)
	  this.funcs.onUploadEnd.bind(this)(n);
      }
      this.files.total = {size: 0, upload: 0};
      for(let i in this.files) {
	if(i !== 'total') {
	  this.files.total.size+= this.files[i].size;
	  this.files.total.upload+= this.files[i].upload;
	}
      }
      this.files.total.percent = ~~((this.files.total.upload * 100) / this.files.total.size);
      this.idle(false);
    });

    x.addEventListener('error', e => this.uplCnt(c, false, false, true));
    x.addEventListener('abort', e => this.uplCnt(c, false, false, true));
    if(c)
      this.e(c).querySelectorAll('[data-jpau-element="abort"]').forEach(e => e.addEventListener('click', () => {x.abort(); x = null}));
    this.idle(true);

    this.files[`${id}_${r}_${n}`] = {name: f.name, size: f.size, upload: 0};
    this.uplChunk(f, n, u, b, id, p, ps, r, x);
  }
  uplBlob(d) {
    d = d.split(',');
    let str, arr = [], m = d[0].split(':')[1].split(';')[0];
    str = (d[0].indexOf('base64') >= 0) ? atob(d[1]) : unescape(d[1]);
    for(let i = 0; i < str.length; ++i)
      arr.push(str.charCodeAt(i));
    return new Blob([new Uint8Array(arr)], {type: m});
  }
  uplFile(e) {
    let i = (e.type === 'change') ? e.target : this.e(e.target.dataset.jpauUploadTarget), fs = (e.type === 'drop') ? e.dataTransfer.files : ((e.type === 'paste') ? e.clipboardData.files : i.files);
    let s = (i.dataset.jpauUpload === 'small'), p = (i.dataset.jpauPreview) ? this.e(i.dataset.jpauPreview) : 0, t = (p && p.dataset.jpauTemplate) ? this.e(p.dataset.jpauTemplate) : 0;
    this.stopp();
    if(e.type === 'drop')
      e.target.style.backgroundColor = '';

    if(this.funcs.onUpload && !this.funcs.onUpload.bind(this)(e))
      return;

    if(s && p)
      p.innerHTML = '';

    let n = (p) ? p.childElementCount : 0, a = i.accept.split(',');
    for(let ix = 0; ix < fs.length; ++ix) {
      let f = fs[ix], ac = false;
      if(a && a[0]) {
	for(l of a) {
	  l = l.trim();
	  if(l.startsWith('.') && l !== `.${f.name.toLowerCase().split('.').pop()}`) ac = true;
	  if(l.includes('/') && f.type.match(l.replace('*', '.+'))) ac = true;
	}
	if(!ac)
	  continue;
      }

      let z = i.dataset.jpauResize;
      if(/^image\//.test(f.type) && (t || z)) {
	let r = new FileReader();
	r.addEventListener('load', () => this.uplImg(i, f, ix, s, n, p, t, r.result, z));
	r.readAsDataURL(f);
      } else
	n = this.uplNew(i, f, ix, s, n, p, t, 0);
    }
  }
  uplImg(i, f, ix, s, n, p, t, r, z) {
    let m = new Image();
    m.src = r;
    m.onload = () => {
      let mw = m.width, mh = m.height;
      if(z) {
	z = z.split('x');
	if(mw > mh) {
	  if(mw > z[0]) {
	    mh = ~~(mh * (z[0] / mw));
	    mw = z[0];
	  }
	} else {
	  if(mh > z[1]) {
	    mw = ~~(mw * (z[1] / mh));
	    mh = z[1];
	  }
	}
	createImageBitmap(m, {resizeWidth: mw, resizeHeight: mh, resizeQuality: 'high'}).then(b => {
	  let c = document.createElement('canvas'), nm = f.name, rp = f.webkitRelativePath;
	  c.width = mw;
	  c.height = mh;
	  c.getContext('2d').drawImage(b, 0, 0);
	  c = c.toDataURL(f.type);
	  f = this.uplBlob(c);
	  f.name = nm;
	  f.webkitRelativePath = rp;
	  f._RW = mw;
	  f._RH = mh;
	  this.uplNew(i, f, ix, s, n, p, t, c);
	});
      } else {
	f._RW = mw;
	f._RH = mh;
	this.uplNew(i, f, ix, s, n, p, t, r);
      }
    }
  }
  uplNew(i, f, ix, s, n, p, t, r) {
    if(s && this.main.data?.uploadSmallMax && f.size > this.main.data.uploadSmallMax * 1024) {
      this.windowShow(`<b>${this.htmlEntities(f.name)}</b>: ${this.text('uploadSmallMsg') ?? 'Maximum file size'}`);
      return n;
    }
    if(!s && this.main.data?.uploadLargeMax && f.size > this.main.data.uploadLargeMax * 1024) {
      this.windowShow(`<b>${this.htmlEntities(f.name)}</b>: ${this.text('uploadLargeMsg') ?? 'Maximum file size'}`);
      return n;
    }

    let nm = i.name + ((n) ? `_${n}` : ''), c;
    if(t) {
      c = `${p.id}_${n + ix}`;
      p.insertAdjacentHTML('beforeend', `<span id="${c}">${t.innerHTML}</span>`);
      this.e(c).querySelectorAll('[data-jpau-element]').forEach(i => {
	let e = i.dataset.jpauElement;
	if(e === 'name') i.innerHTML = f.name;
	if(e === 'size') i.innerHTML = this.sizeUnit(f.size);
	if(e === 'icon') i.className+= this.fileIcon(f.name);
      });

      if(r)
	this.e(c).querySelectorAll('[data-jpau-element="img"]').forEach(i => i.src = r);

      this.uplInf(c, 0, f.size, new Date());
      this.uplCnt(c, true, false, false);
      this.prepHTML(this.e(c));
      if(this.funcs.onPreview)
	this.funcs.onPreview.bind(this)(c, nm);
    }

    if(s) {
      if(!i._files)
	i._files = {};
      if(f._RW)
	i._files[ix] = f;
      else if(i._files[ix])
	delete i._files[ix];
    }

    if(!s)
      this.uplLarge(f, nm, i.dataset.jpauAction ?? i.form.action, i.dataset.jpauUploadId ?? this.genId(), (t) ? c : 0, new Date(), i);

    return n + 1;
  }
  uplInf(c, l, t, d) {
    if(!c || !this.e(c))
      return;

    l = Math.min(l, t);
    let v = ~~((l * 100) / ((t) ? t : 1)), m = ~~(((new Date()) - d) / 1000), e = ~~((t * m) / ((l) ? l : 1));
    this.e(c).querySelectorAll('[data-jpau-element]').forEach(i => {
      let n = i.dataset.jpauElement;
      if(n === 'progress') i.value = v;
      if(n === 'progressWidth') i.style.width = v;
      if(n === 'progressStr') i.innerText = `${v}%`;
      if(n === 'timeElapsed') i.innerText = this.secFmt(m);
      if(n === 'timeEstimated') i.innerText = this.secFmt(e);
    });
  }
  uplCnt(c, l, f, e) {
    if(!c || !this.e(c))
      return;

    this.e(c).querySelectorAll('[data-jpau-element-show]').forEach(i => {
      let s = i.dataset.jpauElementShow;
      if(s === 'loading') i.style.display = (l) ? '' : 'none';
      if(s === 'finish') i.style.display = (f) ? '' : 'none';
      if(s === 'error') i.style.display = (e) ? '' : 'none';
    });
  }
  secFmt(s) {
    let d = new Date(0);
    d.setSeconds(s);
    return d.toISOString().substring(11, 19);
  }
  fileIcon(n) {
    let e = (n || '').toLowerCase().split('.').pop(), i, t='jpg image jpe image jpeg image png image webp image avif image gif image wav audio mp3 audio wma audio avi video mp4 video mov video mpg video webv video wmv video zip zipper rar zipper 7z zipper txt lines html lines doc word docx word xls excel xlsx excel pdf pdf'.split(' ');
    if(e) {
      for(let j = 0; j < t.length && !i; j+= 2) {
	if(e == t[j])
	  i = t[j + 1];
      }
    }
    return 'fa-solid fa-file' + ((i) ? '-' + i : '');
  }
  socialShare(t, u) {
    let n = encodeURIComponent(t ?? document.title), a = encodeURIComponent(u ?? window.location), i = document.querySelector('meta[property="og:image"]')?.content;
    return {
      'facebook': {icon: 'fa-brands fa-facebook', link: `https://www.facebook.com/sharer.php?u=${a}&t=${n}`},
      'whatsapp': {icon: 'fa-brands fa-whatsapp', link: `whatsapp://send?text=${a}%0A%0A${n}`},
      'twitter': {icon: 'fa-brands fa-x-twitter', link: `https://twitter.com/home?status=${n}: ${a}`},
      'telegram': {icon: 'fa-brands fa-telegram', link: `https://telegram.me/share/url?url=${a}&text=${n}`},
      'linkedin': {icon: 'fa-brands fa-linkedin', link: `https://www.linkedin.com/shareArticle?mini=true&source=LinkedIn&url=${a}&summary=${n}`},
      'pinterest': {icon: 'fa-brands fa-pinterest', link: `https://www.pinterest.com/pin/create/button/?url=${a}&media=${i ?? ''}&description=${n}`}
    };
  }
  voiceLang(l, v) {
    this._slang = (l) ? l : this.lng;
    if(v)
      this._voice = v;
    else
      this.voiceOpts().voices.forEach(e => {if(e.lang === this._slang && !this._voice) this._voice = e});
  }
  voiceOpts() {
    return {speech: ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window), voices: window.speechSynthesis.getVoices()};
  }
  speech(c, f, p) {
    const sr = ('SpeechRecognition' in window) ? SpeechRecognition : webkitSpeechRecognition, r = new sr();
    r.continuous = false;
    r.lang = this._slang || this.lng;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = function(e) {
      let v = e.results[0][0].transcript.toLowerCase(), i = false;
      if(!p)
	document.querySelectorAll('[data-jpau-speech]').forEach(e => {if(e.dataset.jpauSpeech.toLowerCase() === v) {i = e; e.click()}});
      if(f && (c || (!c && !i))) f.bind(this)(v);
    }.bind(this);
    r.start();
  }
  speak(o, t, p, l, a) {
    let s = window.speechSynthesis;
    if(s.speaking && this._voc !== o) {

      s.cancel();
      this._voc.innerHTML = p;
    }
    if(o && this._voice) {

      if(s.speaking && this._voc === o) {
	if(s.paused) {s.resume(); this._voc.innerHTML = l}
	else {s.pause(); this._voc.innerHTML = a}
      } else {
	let u = new SpeechSynthesisUtterance(t);
	u.onend = u.onerror = () => o.innerHTML = p;
	u.voice = this._voice;
	o.innerHTML = l;
	this._voc = o;
	s.speak(u);
      }
    }
  }
};

class JPauContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = '<slot></slot>';
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', e => {
      e.target.assignedElements().forEach(c => {
	if(c.tagName === 'JPAU-ROUTE')
	  june_pau.routes.push({r: c.getAttribute('path'), m: c.getAttribute('module'), bg: c.getAttribute('background')});
      });
    });
  }
  connectedCallback() {
    june_pau.outlet = document.createElement('div');
    this.appendChild(june_pau.outlet);
  }
}
class JPauLink extends HTMLAnchorElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.addEventListener('click', e => {if(!e.shiftKey && !e.ctrlKey) {e.preventDefault(); june_pau.link(this.getAttribute('href'))}});
  }
}

const june_pau = new JuNePAU();
window.customElements.define('jpau-content', JPauContent);
window.customElements.define('jpau-link', JPauLink, {extends: 'a'});
window.addEventListener('load', () => june_pau.load());
window.addEventListener('popstate', () => june_pau.link(document.location.href));
window.addEventListener('beforeunload', e => {if(june_pau.main.data?.beforeunload || Object.keys(june_pau.files).length > 1) e.returnValue = true});
