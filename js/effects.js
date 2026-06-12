// --- EFECTOS VISUALES INTERACTIVOS ---
// Tilt 3D, botones magnéticos, aura de cursor, scrollspy y barra de progreso.
// Todos respetan prefers-reduced-motion y solo se activan con puntero fino (desktop).
(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // --- 1. BARRA DE PROGRESO DE SCROLL ---
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
    function updateBar() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();

    // --- 2. SCROLLSPY (resaltar sección activa en el nav) ---
    // mas-proyectos cuenta como "Proyectos" para el nav
    const spyMap = { 'sobre-mi': '#sobre-mi', 'servicios': '#servicios', 'proyectos': '#proyectos', 'mas-proyectos': '#proyectos' };
    const navLinks = document.querySelectorAll('header .nav-link[href^="#"]');
    if ('IntersectionObserver' in window && navLinks.length) {
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                const target = spyMap[e.target.id];
                navLinks.forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === target);
                });
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        Object.keys(spyMap).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) spy.observe(el);
        });
        // Al volver arriba (hero), limpiar
        const hero = document.getElementById('inicio');
        if (hero) {
            const clear = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) navLinks.forEach(function (l) { l.classList.remove('active'); });
                });
            }, { rootMargin: '-35% 0px -55% 0px' });
            clear.observe(hero);
        }
    }

    if (reduced || !finePointer) return; // lo siguiente es solo desktop + motion ok

    // --- 3. TILT 3D EN TARJETAS DE PROYECTO ---
    document.querySelectorAll('[data-modal-trigger]').forEach(function (card) {
        card.classList.add('tilt-card');
        card.addEventListener('mousemove', function (e) {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateY(-6px)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });

    // --- 4. BOTONES MAGNÉTICOS (hero) ---
    document.querySelectorAll('#inicio a').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px, ' + (y * 0.3).toFixed(1) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
            btn.style.transform = '';
        });
    });

    // --- 5. AURA DE CURSOR (se funde con el starfield) ---
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);
    let tx = window.innerWidth / 2, ty = window.innerHeight / 3;
    let cx = tx, cy = ty;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
        cx += (tx - cx) * 0.09;
        cy += (ty - cy) * 0.09;
        glow.style.transform = 'translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px)';
        requestAnimationFrame(loop);
    })();
})();
