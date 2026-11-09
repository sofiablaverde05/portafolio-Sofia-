/* =====================================================
   Portafolio · Sofia — interacciones (multipágina)
   Sin librerías. Un solo bucle rAF para cursor + parallax.
   ===================================================== */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- siempre abrir cada página desde arriba ---------- */
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  const toTop = () => { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
  toTop();
  addEventListener('pageshow', toTop);
  addEventListener('load', toTop);

  /* ---------- estado del puntero ---------- */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
  addEventListener('pointermove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = (e.clientX / innerWidth - .5) * 2;
    mouse.ny = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });

  /* ---------- cortina de transición entre páginas ---------- */
  const curtainOut = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('curtain-in')));
  if (document.readyState === 'complete') curtainOut(); else addEventListener('load', curtainOut);
  addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('curtain-in'); closeMenu(); } });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    // solo ancla en la misma página: dejar que el navegador haga scroll
    if (url.pathname === location.pathname && url.hash) return;
    if (url.pathname === location.pathname && !url.hash && url.search === location.search) return;
    if (reduce) return;
    e.preventDefault();
    root.classList.add('curtain-in');
    store.set('curtain', '1');
    setTimeout(() => { location.href = a.href; }, 780);
  });

  /* ---------- pantalla de carga (solo inicio, primera visita) ---------- */
  const loader = $('#loader');
  function ready() { body.classList.remove('is-loading'); body.classList.add('is-ready'); }
  if (loader) {
    const fill = $('.loader__fill', loader);
    const count = $('.loader__count b', loader);
    const imgs = $$('img').filter(i => !i.closest('.loader') && i.loading !== 'lazy');
    let total = imgs.length + 2, done = 0, shown = 0, target = 0;
    const tick = () => { done++; target = done / total * 100; };
    imgs.forEach(i => (i.complete ? tick() : (i.addEventListener('load', tick, { once: true }), i.addEventListener('error', tick, { once: true }))));
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
    const winLoad = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    winLoad.then(tick);
    const started = performance.now();
    const minTime = reduce ? 0 : 1700;
    const step = () => {
      const elapsed = performance.now() - started;
      const timeCap = clamp(elapsed / minTime * 100, 0, 100);
      const goal = Math.min(target, timeCap);
      shown += (goal - shown) * .09;
      if (goal - shown < .15) shown = goal;
      loader.style.setProperty('--p', shown.toFixed(2));
      if (count) count.textContent = Math.round(shown);
      if (shown >= 99.9 && target >= 99.9) {
        loader.classList.add('is-done');
        setTimeout(ready, 450);
        setTimeout(() => loader.remove(), 1400);
        return;
      }
      requestAnimationFrame(step);
    };
    // la pantalla de carga completa solo en la primera visita de la sesión
    requestAnimationFrame(step);
    setTimeout(() => { target = 100; }, 6000); // red de seguridad
  } else {
    ready();
  }

  /* ---------- hero: letras ---------- */
  const letters = $$('.ch__i');
  /* ---------- cursor personalizado ---------- */
  const cursor = $('.cursor');
  let cx = mouse.x, cy = mouse.y, rx = cx, ry = cy;
  if (finePointer && cursor && !reduce) {
    root.classList.add('has-cursor');
    const dot = $('.cursor__dot', cursor), ring = $('.cursor__ring', cursor), label = $('.cursor__label', cursor);
    cursor.classList.add('is-hidden');
    addEventListener('pointermove', () => cursor.classList.remove('is-hidden'), { once: true });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor],a,button,summary,[role=tab]');
      cursor.classList.toggle('is-link', !!t);
      const txt = t && t.dataset.cursor;
      cursor.classList.toggle('is-label', !!txt);
      if (txt) label.textContent = txt;
    });
    document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
    cursor._move = () => {
      cx += (mouse.x - cx) * .5; cy += (mouse.y - cy) * .5;
      rx += (mouse.x - rx) * .16; ry += (mouse.y - ry) * .16;
      dot.style.transform = `translate(${cx}px,${cy}px)`;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
    };
  }

  /* ---------- parallax por puntero y scroll ---------- */
  const groups = $$('[data-parallax]').map(g => ({
    el: g,
    items: $$('[data-depth]', g).map(el => ({ el, d: parseFloat(el.dataset.depth) || 0, x: 0, y: 0 }))
  }));
  const speeders = $$('[data-scroll-speed]').map(el => ({ el, s: parseFloat(el.dataset.scrollSpeed) || 0 }));
  const lerpMouse = { x: 0, y: 0 };
  const loopFns = [];

  /* ---------- marquee ---------- */
  const marquees = $$('[data-marquee]').map(m => {
    const track = $('.marquee__track', m);
    const g = $('.marquee__group', m);
    for (let i = 0; i < 3; i++) { const c = g.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); }
    return { m, track, dir: parseFloat(m.dataset.dir) || -1, pos: 0, w: 0, boost: 0 };
  });
  const measure = () => marquees.forEach(o => { o.w = $('.marquee__group', o.track).offsetWidth; });
  measure(); addEventListener('resize', measure);
  document.fonts && document.fonts.ready.then(measure);
  let lastY = scrollY, vel = 0;

  /* ---------- previsualización en listas ---------- */
  const prev = $('.list-preview');
  let px = 0, py = 0;
  if (prev) {
    $$('.row[data-preview]').forEach(r => {
      r.addEventListener('pointerenter', () => { prev.src = r.dataset.preview; prev.classList.add('is-on'); });
      r.addEventListener('pointerleave', () => prev.classList.remove('is-on'));
    });
  }


  /* ---------- personaje que trae las secciones con una cuerda ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const tows = reduce ? [] : $$('[data-tow]').map(row => {
    const strip = $('.tow', row), walker = $('.tow__walker', row), svg = $('.tow__rope', row);
    const path = $('path', svg), knot = $('circle', svg);
    return { row, strip, walker, path, knot, cards: $$('.card', row) };
  });
  function towFrame(vh, vw) {
    tows.forEach(t => {
      const rr = t.row.getBoundingClientRect();
      if (rr.bottom < -300 || rr.top > vh + 300) return;
      const sr = t.strip.getBoundingClientRect();
      const W = t.walker.offsetWidth, H = W * 438 / 270, sh = t.strip.offsetHeight;
      const c = t.cards[0], fromLeft = t.row.dataset.tow === 'l';
      const ropeL = vw < 700 ? 90 : 140;
      const p = clamp((vh * .94 - sr.top) / (vh * .5), 0, 1), e = easeOut(p);
      const m = clamp(Math.sin(Math.PI * p) * 1.6, 0, 1), ph = scrollY * .07;
      const bob = -Math.abs(Math.sin(ph)) * 9 * m, rot = Math.sin(ph) * 3 * m;
      const sag = lerp(6, 26, e);
      let wx, tx, hx, ex, flip;
      if (!fromLeft) {
        // entra por la derecha, camina hacia la izquierda y arrastra la tarjeta
        const hand = W * .22, base = c.offsetLeft, rest = base + 10;
        wx = lerp(vw - rr.left + 20, rest, e);
        const L = lerp(ropeL, -(10 + hand), e), left = wx + hand + L;
        tx = left - base; hx = wx + hand; ex = left + 26; flip = '';
      } else {
        // entra por la izquierda, camina hacia la derecha
        const hand = W * .78, right = c.offsetLeft + c.offsetWidth, rest = right - W - 10;
        wx = lerp(-rr.left - W - 20, rest, e);
        const L = lerp(ropeL, hand - W - 10, e), edge = wx + hand - L;
        tx = edge - right; hx = wx + hand; ex = edge - 26; flip = ' scaleX(-1)';
      }
      c.style.translate = `${tx.toFixed(1)}px 0`;
      t.walker.style.opacity = 1;
      t.walker.style.transform = `translate(${wx.toFixed(1)}px,${bob.toFixed(1)}px)${flip} rotate(${rot.toFixed(2)}deg)`;
      const hy = sh - H * .47 + bob, ey = sh;
      t.path.setAttribute('d', `M${hx.toFixed(1)} ${hy.toFixed(1)} Q${((hx + ex) / 2).toFixed(1)} ${(Math.max(hy, ey) + sag).toFixed(1)} ${ex.toFixed(1)} ${ey}`);
      t.knot.setAttribute('cx', ex.toFixed(1)); t.knot.setAttribute('cy', ey); t.knot.setAttribute('r', 5);
    });
  }

  /* ---------- motion de cabecera de sección ---------- */
  $$('.shero video').forEach(v => {
    v.muted = true; v.loop = true; v.playsInline = true;
    v.addEventListener('loadeddata', () => {
      v.closest('.shero').classList.add('is-on');
      if (!reduce) v.play().catch(() => {});
    });
  });

  /* ---------- bucle principal ---------- */
  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) requestAnimationFrame(frame); });
  function frame() {
    if (!visible) return;
    if (cursor && cursor._move) cursor._move();
    const y = scrollY;
    vel += ((y - lastY) - vel) * .12; lastY = y;
    lerpMouse.x += (mouse.nx - lerpMouse.x) * .06;
    lerpMouse.y += (mouse.ny - lerpMouse.y) * .06;
    const vh = innerHeight;
    towFrame(vh, innerWidth);

    if (!reduce) {
      groups.forEach(g => {
        const r = g.el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        g.items.forEach(it => {
          it.el.style.transform = `translate3d(${(-lerpMouse.x * it.d * 26).toFixed(2)}px,${(-lerpMouse.y * it.d * 20).toFixed(2)}px,0)`;
        });
      });
      speeders.forEach(s => {
        const r = s.el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = clamp((r.top + r.height / 2 - vh / 2) * s.s, -vh * .14, vh * .14);
        s.el.style.translate = `0 ${off.toFixed(1)}px`;
      });
      letters.forEach(el => {
        const r = el.getBoundingClientRect();
        const dx = mouse.x - (r.left + r.width / 2), dy = mouse.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy), k = clamp(1 - d / 260, 0, 1) ** 2;
        el.style.transform = k > .001 ? `translate(${(-dx * k * .12).toFixed(1)}px,${(-dy * k * .18 - k * 14).toFixed(1)}px) rotate(${(dx * k * .02).toFixed(1)}deg) scale(${(1 + k * .06).toFixed(3)})` : '';
      });
      marquees.forEach(o => {
        if (!o.w) return;
        o.pos += o.dir * (.7 + Math.min(Math.abs(vel) * .18, 9));
        if (o.pos <= -o.w) o.pos += o.w;
        if (o.pos > 0) o.pos -= o.w;
        o.track.style.transform = `translate3d(${o.pos.toFixed(1)}px,0,0)`;
      });
    }
    if (prev && prev.classList.contains('is-on')) {
      px += (mouse.x - px) * .14; py += (mouse.y - py) * .14;
      prev.style.transform = `translate(${px + 28}px,${py - 120}px) rotate(${(mouse.x - px) * .03}deg)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- aparición al hacer scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; io.observe(el); });

  /* ---------- inclinación 3D y botones magnéticos ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${(x * 9).toFixed(2)}deg) rotateX(${(-y * 9).toFixed(2)}deg) translateZ(0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- menú de pantalla completa ---------- */
  const menu = $('#menu'), menuBtn = $('.top__menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open'); body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelector('span').textContent = 'Menú';
    menu.inert = true;
  }
  function openMenu() {
    menu.inert = false;
    menu.classList.add('is-open'); body.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.querySelector('span').textContent = 'Cerrar';
  }
  if (menu && menuBtn) {
    menu.inert = true;
    menuBtn.addEventListener('click', () => (menu.classList.contains('is-open') ? closeMenu() : openMenu()));
    menu.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeMenu(); });
  }

  /* ---------- pestañas ---------- */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role=tab]', box), panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const list = $('.tabs__list', box);
    const cover = document.createElement('div'); cover.className = 'tabs__cover'; box.appendChild(cover);
    const stuck = () => cover.classList.toggle('is-on', innerWidth <= 900 && list.getBoundingClientRect().top <= 66 && list.getBoundingClientRect().top >= 60);
    addEventListener('scroll', stuck, { passive: true }); addEventListener('resize', stuck);
    const select = (i, focus, hash = true, user = false) => {
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1;
        panels[k].hidden = k !== i;
      });
      if (focus) tabs[i].focus();
      tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      if (hash && tabs[i].dataset.hash) history.replaceState(null, '', '#' + tabs[i].dataset.hash);
      if (user) {
        const off = (innerWidth <= 900 ? 64 : 0) + (list ? list.offsetHeight : 0) + 8;
        const top = panels[i].getBoundingClientRect().top + scrollY - off;
        if (scrollY > top) scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      }
      panels[i].dispatchEvent(new CustomEvent('tabshow', { bubbles: true }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, false, true, true));
      t.addEventListener('keydown', e => {
        const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault(); select((k + tabs.length) % tabs.length, true);
      });
    });
    const fromHash = tabs.findIndex(t => t.dataset.hash && '#' + t.dataset.hash === location.hash);
    const def = tabs.findIndex(t => t.hasAttribute('data-default'));
    select(fromHash >= 0 ? fromHash : Math.max(def, 0), false, fromHash >= 0);
    addEventListener('hashchange', () => {
      const j = tabs.findIndex(t => t.dataset.hash && '#' + t.dataset.hash === location.hash);
      if (j >= 0) select(j, false, false);
    });
  });

  /* ---------- prototipos incrustados ---------- */
  const coarse = matchMedia('(hover:none),(pointer:coarse)').matches;
  function loadEmbed(b) {
    const box = b.closest('.embed, .ar__frame');
    if (!box || box.querySelector('iframe')) return;
    const isEmbed = box.classList.contains('embed');
    let ld = null;
    if (isEmbed) {
      ld = document.createElement('div'); ld.className = 'embed__loading';
      ld.innerHTML = '<div class="embed__spin" aria-hidden="true"></div><b>' + (b.dataset.title || 'Prototipo') + '</b><p>Preparando el prototipo… puede tardar unos segundos.</p>';
      ld.setAttribute('role', 'status'); box.appendChild(ld);
    }
    const f = document.createElement('iframe');
    f.src = b.dataset.embed;
    f.title = b.dataset.title || 'Contenido interactivo';
    f.allow = b.dataset.allow || 'fullscreen; clipboard-write';
    f.setAttribute('allowfullscreen', '');
    f.addEventListener('load', () => {
      box.classList.add('is-loaded');
      setTimeout(() => {
        box.classList.add('is-ready');
        if (isEmbed && coarse) {
          const lock = document.createElement('button'); lock.type = 'button'; lock.className = 'embed__lock';
          lock.innerHTML = '<span>Toca para usar el prototipo</span>';
          const ex = document.createElement('button'); ex.type = 'button'; ex.className = 'embed__exit'; ex.textContent = 'Salir del prototipo';
          lock.addEventListener('click', () => box.classList.add('is-active'));
          ex.addEventListener('click', () => { box.classList.remove('is-active'); leaveFs(box); });
          box.append(lock, ex);
        }
      }, isEmbed ? 5000 : 0);
    });
    box.appendChild(f);
    if (!isEmbed) { const st = box.querySelector('.embed__ph p'); if (st) st.textContent = 'Cargando…'; }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-embed]');
    if (b) { loadEmbed(b); return; }
    const fs = e.target.closest('[data-fs]');
    if (fs) {
      const t = document.getElementById(fs.dataset.fs);
      if (!t) return;
      const lb = t.querySelector('[data-embed]'); if (lb) loadEmbed(lb);
      const fallback = () => { t.classList.add('is-fs', 'is-active'); document.documentElement.style.overflow = 'hidden'; };
      if (t.requestFullscreen) t.requestFullscreen().then(() => t.classList.add('is-active')).catch(fallback); else fallback();
    }
  });
  function leaveFs(t) {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    t.classList.remove('is-fs'); document.documentElement.style.overflow = '';
  }
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) $$('.embed.is-fs').forEach(t => leaveFs(t));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') $$('.embed.is-fs').forEach(leaveFs); });
  // mensaje de Figma (si se usa client-id) para quitar la pantalla de carga antes
  addEventListener('message', e => {
    if (e.origin !== 'https://www.figma.com' || !e.data || e.data.type !== 'INITIAL_LOAD') return;
    $$('.embed iframe').forEach(f => { if (f.contentWindow === e.source) f.closest('.embed').classList.add('is-ready'); });
  });
  // escritorio: precargar el prototipo cuando se acerca a la pantalla
  if (!coarse && 'IntersectionObserver' in window) {
    const eio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { eio.unobserve(en.target); const b = en.target.querySelector('[data-embed]'); if (b) loadEmbed(b); }
    }), { rootMargin: '500px 0px' });
    $$('.embed').forEach(el => eio.observe(el));
  }
  // el cursor personalizado se oculta sobre el prototipo (el mouse sigue funcionando)
  $$('.embed').forEach(el => {
    el.addEventListener('mouseenter', () => root.classList.add('no-cursor'));
    el.addEventListener('mouseleave', () => root.classList.remove('no-cursor'));
  });

  /* ---------- visor (fotos y videos) ---------- */
  const lb = $('#lightbox');
  if (lb) {
    const img = $('.lb__img', lb), vid = $('.lb__video', lb), cap = $('.lb__cap', lb), cnt = $('.lb__count', lb);
    const bPrev = $('.lb__prev', lb), bNext = $('.lb__next', lb), bClose = $('.lb__close', lb);
    let list = [], idx = 0, opener = null;
    const show = i => {
      idx = (i + list.length) % list.length;
      const it = list[idx];
      vid.pause(); vid.removeAttribute('src'); vid.load();
      if (it.video) {
        img.hidden = true; vid.hidden = false;
        vid.src = it.video; vid.poster = it.src || ''; vid.play().catch(() => {});
      } else {
        vid.hidden = true; img.hidden = false;
        img.src = it.src; img.alt = it.alt;
      }
      cap.innerHTML = '';
      if (it.title) { const b = document.createElement('b'); b.textContent = it.title; cap.appendChild(b); }
      if (it.desc) cap.appendChild(document.createTextNode(it.desc));
      cnt.textContent = list.length > 1 ? `${String(idx + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}` : '';
      const many = list.length > 1;
      bPrev.hidden = bNext.hidden = !many;
    };
    const open = (group, el) => {
      list = $$(`[data-lightbox="${group}"]`).map(n => {
        const im = $('img', n);
        return {
          el: n, src: n.dataset.full || (im && im.currentSrc) || '', alt: im ? im.alt : '',
          video: n.dataset.video || '', title: n.dataset.title || '', desc: n.dataset.desc || ''
        };
      });
      opener = el; idx = list.findIndex(l => l.el === el);
      lb.hidden = false; body.style.overflow = 'hidden';
      show(idx);
      requestAnimationFrame(() => lb.classList.add('is-open'));
      bClose.focus();
    };
    const close = () => {
      lb.classList.remove('is-open'); vid.pause();
      setTimeout(() => { lb.hidden = true; img.removeAttribute('src'); }, 320);
      body.style.overflow = ''; if (opener) opener.focus();
    };
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-lightbox]');
      if (t) { e.preventDefault(); open(t.dataset.lightbox, t); }
    });
    bClose.addEventListener('click', close);
    bPrev.addEventListener('click', () => show(idx - 1));
    bNext.addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'Tab') {
        const f = $$('button:not([hidden])', lb), a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
      if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu();
    });
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 60 && list.length > 1) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) closeMenu(); });

  /* ---------- motion: los videos se reproducen en bucle al verse ---------- */
  const vids = $$('.mt video');
  if (vids.length) {
    let playing = new Set();
    const vio = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src && v.dataset.src) { v.src = v.dataset.src; }
        if (playing.size >= 4) return;
        v.play().then(() => { v.classList.add('is-on'); playing.add(v); }).catch(() => {});
      } else {
        v.pause(); playing.delete(v);
      }
    }), { threshold: .35 });
    vids.forEach(v => {
      v.muted = true; v.loop = true; v.playsInline = true;
      v.addEventListener('error', () => v.classList.remove('is-on'));
      vio.observe(v);
    });
    if (reduce) vids.forEach(v => { v.pause(); v.removeAttribute('autoplay'); });
  }

  /* ---------- enlace "ver todos" y año ---------- */
  $$('[data-year]').forEach(n => { n.textContent = new Date().getFullYear(); });
})();

/* ---------- visor sin cámara: chroma key en WebGL sobre la portada ---------- */
(() => {
  const root = document.querySelector('[data-viewer]'); if (!root) return;
  const stage = root.querySelector('[data-stage]'), cv = root.querySelector('[data-canvas]'), vid = root.querySelector('[data-vid]');
  root.querySelectorAll('[data-dlg]').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.dlg[open]').forEach(x => x.close()); document.getElementById(b.dataset.dlg).show(); }));
  const closeAll = () => document.querySelectorAll('.dlg[open]').forEach(x => x.close());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('click', e => { if (document.querySelector('.dlg[open]') && !e.target.closest('.dlg__box,[data-dlg]')) { closeAll(); e.stopPropagation(); e.preventDefault(); } }, true);
  const gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true }); if (!gl) return;
  const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;varying vec2 u;void main(){u=p*.5+.5;u.y=1.-u.y;gl_Position=vec4(p,0.,1.);}'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec2 u;uniform sampler2D t;uniform vec2 sc;void main(){vec2 q=(u-.5)/sc+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.){gl_FragColor=vec4(0.);return;}vec4 c=texture2D(t,q);float d0=distance(c.rgb,vec3(0.,1.,0.));c.g=min(c.g,max(c.r,c.b)+.05);float a=smoothstep(.6,.85,d0);gl_FragColor=vec4(c.rgb,a);}'));
  gl.linkProgram(pr); gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const l = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
  let run = false, started = false;
  const replay = () => { vid.muted = false; vid.currentTime = 0; vid.play().catch(() => {}); if (!run) { run = true; draw(); } };
  stage.addEventListener('click', replay); stage.style.cursor = 'pointer'; stage.setAttribute('data-cursor', 'Repetir');
  const size = () => { const r = stage.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d); gl.viewport(0, 0, cv.width, cv.height); };
  const draw = () => {
    if (!run) return;
    if (vid.readyState >= 2) {
      const ar = (cv.width / cv.height), va = vid.videoWidth / vid.videoHeight, w = 1.55; // el video ocupa 1.55x el ancho de la portada
      gl.uniform2f(gl.getUniformLocation(pr, 'sc'), w, w * ar / va);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, vid);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(draw);
  };
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !run) { run = true; vid.preload = 'auto'; size(); if (!started) { started = true; vid.muted = false; vid.play().catch(() => { vid.muted = true; vid.play().catch(() => {}); }); } draw(); }
    else if (!e.isIntersecting) { run = false; vid.pause(); }
  }), { threshold: .2 }).observe(stage);
  addEventListener('resize', () => run && size());
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) {
    const rx = e => { const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; stage.style.transform = `perspective(900px) rotateY(${(x * 16).toFixed(1)}deg) rotateX(${(-y * 16).toFixed(1)}deg)`; };
    root.addEventListener('pointermove', rx); root.addEventListener('pointerleave', () => stage.style.transform = '');
  }
})();
