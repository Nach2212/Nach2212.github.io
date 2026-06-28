/* ====== DYSON SWARM & STAR CODES: 3D WEBGL & SCROLLYTELLING ENGINE ======
 * Developed for Ignacio Aguayo - Creative Technologist Portfolio
 * Libraries used: Three.js, GSAP, ScrollTrigger
 */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // --- 0. LIGHTBOX GALERÍA DE EVENTOS ---
    (function initLightbox() {
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
            if (lbCounter) lbCounter.textContent = (index + 1) + ' / ' + gallery.length;
            if (btnPrev && btnNext) btnPrev.style.display = btnNext.style.display = gallery.length > 1 ? '' : 'none';
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

        document.querySelectorAll('#eventos .grid > div').forEach(function (card) {
            const imgs = Array.from(card.querySelectorAll('img'));
            const srcs = imgs.map(function (i) { return i.getAttribute('src'); });
            imgs.forEach(function (img, i) {
                img.style.cursor = 'zoom-in';
                img.addEventListener('click', function (e) {
                    e.stopPropagation();
                    open(srcs, i);
                });
            });
        });

        if (btnClose) btnClose.addEventListener('click', close);
        if (btnNext) btnNext.addEventListener('click', function () { step(1); });
        if (btnPrev) btnPrev.addEventListener('click', function () { step(-1); });
        lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
        document.addEventListener('keydown', function (e) {
            if (lb.classList.contains('pointer-events-none')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'ArrowLeft') step(-1);
        });
    })();

    // --- 1. BARRA DE PROGRESO & SCROLLSPY ---
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);

    function updateProgressBar() {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progressBar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    }
    window.addEventListener('scroll', updateProgressBar, { passive: true });
    updateProgressBar();

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
    }

    // --- 2. THREE.JS DYSON SPHERE & STAR CORE ENGINE ---
    let scene, camera, renderer;
    let starCore, innerDysonRing, outerDysonGroup, particleSystem;
    let mouseX = 0, mouseY = 0;
    let targetCameraZ = 18, targetCameraY = 0, targetCameraRotZ = 0;

    function initThreeDysonEngine() {
        const canvas = document.getElementById('starfield-canvas') || document.getElementById('dyson-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Scene & Camera
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 18);

        // Lights
        const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
        scene.add(ambientLight);

        const starPointLight = new THREE.PointLight(0x3b82f6, 4, 50);
        starPointLight.position.set(0, 0, 0);
        scene.add(starPointLight);

        const secondaryLight = new THREE.PointLight(0x8b5cf6, 3, 40);
        secondaryLight.position.set(5, 5, 5);
        scene.add(secondaryLight);

        // A. STAR CORE (Estrella Central de Energía)
        const starGeo = new THREE.SphereGeometry(2.5, 32, 32);
        const starMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        starCore = new THREE.Mesh(starGeo, starMat);
        scene.add(starCore);

        // Interior Solid Glow Core
        const innerGlowGeo = new THREE.SphereGeometry(2.1, 32, 32);
        const innerGlowMat = new THREE.MeshBasicMaterial({
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.6
        });
        const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
        starCore.add(innerGlow);

        // B. INNER DYSON RING (Anillo de Concentración de Energía)
        const ringGeo = new THREE.TorusGeometry(4.2, 0.08, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x3b82f6,
            emissiveIntensity: 0.5,
            wireframe: true
        });
        innerDysonRing = new THREE.Mesh(ringGeo, ringMat);
        innerDysonRing.rotation.x = Math.PI / 3;
        scene.add(innerDysonRing);

        const ringGeo2 = new THREE.TorusGeometry(5.8, 0.04, 16, 100);
        const ringMat2 = new THREE.MeshStandardMaterial({
            color: 0xec4899,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        const innerDysonRing2 = new THREE.Mesh(ringGeo2, ringMat2);
        innerDysonRing2.rotation.y = Math.PI / 4;
        scene.add(innerDysonRing2);

        // C. OUTER DYSON SWARM (Enjambre de Colectores Solares)
        outerDysonGroup = new THREE.Group();
        const panelGeo = new THREE.BoxGeometry(0.35, 0.6, 0.04);
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x2563eb,
            emissiveIntensity: 0.4
        });

        const numPanels = 140;
        for (let i = 0; i < numPanels; i++) {
            const panel = new THREE.Mesh(panelGeo, panelMat);
            const radius = 6.5 + Math.random() * 4.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;

            panel.position.x = radius * Math.sin(theta) * Math.cos(phi);
            panel.position.y = radius * Math.sin(theta) * Math.sin(phi);
            panel.position.z = radius * Math.cos(theta);

            panel.lookAt(0, 0, 0);
            outerDysonGroup.add(panel);
        }
        scene.add(outerDysonGroup);

        // D. COSMIC PARTICLES (Vórtice Estelar)
        const particleCount = 2200;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [new THREE.Color(0x3b82f6), new THREE.Color(0x8b5cf6), new THREE.Color(0xec4899), new THREE.Color(0x60a5fa)];

        for (let i = 0; i < particleCount; i++) {
            const r = 3 + Math.random() * 25;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI;

            positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = r * Math.cos(theta);

            const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });

        particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);

        // Resize handler
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Interactive Animation Loop
    let clock = typeof THREE !== 'undefined' ? new THREE.Clock() : null;

    function animateThreeDyson() {
        requestAnimationFrame(animateThreeDyson);
        if (!renderer || !scene || !camera) return;

        const elapsedTime = clock ? clock.getElapsedTime() : 0;

        // Rotaciones del Enjambre y la Estrella
        if (starCore) {
            starCore.rotation.y = elapsedTime * 0.2;
            starCore.rotation.x = elapsedTime * 0.1;
            const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.05;
            starCore.scale.set(scale, scale, scale);
        }

        if (innerDysonRing) {
            innerDysonRing.rotation.z = elapsedTime * 0.3;
            innerDysonRing.rotation.y = elapsedTime * 0.15;
        }

        if (outerDysonGroup) {
            outerDysonGroup.rotation.y = elapsedTime * 0.08;
            outerDysonGroup.rotation.x = elapsedTime * 0.04;
        }

        if (particleSystem) {
            particleSystem.rotation.y = elapsedTime * 0.03;
        }

        // Camara e interactividad suave por mouse & scroll
        camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
        camera.position.y += (targetCameraY + (mouseY * 0.5) - camera.position.y) * 0.05;
        camera.position.x += ((mouseX * 0.5) - camera.position.x) * 0.05;
        camera.rotation.z += (targetCameraRotZ - camera.rotation.z) * 0.05;

        renderer.render(scene, camera);
    }

    // Mouse Move listener for 3D parallax
    if (finePointer) {
        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    // --- 3. GSAP SCROLLTRIGGER ORCHESTRATION ---
    function initScrollTriggerOrchestration() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reducedMotion) return;

        gsap.registerPlugin(ScrollTrigger);

        // A. Transformación del Canvas 3D por Secciones
        const sections = [
            { id: '#inicio', z: 18, y: 0, rotZ: 0 },
            { id: '#sobre-mi', z: 14, y: 1.5, rotZ: 0.1 },
            { id: '#proyectos', z: 11, y: -1, rotZ: -0.15 },
            { id: '#mas-proyectos', z: 13, y: 0.5, rotZ: 0.05 },
            { id: '#eventos', z: 15, y: -1.5, rotZ: 0.2 },
            { id: '#servicios', z: 12, y: 1, rotZ: -0.1 },
            { id: '#contacto', z: 9, y: 0, rotZ: 0 }
        ];

        sections.forEach(function (sec) {
            const el = document.querySelector(sec.id);
            if (!el) return;

            ScrollTrigger.create({
                trigger: el,
                start: 'top center',
                end: 'bottom center',
                onEnter: function () {
                    targetCameraZ = sec.z;
                    targetCameraY = sec.y;
                    targetCameraRotZ = sec.rotZ;
                },
                onEnterBack: function () {
                    targetCameraZ = sec.z;
                    targetCameraY = sec.y;
                    targetCameraRotZ = sec.rotZ;
                }
            });
        });

        // B. Animaciones de Entrada Stagger por Sección
        gsap.utils.toArray('.reveal').forEach(function (elem) {
            gsap.fromTo(elem, 
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // C. Animación especial de Hero Content
        const heroWrapper = document.getElementById('hero-content-wrapper');
        if (heroWrapper) {
            gsap.to(heroWrapper, {
                opacity: 1,
                filter: 'blur(0px)',
                scale: 1,
                duration: 1.2,
                ease: 'power2.out',
                delay: 0.2
            });
        }
    }

    // --- 4. SECUNDARY ANIMATIONS: CURSOR GLOW & TELEMETRY ---
    function initSecondaryEffects() {
        if (reducedMotion || !finePointer) return;

        // Aura de Cursor
        const glow = document.createElement('div');
        glow.id = 'cursor-glow';
        document.body.appendChild(glow);
        let tx = window.innerWidth / 2, ty = window.innerHeight / 3;
        let cx = tx, cy = ty;
        window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });

        (function loopGlow() {
            cx += (tx - cx) * 0.09;
            cy += (ty - cy) * 0.09;
            glow.style.transform = 'translate(' + cx.toFixed(1) + 'px, ' + cy.toFixed(1) + 'px)';
            requestAnimationFrame(loopGlow);
        })();

        // Tilt 3D en tarjetas de proyecto
        document.querySelectorAll('[data-modal-trigger]').forEach(function (card) {
            card.classList.add('tilt-card');
            card.addEventListener('mousemove', function (e) {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) translateY(-6px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });

        // Botones Magnéticos
        document.querySelectorAll('#inicio a, header a.bg-blue-600').forEach(function (btn) {
            btn.addEventListener('mousemove', function (e) {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = 'translate(' + (x * 0.2).toFixed(1) + 'px, ' + (y * 0.35).toFixed(1) + 'px)';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
            });
        });
    }

    // DOM Ready Initialization
    document.addEventListener('DOMContentLoaded', function () {
        initThreeDysonEngine();
        animateThreeDyson();
        initScrollTriggerOrchestration();
        initSecondaryEffects();
    });

})();
