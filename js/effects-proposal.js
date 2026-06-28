/* ====== INTERPLANETARY 3D SCROLLYTELLING ENGINE (PROPUESTA AVANZADA) ======
 * Developed for Ignacio Aguayo - Creative Technologist Portfolio
 * Features: Solar System Travel, Procedural Planets with Rings, Orbital Satellites & Smooth Camera Flight
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

    // --- 2. THREE.JS INTERPLANETARY ENGINE & PROCEDURAL PLANETS ---
    let scene, camera, renderer;
    let sunMesh, planet1Group, planet2Group, planet3Group, planet4Group;
    let particleSystem;
    let mouseX = 0, mouseY = 0;
    
    // Coordenadas objetivo de cámara por scroll
    let targetCamPos = { x: 0, y: 0, z: 18 };
    let targetCamLook = { x: 0, y: 0, z: 0 };

    function initInterplanetaryEngine() {
        const canvas = document.getElementById('dyson-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 18);

        // Iluminación Cósmica
        const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
        scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0x3b82f6, 10, 120);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0x8b5cf6, 1.5);
        fillLight.position.set(20, 20, 20);
        scene.add(fillLight);

        // A. SOL CENTRAL (Hero)
        const sunGeo = new THREE.SphereGeometry(3.5, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.7 });
        sunMesh = new THREE.Mesh(sunGeo, sunMat);
        scene.add(sunMesh);

        const sunCoreGeo = new THREE.SphereGeometry(2.8, 32, 32);
        const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.85 });
        sunMesh.add(new THREE.Mesh(sunCoreGeo, sunCoreMat));

        // B. PLANETA 1: "NEXO DE IDENTIDAD" (Sobre Mí) - Cyan Tech
        planet1Group = new THREE.Group();
        planet1Group.position.set(-14, 6, -18);
        
        const p1Geo = new THREE.SphereGeometry(3.2, 32, 32);
        const p1Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8, roughness: 0.2, wireframe: true });
        const p1Mesh = new THREE.Mesh(p1Geo, p1Mat);
        planet1Group.add(p1Mesh);

        const p1AtmGeo = new THREE.TorusGeometry(4.8, 0.08, 16, 100);
        const p1AtmMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.6 });
        const p1Ring = new THREE.Mesh(p1AtmGeo, p1AtmMat);
        p1Ring.rotation.x = Math.PI / 3;
        planet1Group.add(p1Ring);
        scene.add(planet1Group);

        // C. PLANETA 2: "NODO DE CREACIÓN" (Proyectos) - Gigante Gaseoso Púrpura con Anillos
        planet2Group = new THREE.Group();
        planet2Group.position.set(18, -10, -38);

        const p2Geo = new THREE.SphereGeometry(5.0, 32, 32);
        const p2Mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.5, roughness: 0.3 });
        const p2Mesh = new THREE.Mesh(p2Geo, p2Mat);
        planet2Group.add(p2Mesh);

        // Anillos saturnianos grandes
        const p2RingGeo = new THREE.TorusGeometry(8.5, 0.6, 2, 100);
        const p2RingMat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true, transparent: true, opacity: 0.7 });
        const p2Ring = new THREE.Mesh(p2RingGeo, p2RingMat);
        p2Ring.rotation.x = Math.PI / 2.4;
        planet2Group.add(p2Ring);

        // Satélites interactivos alrededor del gigante
        const satGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const satMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
        for (let i = 0; i < 6; i++) {
            const sat = new THREE.Mesh(satGeo, satMat);
            const angle = (i / 6) * Math.PI * 2;
            sat.position.set(Math.cos(angle) * 11, Math.sin(angle) * 3, Math.sin(angle) * 11);
            planet2Group.add(sat);
        }
        scene.add(planet2Group);

        // D. PLANETA 3: "ÓRBITA SOCIAL" (Eventos) - Terrestre Dorado
        planet3Group = new THREE.Group();
        planet3Group.position.set(-16, -24, -58);

        const p3Geo = new THREE.SphereGeometry(4.0, 32, 32);
        const p3Mat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.7, roughness: 0.2, wireframe: true });
        const p3Mesh = new THREE.Mesh(p3Geo, p3Mat);
        planet3Group.add(p3Mesh);
        scene.add(planet3Group);

        // E. PLANETA 4: "FARO CÓSMICO" (Contacto) - Cristal Magenta
        planet4Group = new THREE.Group();
        planet4Group.position.set(0, -38, -78);

        const p4Geo = new THREE.OctahedronGeometry(4.5, 2);
        const p4Mat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.9, roughness: 0.1, wireframe: true });
        const p4Mesh = new THREE.Mesh(p4Geo, p4Mat);
        planet4Group.add(p4Mesh);
        scene.add(planet4Group);

        // F. VÓRTICE DE POLVO ESTELAR
        const particleCount = 3500;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorOpts = [new THREE.Color(0x3b82f6), new THREE.Color(0x8b5cf6), new THREE.Color(0x06b6d4), new THREE.Color(0xec4899)];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

            const c = colorOpts[Math.floor(Math.random() * colorOpts.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
        particleSystem = new THREE.Points(particleGeo, particleMat);
        scene.add(particleSystem);

        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    let clock = typeof THREE !== 'undefined' ? new THREE.Clock() : null;

    function animateInterplanetary() {
        requestAnimationFrame(animateInterplanetary);
        if (!renderer || !scene || !camera) return;

        const elapsedTime = clock ? clock.getElapsedTime() : 0;

        // Rotaciones planetarias independientes
        if (sunMesh) sunMesh.rotation.y = elapsedTime * 0.15;
        if (planet1Group) planet1Group.rotation.y = elapsedTime * 0.25;
        if (planet2Group) {
            planet2Group.rotation.y = elapsedTime * 0.12;
            planet2Group.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05;
        }
        if (planet3Group) planet3Group.rotation.y = elapsedTime * 0.2;
        if (planet4Group) {
            planet4Group.rotation.y = elapsedTime * 0.3;
            planet4Group.rotation.x = elapsedTime * 0.15;
        }
        if (particleSystem) particleSystem.rotation.y = elapsedTime * 0.02;

        // Vuelo suave de cámara entre planetas acoplado al scroll
        camera.position.x += (targetCamPos.x + (mouseX * 0.8) - camera.position.x) * 0.04;
        camera.position.y += (targetCamPos.y + (mouseY * 0.8) - camera.position.y) * 0.04;
        camera.position.z += (targetCamPos.z - camera.position.z) * 0.04;

        camera.lookAt(targetCamLook.x, targetCamLook.y, targetCamLook.z);

        renderer.render(scene, camera);
    }

    if (finePointer) {
        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    // --- 3. GSAP SCROLLTRIGGER INTERPLANETARY TRAVEL ---
    function initScrollTriggerTravel() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reducedMotion) return;

        gsap.registerPlugin(ScrollTrigger);

        // Rutas de vuelo espacial entre planetas por sección
        const planetaryWaypoints = [
            { id: '#inicio', pos: { x: 0, y: 0, z: 18 }, look: { x: 0, y: 0, z: 0 } },
            { id: '#sobre-mi', pos: { x: -7, y: 6, z: -8 }, look: { x: -14, y: 6, z: -18 } },
            { id: '#proyectos', pos: { x: 8, y: -10, z: -24 }, look: { x: 18, y: -10, z: -38 } },
            { id: '#mas-proyectos', pos: { x: 12, y: -8, z: -28 }, look: { x: 18, y: -10, z: -38 } },
            { id: '#eventos', pos: { x: -8, y: -24, z: -46 }, look: { x: -16, y: -24, z: -58 } },
            { id: '#servicios', pos: { x: -4, y: -30, z: -62 }, look: { x: 0, y: -38, z: -78 } },
            { id: '#contacto', pos: { x: 0, y: -32, z: -64 }, look: { x: 0, y: -38, z: -78 } }
        ];

        planetaryWaypoints.forEach(function (wp) {
            const el = document.querySelector(wp.id);
            if (!el) return;

            ScrollTrigger.create({
                trigger: el,
                start: 'top center',
                end: 'bottom center',
                onEnter: function () {
                    targetCamPos = wp.pos;
                    targetCamLook = wp.look;
                },
                onEnterBack: function () {
                    targetCamPos = wp.pos;
                    targetCamLook = wp.look;
                }
            });
        });

        gsap.utils.toArray('.reveal').forEach(function (elem) {
            gsap.fromTo(elem, 
                { opacity: 0, y: 60, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

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

    // --- 4. SECUNDARY INTERACTIVE EFFECTS ---
    function initSecondaryEffects() {
        if (reducedMotion || !finePointer) return;

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

        document.querySelectorAll('[data-modal-trigger]').forEach(function (card) {
            card.classList.add('tilt-card');
            card.addEventListener('mousemove', function (e) {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(900px) rotateY(' + (x * 12).toFixed(2) + 'deg) rotateX(' + (-y * 12).toFixed(2) + 'deg) translateY(-8px)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initInterplanetaryEngine();
        animateInterplanetary();
        initScrollTriggerTravel();
        initSecondaryEffects();
    });

})();
