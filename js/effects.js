// --- EFECTOS VISUALES INTERACTIVOS ---
// Tilt 3D, botones magnéticos, aura de cursor, scrollspy y barra de progreso.
// Todos respetan prefers-reduced-motion y solo se activan con puntero fino (desktop).
(function () {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // --- 0. LIGHTBOX PARA IMÁGENES DE EVENTOS ---
    (function () {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        const lbImg = document.getElementById('lightbox-img');
        const lbCounter = document.getElementById('lightbox-counter');
        const btnClose = document.getElementById('lightbox-close');
        const btnPrev = document.getElementById('lightbox-prev');
        const btnNext = document.getElementById('lightbox-next');
        let gallery = [];
        let index = 0;

        function render() {
            lbImg.src = gallery[index];
            lbCounter.textContent = (index + 1) + ' / ' + gallery.length;
            btnPrev.style.display = btnNext.style.display = gallery.length > 1 ? '' : 'none';
        }
        function open(imgs, start) {
            gallery = imgs;
            index = start;
            render();
            lb.classList.remove('opacity-0', 'pointer-events-none');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            lb.classList.add('opacity-0', 'pointer-events-none');
            document.body.style.overflow = '';
        }
        function step(d) {
            index = (index + d + gallery.length) % gallery.length;
            render();
        }

        // Agrupar imágenes por tarjeta de evento
        document.querySelectorAll('#eventos .events-carousel > div').forEach(function (card) {
            const imgs = Array.from(card.querySelectorAll('img'));
            const srcs = imgs.map(function (i) { return i.getAttribute('src'); });
            imgs.forEach(function (img, i) {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', function () { open(srcs, i); });
            });
        });

        btnClose.addEventListener('click', close);
        btnNext.addEventListener('click', function () { step(1); });
        btnPrev.addEventListener('click', function () { step(-1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
        document.addEventListener('keydown', function (e) {
            if (lb.classList.contains('pointer-events-none')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
        });
    })();

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
    const spyMap = { 'sobre-mi': '#sobre-mi', 'proyectos': '#proyectos', 'mas-proyectos': '#proyectos', 'eventos': '#eventos', 'servicios': '#servicios' };
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

    // --- 3. TILT 3D SUTIL EN LA IMAGEN DE CADA FILA DE PROYECTO ---
    // Las filas editoriales son muy anchas para un tilt completo: se aplica solo a la imagen.
    document.querySelectorAll('.project-row .project-media').forEach(function (media) {
        media.classList.add('tilt-card');
        media.addEventListener('mousemove', function (e) {
            const r = media.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            media.style.transform = 'perspective(1100px) rotateY(' + (x * 4).toFixed(2) + 'deg) rotateX(' + (-y * 4).toFixed(2) + 'deg)';
        });
        media.addEventListener('mouseleave', function () {
            media.style.transform = '';
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
