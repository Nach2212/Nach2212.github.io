        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // --- SCROLL REVEAL (NEW) ---
        function reveal() {
            var reveals = document.querySelectorAll(".reveal");
            for (var i = 0; i < reveals.length; i++) {
                var windowHeight = window.innerHeight;
                var elementTop = reveals[i].getBoundingClientRect().top;
                var elementVisible = 100; // Trigger point
                if (elementTop < windowHeight - elementVisible) {
                    reveals[i].classList.add("active");
                }
            }
        }
        window.addEventListener("scroll", reveal);
        // Trigger once to show initial elements
        setTimeout(reveal, 100);


        const langToggle = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        let currentLang = 'es';

        // --- MORE PROJECTS SCRIPT ---
        const projectListContainer = document.getElementById('more-projects-list');
        const initialMessage = document.getElementById('mp-initial-message');
        const contentContainer = document.getElementById('mp-content');
        const titleEl = document.getElementById('mp-title');
        const videoEl = document.getElementById('mp-video');
        const descriptionEl = document.getElementById('mp-description');
        const filterButtons = document.querySelectorAll('.mp-filter-btn');
        let projectItems = [];

        function showProjectDetails(projectId) {
            const projectData = translations[currentLang].mp[projectId];
            if (!projectData) return;

            titleEl.textContent = projectData.title;
            descriptionEl.textContent = projectData.desc;
            
            const localVideoEl = document.getElementById('mp-local-video');
            const imageCarouselEl = document.getElementById('mp-image-carousel');
            
            // Ocultar todos primero
            videoEl.classList.add('hidden');
            videoEl.src = "";
            if (localVideoEl) {
                localVideoEl.classList.add('hidden');
                localVideoEl.src = "";
            }
            if (imageCarouselEl) {
                imageCarouselEl.classList.add('hidden');
                imageCarouselEl.innerHTML = "";
            }

            if (projectData.videoId) {
                videoEl.classList.remove('hidden');
                videoEl.src = `https://www.youtube.com/embed/${projectData.videoId}`;
            } else if (projectData.localVideo) {
                if (localVideoEl) {
                    localVideoEl.classList.remove('hidden');
                    localVideoEl.src = projectData.localVideo;
                    localVideoEl.load();
                }
            } else if (projectData.images && projectData.images.length > 0) {
                if (imageCarouselEl) {
                    imageCarouselEl.classList.remove('hidden');
                    const wrapper = document.createElement('div');
                    wrapper.className = 'w-full h-full flex gap-3 overflow-x-auto snap-x scrollbar-thin p-1';
                    
                    projectData.images.forEach(imgSrc => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.className = 'h-full object-contain bg-slate-950/60 rounded-xl snap-center flex-shrink-0 border border-slate-800 shadow-md';
                        img.alt = projectData.title;
                        wrapper.appendChild(img);
                    });
                    imageCarouselEl.appendChild(wrapper);
                }
            }

            initialMessage.classList.add('hidden');
            contentContainer.classList.remove('hidden');
            contentContainer.classList.add('flex');
            
            projectItems.forEach(item => {
                if (item.dataset.projectId === projectId) {
                    item.classList.add('bg-blue-600/10', 'border-l-4', 'border-blue-500', 'text-white');
                    item.classList.remove('text-gray-400', 'hover:bg-slate-800/20');
                } else {
                    item.classList.remove('bg-blue-600/10', 'border-l-4', 'border-blue-500', 'text-white');
                    item.classList.add('text-gray-400', 'hover:bg-slate-800/20');
                }
            });
        }
        
        function filterProjects(filter) {
            initialMessage.classList.remove('hidden');
            contentContainer.classList.add('hidden');
            contentContainer.classList.remove('flex');
            videoEl.src = "";
            videoEl.classList.add('hidden');
            const localVideoEl = document.getElementById('mp-local-video');
            if (localVideoEl) {
                localVideoEl.src = "";
                localVideoEl.classList.add('hidden');
            }
            const imageCarouselEl = document.getElementById('mp-image-carousel');
            if (imageCarouselEl) {
                imageCarouselEl.innerHTML = "";
                imageCarouselEl.classList.add('hidden');
            }

            filterButtons.forEach(btn => {
                if (btn.dataset.filter === filter) {
                    btn.classList.add('bg-blue-600', 'text-white', 'border-blue-500/30', 'shadow-md', 'shadow-blue-500/20');
                    btn.classList.remove('bg-slate-900/60', 'text-gray-400', 'hover:bg-slate-800/80');
                } else {
                    btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-500/30', 'shadow-md', 'shadow-blue-500/20');
                    btn.classList.add('bg-slate-900/60', 'text-gray-400', 'hover:bg-slate-800/80');
                }
            });
            
            projectItems.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        function setupMoreProjects(lang) {
            projectListContainer.innerHTML = ''; 
            projectItems = []; 
            const projects = translations[lang].mp;

            for (const id in projects) {
                const project = projects[id];
                const item = document.createElement('button');
                item.className = 'block w-full text-left px-6 py-4 border-b border-slate-800/60 text-gray-400 font-medium hover:bg-slate-800/20 transition-all duration-200';
                item.textContent = project.title;
                item.dataset.projectId = id;
                item.dataset.category = project.category;
                
                item.addEventListener('click', () => {
                    showProjectDetails(id);
                });
                
                projectListContainer.appendChild(item);
                projectItems.push(item);
            }
            
            filterButtons.forEach(btn => {
                btn.onclick = () => filterProjects(btn.dataset.filter);
            });
            filterProjects('all');
        }

        function switchLanguage(lang) {
            document.documentElement.lang = lang;
            const elements = document.querySelectorAll('[data-lang-key]');
            elements.forEach(el => {
                const key = el.dataset.langKey;
                if (translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            });
            const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
            modalTriggers.forEach(trigger => {
                const prefix = trigger.dataset.langKeyPrefix;
                if (prefix) {
                    trigger.dataset.title = translations[lang][`${prefix}Title`] || trigger.dataset.title;
                    trigger.dataset.subtitle = translations[lang][`${prefix}Subtitle`] || trigger.dataset.subtitle;
                    trigger.dataset.challenge = translations[lang][`${prefix}Challenge`] || trigger.dataset.challenge;
                    trigger.dataset.process = translations[lang][`${prefix}Process`] || trigger.dataset.process;
                }
            });
            
            setupMoreProjects(lang);
            langToggle.checked = lang === 'es';
            langToggleMobile.checked = lang === 'es';
        }

        langToggle.addEventListener('change', () => {
            currentLang = langToggle.checked ? 'es' : 'en';
            switchLanguage(currentLang);
        });

        switchLanguage('es');

        // --- MOBILE MENU ---
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });

        // --- OPTIMIZED CANVAS SCRIPT ---
        const canvas = document.getElementById('starfield-canvas');
        let giantMeteor = null;
        let glowActive = false;
        let glowOpacity = 0;
        let glowRadius = 0;
        let maxGlowRadius = 0;

        if (canvas && !prefersReducedMotion) {
            const ctx = canvas.getContext('2d');
            let stars = [];
            let shootingStars = [];
            let animationFrameId;

            // Debounce resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    initCanvas();
                }, 200);
            });

            let mouse = { x: undefined, y: undefined, radius: 120 };
            window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
            window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });

            class GiantMeteor {
                constructor(canvas) {
                    this.canvas = canvas;
                    this.reset();
                }
                reset() {
                    const sizeFactor = Math.max(this.canvas.width, this.canvas.height);
                    // Start far top-left off-screen
                    this.x = -sizeFactor * 0.3;
                    this.y = -sizeFactor * 0.3;
                    
                    // Path parameters (diagonal: top-left to bottom-right)
                    this.speed = sizeFactor / 110; // Cross in ~110 frames (1.8s)
                    const angle = Math.PI / 6; // 30-degree path
                    this.speedX = Math.cos(angle) * this.speed;
                    this.speedY = Math.sin(angle) * this.speed;
                    
                    this.tailLength = sizeFactor * 0.45;
                    this.active = false;
                    this.hasTriggeredText = false;
                }
                start() {
                    this.active = true;
                }
                update(ctx, onCenterPass) {
                    if (!this.active) return;

                    this.x += this.speedX;
                    this.y += this.speedY;

                    // Trigger the text reveal when the head crosses screen center
                    if (!this.hasTriggeredText && this.x >= this.canvas.width / 2) {
                        this.hasTriggeredText = true;
                        if (onCenterPass) onCenterPass();
                    }

                    // Check bounds to terminate the animation
                    if (this.x - this.tailLength > this.canvas.width || this.y - this.tailLength > this.canvas.height) {
                        this.active = false;
                    }

                    this.draw(ctx);
                }
                draw(ctx) {
                    const angle = Math.atan2(this.speedY, this.speedX);
                    const tailX = this.x - Math.cos(angle) * this.tailLength;
                    const tailY = this.y - Math.sin(angle) * this.tailLength;

                    // Tail gradient
                    const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                    grad.addColorStop(0.1, 'rgba(0, 243, 255, 0.85)'); // Cyan glow
                    grad.addColorStop(0.35, 'rgba(59, 130, 246, 0.5)'); // Blue glow
                    grad.addColorStop(0.7, 'rgba(99, 102, 241, 0.15)'); // Indigo glow
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.lineCap = 'round';

                    // Outer soft glow tail
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 14;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(tailX, tailY);
                    ctx.stroke();

                    // Inner bright tail
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(tailX, tailY);
                    ctx.stroke();

                    // Core white line
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x - Math.cos(angle) * (this.tailLength * 0.15), this.y - Math.sin(angle) * (this.tailLength * 0.15));
                    ctx.stroke();

                    // Head outer glow
                    const outerGlow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 35);
                    outerGlow.addColorStop(0, 'rgba(0, 243, 255, 0.45)');
                    outerGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
                    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = outerGlow;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 35, 0, Math.PI * 2);
                    ctx.fill();

                    // Head inner core
                    const innerGlow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 9);
                    innerGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                    innerGlow.addColorStop(0.7, 'rgba(0, 243, 255, 0.8)');
                    innerGlow.addColorStop(1, 'rgba(0, 243, 255, 0)');
                    ctx.fillStyle = innerGlow;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 9, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            class Star {
                constructor(x, y, speedX, speedY, size, rgb, baseOpacity) {
                    this.x = x; this.y = y; this.speedX = speedX; this.speedY = speedY; this.size = size;
                    this.rgb = rgb; // array: [r, g, b]
                    this.baseOpacity = baseOpacity;
                    this.baseX = x; this.baseY = y; this.density = (Math.random() * 20) + 1;
                    
                    // Centelleo dinámico (Twinkle effect) - más suave y lento
                    this.twinkleSpeed = Math.random() * 0.015 + 0.005;
                    this.twinklePhase = Math.random() * Math.PI * 2;
                }
                draw() {
                    this.twinklePhase += this.twinkleSpeed;
                    // Oscila suavemente la opacidad alrededor de su base (rango reducido a 0.14 para centelleo sutil)
                    let opacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.14;
                    if (opacity < 0.2) opacity = 0.2;
                    if (opacity > 0.85) opacity = 0.85;

                    const color = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity.toFixed(2)})`;
                    
                    // Halo muy suave para que las estrellas más grandes resalten levemente
                    if (this.size > 1.4) {
                        ctx.shadowBlur = 4;
                        ctx.shadowColor = `rgba(${this.rgb[0]}, ${this.rgb[1]}, ${this.rgb[2]}, ${opacity * 0.4})`;
                    }
                    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                }
                update() {
                    let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        let force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * this.density;
                        this.y -= (dy / distance) * force * this.density;
                    } else {
                        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) * 0.05;
                        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) * 0.05;
                    }
                    this.x += this.speedX; this.y += this.speedY;
                    if (this.x > canvas.width) { this.x = 0; this.baseX = 0; }
                    if (this.x < 0) { this.x = canvas.width; this.baseX = canvas.width; }
                    if (this.y > canvas.height) { this.y = 0; this.baseY = 0; }
                    if (this.y < 0) { this.y = canvas.height; this.baseY = canvas.height; }
                    this.draw();
                }
            }

            class ShootingStar {
                constructor() { this.reset(); }
                reset() {
                    this.x = Math.random() * canvas.width; this.y = 0; this.len = (Math.random() * 60) + 10;
                    this.speed = (Math.random() * 8) + 4; this.size = (Math.random() * 1) + 0.5;
                    // Frecuencia aumentada (espera de 0.5s a 3.5s en lugar de 1s a 7s)
                    this.waitTime = Date.now() + (Math.random() * 3000) + 500; this.active = false;
                }
                update() {
                    if (this.active) {
                        this.x += this.speed; this.y += this.speed * 0.5;
                        if (this.x > canvas.width || this.y > canvas.height) this.reset(); else this.draw();
                    } else {
                        if (Date.now() > this.waitTime) this.active = true;
                    }
                }
                draw() {
                    const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - (this.len * 0.5));
                    grad.addColorStop(0, `rgba(255, 255, 255, ${this.size})`); grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    ctx.strokeStyle = grad; ctx.lineWidth = this.size; ctx.beginPath();
                    ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - this.len, this.y - (this.len * 0.5)); ctx.stroke();
                }
            }

            function initCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                stars = []; shootingStars = [];
                // Densidad equilibrada (divisor 8000)
                let numStars = (canvas.height * canvas.width) / 8000; 
                for (let i = 0; i < numStars; i++) {
                    const rand = Math.random();
                    let rgb, baseOpacity;
                    if (rand < 0.4) {
                        // Blanco-azulado suave
                        rgb = [191, 219, 254];
                        baseOpacity = Math.random() * 0.25 + 0.45; // [0.45, 0.70]
                    } else if (rand < 0.85) {
                        // Azul suave
                        rgb = [96, 165, 250];
                        baseOpacity = Math.random() * 0.25 + 0.4; // [0.4, 0.65]
                    } else {
                        // Violeta/Púrpura muy suave
                        rgb = [168, 85, 247];
                        baseOpacity = Math.random() * 0.25 + 0.35; // [0.35, 0.60]
                    }
                    
                    // Tamaños corregidos un poco más pequeños [0.6, 2.1]
                    const size = Math.random() * 1.5 + 0.6;
                    stars.push(new Star(
                        Math.random() * canvas.width, 
                        Math.random() * canvas.height, 
                        (Math.random() * 0.2) - 0.1, 
                        (Math.random() * 0.2) - 0.1, 
                        size, 
                        rgb, 
                        baseOpacity
                    ));
                }
                // Más estrellas fugaces simultáneas (4 en vez de 2)
                for (let i = 0; i < 4; i++) shootingStars.push(new ShootingStar());
                
                giantMeteor = new GiantMeteor(canvas);
                maxGlowRadius = Math.max(canvas.width, canvas.height) * 0.6;
            }

            function animateCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for(let i=0; i<stars.length; i++) stars[i].update();
                
                // Dibujar constelaciones (líneas entre estrellas cercanas)
                for (let i = 0; i < stars.length; i++) {
                    for (let j = i + 1; j < stars.length; j++) {
                        let dx = stars[i].x - stars[j].x;
                        let dy = stars[i].y - stars[j].y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 95) {
                            let alpha = (1 - (distance / 95)) * 0.24;
                            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(stars[i].x, stars[i].y);
                            ctx.lineTo(stars[j].x, stars[j].y);
                            ctx.stroke();
                        }
                    }
                }

                // NUEVO: Dibujar constelación sutil conectada al cursor
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    for (let i = 0; i < stars.length; i++) {
                        let dx = stars[i].x - mouse.x;
                        let dy = stars[i].y - mouse.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < mouse.radius) {
                            let alpha = (1 - (distance / mouse.radius)) * 0.38;
                            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
                            ctx.lineWidth = 0.6;
                            ctx.beginPath();
                            ctx.moveTo(stars[i].x, stars[i].y);
                            ctx.lineTo(mouse.x, mouse.y);
                            ctx.stroke();
                        }
                    }
                }
                
                for(let i=0; i<shootingStars.length; i++) shootingStars[i].update();

                // Update and draw the welcome giant meteor
                if (giantMeteor && giantMeteor.active) {
                    giantMeteor.update(ctx, () => {
                        // Meteor is passing center - activate radial ambient glow
                        glowActive = true;
                        glowOpacity = 1.0;
                        glowRadius = 150; // Initial radius for central bloom
                        
                        // Sincronizar revelación del Hero (quitar blur, scale, opacity)
                        const heroWrapper = document.getElementById('hero-content-wrapper');
                        if (heroWrapper) {
                            heroWrapper.classList.remove('blur-md', 'scale-95', 'opacity-0');
                            heroWrapper.classList.add('blur-none', 'scale-100', 'opacity-100');
                        }
                    });
                }

                // Render the radial ambient glow centered on the screen
                if (glowActive) {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;

                    const radGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
                    radGlow.addColorStop(0, `rgba(59, 130, 246, ${glowOpacity * 0.28})`);
                    radGlow.addColorStop(0.4, `rgba(99, 102, 241, ${glowOpacity * 0.1})`);
                    radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    ctx.fillStyle = radGlow;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
                    ctx.fill();

                    // Expand and fade out the glow
                    glowRadius += (maxGlowRadius - glowRadius) * 0.038; // Slower expansion
                    glowOpacity -= 0.011; // Fades out in ~90 frames (approx 1.5s)

                    if (glowOpacity <= 0) {
                        glowActive = false;
                        glowOpacity = 0;
                    }
                }

                animationFrameId = requestAnimationFrame(animateCanvas); 
            }
            initCanvas(); animateCanvas();
        }

        // --- MODAL SCRIPT ---
        const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
        const modal = document.getElementById('project-modal');
        const modalContent = document.getElementById('modal-content');
        
        function openModal(trigger) {
            const data = trigger.dataset;
            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-subtitle').textContent = data.subtitle;
            const modalVideoEl = document.getElementById('modal-video');
            const modalVideoContainer = modalVideoEl.closest('.video-container');
            if (data.videoId) {
                modalVideoEl.src = `https://www.youtube.com/embed/${data.videoId}`;
                if (modalVideoContainer) modalVideoContainer.style.display = '';
            } else {
                modalVideoEl.src = '';
                if (modalVideoContainer) modalVideoContainer.style.display = 'none';
            }
            document.getElementById('modal-challenge').textContent = data.challenge;
            document.getElementById('modal-process').textContent = data.process;
            
            const techContainer = document.getElementById('modal-tech');
            techContainer.innerHTML = '';
            if (data.tech) {
                JSON.parse(data.tech.replace(/'/g, '"')).forEach(tech => {
                    const el = document.createElement('span');
                    el.className = 'bg-slate-900/60 border border-slate-800/80 text-gray-300 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-inner font-display';
                    el.textContent = tech;
                    techContainer.appendChild(el);
                });
            }

            // Enlaces rápidos (sitio web, app, etc.) — se muestran arriba, junto al título
            const linksTop = document.getElementById('modal-links-top');
            if (linksTop) {
                linksTop.innerHTML = '';
                let linkList = [];
                if (data.links) {
                    linkList = JSON.parse(data.links).map(link => ({
                        url: link.url,
                        label: (link.labelKey && translations[currentLang][link.labelKey]) || link.label || link.url
                    }));
                } else if (data.docUrl) {
                    linkList = [{ url: data.docUrl, label: data.docLabel || 'Ver Web del Proyecto' }];
                }
                if (linkList.length) {
                    linkList.forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.target = '_blank';
                        a.rel = 'noopener';
                        a.className = 'inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300';
                        a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg><span></span>';
                        a.querySelector('span').textContent = link.label;
                        linksTop.appendChild(a);
                    });
                    linksTop.classList.remove('hidden');
                } else {
                    linksTop.classList.add('hidden');
                }
            }

            const extraWrapper = document.getElementById('modal-extra-wrapper');
            if (extraWrapper) {
                if (data.extraImage) {
                    document.getElementById('modal-extra-img').src = data.extraImage;
                    document.getElementById('modal-extra-img').alt = data.extraCaption || '';
                    const captionKey = data.extraCaptionKey;
                    document.getElementById('modal-extra-caption').textContent =
                        (captionKey && translations[currentLang][captionKey]) || data.extraCaption || '';
                    extraWrapper.classList.remove('hidden');
                } else {
                    extraWrapper.classList.add('hidden');
                }
            }

            modal.classList.remove('pointer-events-none', 'opacity-0');
            modalContent.classList.remove('scale-95');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modalContent.classList.add('scale-95');
            setTimeout(() => {
                document.getElementById('modal-video').src = '';
                document.body.style.overflow = '';
            }, 300);
        }

        modalTriggers.forEach(t => t.addEventListener('click', () => openModal(t)));
        document.getElementById('modal-close-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

        // --- PERSONAL MODAL SCRIPT ---
        const personalModal = document.getElementById('personal-modal');
        const personalModalContent = document.getElementById('personal-modal-content');
        const openPersonalBtn = document.getElementById('open-personal-btn');
        const closePersonalBtn = document.getElementById('personal-modal-close-btn');

        function openPersonalModal() {
            personalModal.classList.remove('pointer-events-none', 'opacity-0');
            personalModalContent.classList.remove('scale-95');
            document.body.style.overflow = 'hidden';
        }

        function closePersonalModal() {
            personalModal.classList.add('opacity-0', 'pointer-events-none');
            personalModalContent.classList.add('scale-95');
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 300);
        }

        if (openPersonalBtn) {
            openPersonalBtn.addEventListener('click', openPersonalModal);
        }
        if (closePersonalBtn) {
            closePersonalBtn.addEventListener('click', closePersonalModal);
        }
        personalModal.addEventListener('click', e => { if (e.target === personalModal) closePersonalModal(); });

        document.addEventListener('keydown', e => { 
            if (e.key === 'Escape') {
                closeModal();
                closePersonalModal();
            }
        });

        // --- COPY EMAIL SCRIPT ---
        document.getElementById('copy-email-btn').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText("i.aguayo2212@gmail.com");
                const feedback = document.getElementById('copy-feedback');
                feedback.classList.remove('opacity-0');
                feedback.classList.add('-translate-y-2');
                setTimeout(() => { 
                    feedback.classList.add('opacity-0'); 
                    feedback.classList.remove('-translate-y-2');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy', err);
            }
        });

        // --- SUPERNOVA EASTER EGG ---
        document.getElementById('destroy-btn').addEventListener('click', () => {
            document.body.style.overflow = 'hidden';
            document.getElementById('destroy-btn').style.display = 'none';
            const core = document.getElementById('supernova-core');
            core.classList.remove('hidden');
            
            const els = document.querySelectorAll('header, main > section');
            const vCX = window.innerWidth / 2;
            const vCY = window.innerHeight / 2;

            els.forEach((el, i) => {
                const rect = el.getBoundingClientRect();
                const mX = (rect.left + rect.width / 2 - vCX) * 3;
                const mY = (rect.top + rect.height / 2 - vCY) * 3;
                
                el.style.transition = `all 1.5s ease-in-out ${i * 100}ms`;
                el.style.transformOrigin = 'center center';
                setTimeout(() => {
                    el.style.transform = `translateX(${mX}px) translateY(${mY}px) scale(0.5) rotate(${(Math.random()-0.5)*360}deg)`;
                    el.style.opacity = '0';
                }, 50);
            });
            
            const animTime = els.length * 100 + 1500;

            setTimeout(() => {
                core.style.transition = 'all 0.5s ease-in';
                core.style.width = `${Math.max(window.innerWidth, window.innerHeight) * 3}px`;
                core.style.height = core.style.width;
                core.style.opacity = '0';
                document.body.style.transition = 'background-color 0.5s ease-in';
                document.body.style.backgroundColor = '#ffffff';
            }, animTime - 500);

            setTimeout(() => {
                const overlay = document.getElementById('reset-overlay');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.style.opacity = '1', 10);
            }, animTime); 
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            sessionStorage.setItem('isRecreating', 'true');
            location.reload();
        });

        // Function to trigger welcome animation (giant meteor crossing)
        function triggerWelcomeAnimation() {
            setTimeout(() => {
                if (giantMeteor) {
                    giantMeteor.start();
                } else {
                    // Sin starfield (reduced motion): revelar el hero de inmediato
                    const heroWrapper = document.getElementById('hero-content-wrapper');
                    if (heroWrapper) {
                        heroWrapper.classList.remove('blur-md', 'scale-95', 'opacity-0');
                        heroWrapper.classList.add('blur-none', 'scale-100', 'opacity-100');
                    }
                }
            }, 300);

            // Respaldo: si la animación no se completa (pestaña en segundo plano,
            // canvas no disponible, etc.), revelar el hero de todas formas.
            setTimeout(() => {
                const heroWrapper = document.getElementById('hero-content-wrapper');
                if (heroWrapper && heroWrapper.classList.contains('opacity-0')) {
                    heroWrapper.classList.remove('blur-md', 'scale-95', 'opacity-0');
                    heroWrapper.classList.add('blur-none', 'scale-100', 'opacity-100');
                }
            }, 4000);
        }

        // Initial Load
        window.addEventListener('load', () => {
            if (sessionStorage.getItem('isRecreating') === 'true') {
                sessionStorage.removeItem('isRecreating');
                const bb = document.createElement('div');
                bb.style.cssText = 'position:fixed;inset:0;background:black;z-index:9999';
                document.body.appendChild(bb);
                
                const s = document.createElement('div');
                s.style.cssText = 'position:fixed;top:50%;left:50%;width:1px;height:1px;background:white;border-radius:50%;transform:translate(-50%,-50%);transition:all 0.5s ease-in';
                bb.appendChild(s);
                
                setTimeout(() => {
                    s.style.width = s.style.height = `${Math.max(window.innerWidth, window.innerHeight) * 3}px`;
                }, 50);

                setTimeout(() => {
                    bb.style.transition = 'opacity 1s ease-out';
                    bb.style.opacity = '0';
                    document.body.classList.remove('opacity-0');
                    triggerWelcomeAnimation();
                }, 550);

                setTimeout(() => bb.remove(), 1550);
            } else {
                document.body.classList.remove('opacity-0');
                triggerWelcomeAnimation();
            }
        });
