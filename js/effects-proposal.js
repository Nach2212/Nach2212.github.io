/* ====== AWWWARDS-LEVEL 3D & GSAP SCROLLYTELLING ENGINE (PROPUESTA RESTRUCTURADA 3.0) ======
 * Powered by: Three.js, GSAP 3, ScrollTrigger, SplitType, Lenis Smooth Scroll
 * Developed for Ignacio Aguayo - Creative Technologist Portfolio
 */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    // --- 0. LENIS SMOOTH SCROLL ENGINE ---
    let lenis;
    function initLenisSmoothScroll() {
        if (typeof Lenis === 'undefined' || reducedMotion) return;
        
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Sincronización con GSAP ScrollTrigger
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }
    }

    // --- 1. LIGHTBOX GALERÍA DE EVENTOS ---
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

        document.querySelectorAll('#eventos .grid > div, .event-card').forEach(function (card) {
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

    // --- 2. THREE.JS INTERPLANETARY ENGINE ---
    let scene, camera, renderer;
    let sunMesh, planet1Group, planet2Group, planet3Group, planet4Group;
    let particleSystem;
    let mouseX = 0, mouseY = 0;
    
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

        const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
        scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0x06b6d4, 12, 140);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        const fillLight = new THREE.DirectionalLight(0xa855f7, 2.0);
        fillLight.position.set(25, 25, 25);
        scene.add(fillLight);

        // A. SOL CENTRAL (Hero)
        const sunGeo = new THREE.SphereGeometry(4.0, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.75 });
        sunMesh = new THREE.Mesh(sunGeo, sunMat);
        scene.add(sunMesh);

        const sunCoreGeo = new THREE.SphereGeometry(3.2, 32, 32);
        const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.85 });
        sunMesh.add(new THREE.Mesh(sunCoreGeo, sunCoreMat));

        // B. PLANETA 1: NEXO DE IDENTIDAD (Sobre Mí)
        planet1Group = new THREE.Group();
        planet1Group.position.set(-15, 7, -20);
        
        const p1Geo = new THREE.SphereGeometry(3.6, 32, 32);
        const p1Mat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.85, roughness: 0.15, wireframe: true });
        planet1Group.add(new THREE.Mesh(p1Geo, p1Mat));

        const p1RingGeo = new THREE.TorusGeometry(5.4, 0.1, 16, 100);
        const p1RingMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.7 });
        const p1Ring = new THREE.Mesh(p1RingGeo, p1RingMat);
        p1Ring.rotation.x = Math.PI / 3;
        planet1Group.add(p1Ring);
        scene.add(planet1Group);

        // C. PLANETA 2: NODO DE CREACIÓN (Proyectos - Gigante Gaseoso con Anillos)
        planet2Group = new THREE.Group();
        planet2Group.position.set(20, -12, -42);

        const p2Geo = new THREE.SphereGeometry(5.8, 32, 32);
        const p2Mat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.6, roughness: 0.2 });
        planet2Group.add(new THREE.Mesh(p2Geo, p2Mat));

        const p2RingGeo = new THREE.TorusGeometry(9.8, 0.8, 2, 100);
        const p2RingMat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true, transparent: true, opacity: 0.8 });
        const p2Ring = new THREE.Mesh(p2RingGeo, p2RingMat);
        p2Ring.rotation.x = Math.PI / 2.3;
        planet2Group.add(p2Ring);

        // Satélites interactivos
        const satGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const satMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
        for (let i = 0; i < 8; i++) {
            const sat = new THREE.Mesh(satGeo, satMat);
            const angle = (i / 8) * Math.PI * 2;
            sat.position.set(Math.cos(angle) * 13, Math.sin(angle) * 4, Math.sin(angle) * 13);
            planet2Group.add(sat);
        }
        scene.add(planet2Group);

        // D. PLANETA 3: ÓRBITA SOCIAL (Eventos)
        planet3Group = new THREE.Group();
        planet3Group.position.set(-18, -28, -64);
        const p3Geo = new THREE.SphereGeometry(4.5, 32, 32);
        const p3Mat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.75, roughness: 0.25, wireframe: true });
        planet3Group.add(new THREE.Mesh(p3Geo, p3Mat));
        scene.add(planet3Group);

        // E. PLANETA 4: FARO CÓSMICO (Contacto)
        planet4Group = new THREE.Group();
        planet4Group.position.set(0, -42, -85);
        const p4Geo = new THREE.OctahedronGeometry(5.0, 2);
        const p4Mat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.95, roughness: 0.05, wireframe: true });
        planet4Group.add(new THREE.Mesh(p4Geo, p4Mat));
        scene.add(planet4Group);

        // F. VÓRTICE DE POLVO ESTELAR
        const particleCount = 4000;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorOpts = [new THREE.Color(0x06b6d4), new THREE.Color(0x3b82f6), new THREE.Color(0xa855f7), new THREE.Color(0xec4899)];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 140;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 180;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 140;

            const c = colorOpts[Math.floor(Math.random() * colorOpts.length)];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMat = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
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

        if (sunMesh) sunMesh.rotation.y = elapsedTime * 0.2;
        if (planet1Group) planet1Group.rotation.y = elapsedTime * 0.25;
        if (planet2Group) planet2Group.rotation.y = elapsedTime * 0.15;
        if (planet3Group) planet3Group.rotation.y = elapsedTime * 0.22;
        if (planet4Group) planet4Group.rotation.y = elapsedTime * 0.35;
        if (particleSystem) particleSystem.rotation.y = elapsedTime * 0.025;

        camera.position.x += (targetCamPos.x + (mouseX * 0.8) - camera.position.x) * 0.045;
        camera.position.y += (targetCamPos.y + (mouseY * 0.8) - camera.position.y) * 0.045;
        camera.position.z += (targetCamPos.z - camera.position.z) * 0.045;

        camera.lookAt(targetCamLook.x, targetCamLook.y, targetCamLook.z);

        renderer.render(scene, camera);
    }

    if (finePointer) {
        window.addEventListener('mousemove', function (e) {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    // --- 3. ADVANCED GSAP SCROLLTRIGGER & PINNED HORIZONTAL SCROLL ---
    function initAdvancedGSAPOrchestration() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reducedMotion) return;

        gsap.registerPlugin(ScrollTrigger);

        // Waypoints de vuelo tridimensional
        const planetaryWaypoints = [
            { id: '#inicio', pos: { x: 0, y: 0, z: 18 }, look: { x: 0, y: 0, z: 0 } },
            { id: '#sobre-mi', pos: { x: -7, y: 7, z: -10 }, look: { x: -15, y: 7, z: -20 } },
            { id: '#proyectos-container', pos: { x: 9, y: -12, z: -26 }, look: { x: 20, y: -12, z: -42 } },
            { id: '#eventos', pos: { x: -8, y: -28, z: -50 }, look: { x: -18, y: -28, z: -64 } },
            { id: '#servicios', pos: { x: -4, y: -34, z: -68 }, look: { x: 0, y: -42, z: -85 } },
            { id: '#contacto', pos: { x: 0, y: -36, z: -70 }, look: { x: 0, y: -42, z: -85 } }
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

        // A. PINNED HORIZONTAL SCROLL EN SECCIÓN PROYECTOS
        const projectsTrack = document.getElementById('projects-horizontal-track');
        const projectsContainer = document.getElementById('proyectos-container');
        if (projectsTrack && projectsContainer) {
            const getScrollAmount = () => -(projectsTrack.scrollWidth - window.innerWidth + 120);
            
            gsap.to(projectsTrack, {
                x: getScrollAmount,
                ease: 'none',
                scrollTrigger: {
                    trigger: projectsContainer,
                    start: 'top top',
                    end: () => '+=' + (projectsTrack.scrollWidth - window.innerWidth + 400),
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });
        }

        // B. SPLIT-TYPE TEXT REVEALS (Carácter por carácter)
        if (typeof SplitType !== 'undefined') {
            const splitTitles = document.querySelectorAll('.split-reveal');
            splitTitles.forEach(function (title) {
                const text = new SplitType(title, { types: 'chars, words' });
                gsap.fromTo(text.chars,
                    { opacity: 0, y: 30, rotateX: -90 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.02,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: title,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse'
                        }
                    }
                );
            });
        }

        // C. Revelado suave de elementos de tarjeta
        gsap.utils.toArray('.reveal').forEach(function (elem) {
            if (elem.classList.contains('split-reveal')) return;
            gsap.fromTo(elem, 
                { opacity: 0, y: 50, scale: 0.96 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: elem,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }

    // --- 4. MICRO-INTERACCIONES SECUNDARIAS ---
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

        document.querySelectorAll('.tilt-card, [data-modal-trigger]').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = 'perspective(1000px) rotateY(' + (x * 14).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg) translateY(-8px) scale(1.02)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initLenisSmoothScroll();
        initInterplanetaryEngine();
        animateInterplanetary();
        initAdvancedGSAPOrchestration();
        initSecondaryEffects();
    });

})();
