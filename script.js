(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA = '6281234567890';
  document.documentElement.classList.add('js');

  var rp = function (n) { return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };

  /* Loader */
  var loader = $('#loader');
  var hideLoader = function () { loader.classList.add('selesai'); startCounters(); };
  window.addEventListener('load', function () { setTimeout(hideLoader, reduce ? 0 : 700); });
  setTimeout(hideLoader, 2500);

  /* Progress bar + scrollspy */
  var progress = $('#progress');
  var spyLinks = $$('[data-spy]');
  var spyTargets = spyLinks.map(function (a) { return $('#' + a.dataset.spy); });
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    var cur = -1;
    spyTargets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
    spyLinks.forEach(function (a, i) { a.classList.toggle('aktif', i === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Cursor glow */
  var glow = $('#cursorGlow');
  if (glow && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', function (e) {
      glow.style.opacity = 1;
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    });
  }

  /* Reveal */
  var rev = $$('.reveal');
  rev.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 0.08 + 's'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('terlihat'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add('terlihat'); });

  /* Counter */
  var counted = false;
  function startCounters() {
    if (counted) return; counted = true;
    $$('[data-count]').forEach(function (el) {
      var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), d = 1600;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e).toLocaleString('id-ID') + (p === 1 ? suf : '');
        if (p < 1 && !reduce) requestAnimationFrame(tick); else el.textContent = to.toLocaleString('id-ID') + suf;
      })(t0);
    });
  }

  /* Tilt 3D */
  if (matchMedia('(pointer:fine)').matches && !reduce) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(800px) rotateY(' + x * 12 + 'deg) rotateX(' + -y * 12 + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    /* Magnetic buttons */
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = (e.clientX - r.left - r.width / 2) * 0.15 + 'px ' + (e.clientY - r.top - r.height / 2) * 0.25 + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* Ripple */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.btn, .btn-add'); if (!b) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), sp = document.createElement('span');
    sp.className = 'ripple'; sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 600);
  });

  /* Biji kopi melayang (canvas) */
  var cv = $('#beans');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), W, H, beans = [], dpr = Math.min(devicePixelRatio || 1, 2);
    var mouse = { x: -999, y: -999 };
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var n = innerWidth < 600 ? 14 : 28;
    for (var i = 0; i < n; i++) beans.push({ x: Math.random() * 1200, y: Math.random() * 800, r: 5 + Math.random() * 9, a: Math.random() * 6, v: .2 + Math.random() * .5, w: (Math.random() - .5) * .02, o: .15 + Math.random() * .3 });
    cv.parentElement.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      beans.forEach(function (b) {
        b.y -= b.v; b.a += b.w;
        var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120) { b.x += dx / d * 2; b.y += dy / d * 2; }
        if (b.y < -20) { b.y = H + 20; b.x = Math.random() * W; }
        if (b.x > W + 20) b.x = -20; if (b.x < -20) b.x = W + 20;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.globalAlpha = b.o;
        ctx.fillStyle = '#f0a73c'; ctx.beginPath(); ctx.ellipse(0, 0, b.r, b.r * .65, 0, 0, 6.3); ctx.fill();
        ctx.strokeStyle = '#17100d'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-b.r * .8, 0); ctx.quadraticCurveTo(0, b.r * .4, b.r * .8, 0); ctx.stroke();
        ctx.restore();
      });
      requestAnimationFrame(loop);
    })();
  }

  /* Pencarian */
  var cari = $('#cari'), hasil = $('#hasil'), kosong = $('#kosong');
  var items = $$('.menu-item');
  cari.addEventListener('input', function () {
    var q = cari.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (it) {
      var hay = (it.dataset.name + ' ' + (it.dataset.tags || '')).toLowerCase();
      var ok = !q || hay.indexOf(q) > -1;
      it.classList.toggle('sembunyi', !ok); if (ok) shown++;
    });
    $$('.kategori').forEach(function (k) { k.hidden = $$('.menu-item:not(.sembunyi)', k).length === 0; });
    kosong.hidden = shown > 0;
    hasil.textContent = q ? 'Ditemukan ' + shown + ' menu' : 'Menampilkan semua ' + items.length + ' menu';
  });

  /* Keranjang */
  var cart = {}, cartEl = $('#cart'), scrim = $('#scrim'), fab = $('#cartFab'), toastEl = $('#toast'), tt;
  try { cart = JSON.parse(sessionStorage.getItem('ks-cart') || '{}'); } catch (e) { cart = {}; }
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('tampil'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('tampil'); }, 1800); }
  function openCart(o) {
    cartEl.classList.toggle('buka', o); cartEl.setAttribute('aria-hidden', !o); scrim.hidden = !o;
    if (o) $('#cartClose').focus(); else fab.focus();
  }
  function render() {
    var list = $('#cartList'), keys = Object.keys(cart), total = 0, count = 0;
    list.innerHTML = '';
    keys.forEach(function (k) {
      var c = cart[k]; total += c.price * c.qty; count += c.qty;
      var li = document.createElement('li');
      li.innerHTML = '<span class="ci-name"></span><span class="ci-sub">' + rp(c.price * c.qty) + '</span>' +
        '<div class="qty"><button type="button" data-act="-" aria-label="Kurangi">−</button><span>' + c.qty + '</span><button type="button" data-act="+" aria-label="Tambah">+</button></div><span></span>';
      li.firstChild.textContent = k; li.dataset.k = k; list.appendChild(li);
    });
    $('#cartCount').textContent = count; $('#cartTotal').textContent = rp(total);
    $('#cartEmpty').hidden = keys.length > 0;
    var wa = $('#cartWa');
    if (keys.length) {
      var msg = 'Halo Kopi Senja, saya mau pesan:\n' + keys.map(function (k) { return '- ' + k + ' x' + cart[k].qty + ' (' + rp(cart[k].price * cart[k].qty) + ')'; }).join('\n') + '\nTotal: ' + rp(total);
      wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); wa.setAttribute('aria-disabled', 'false');
    } else { wa.href = '#'; wa.setAttribute('aria-disabled', 'true'); }
    try { sessionStorage.setItem('ks-cart', JSON.stringify(cart)); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var add = e.target.closest('.btn-add');
    if (add) {
      var it = add.closest('.menu-item'), k = it.dataset.name;
      cart[k] = cart[k] || { price: +it.dataset.price, qty: 0 }; cart[k].qty++;
      render(); toast(k + ' ditambahkan');
      fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump');
      return;
    }
    var q = e.target.closest('.qty button');
    if (q) {
      var key = q.closest('li').dataset.k; cart[key].qty += q.dataset.act === '+' ? 1 : -1;
      if (cart[key].qty <= 0) delete cart[key]; render();
    }
  });
  fab.addEventListener('click', function () { openCart(true); });
  $('#cartClose').addEventListener('click', function () { openCart(false); });
  scrim.addEventListener('click', function () { openCart(false); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') openCart(false); });
  render();

  /* Jam buka */
  (function () {
    var now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var weekend = day === 0 || day === 6, open = weekend ? 7 * 60 : 8 * 60, close = weekend ? 23 * 60 : 22 * 60;
    $$('#jam li').forEach(function (li) { if (li.dataset.hari.split(',').indexOf(String(day)) > -1) li.classList.add('hari-ini'); });
    var st = $('#status'), isOpen = mins >= open && mins < close;
    st.textContent = isOpen ? 'Sedang buka sekarang' : 'Sedang tutup, buka lagi besok pagi';
    st.classList.add(isOpen ? 'buka' : 'tutup');
  })();
})();
