// Experiencias AR por marcador.
// Sistema de coordenadas del anchor (MindAR): el marcador vive en el plano XY,
// mide 1 unidad de ancho, centro en (0,0) y +Z apunta hacia quien mira.
import * as THREE from 'three';

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ──────────────────────────── 01 · BALLENA (portal) ──────────────────────────── */
export function buildWhale(anchorRoot, opts = {}) {
  // opts.portal = { x, y, ry } en unidades del marcador (ancho = 1). Todo se diseña para un
  // portal de referencia (ry = 0.18, proporción 1.61:1) y luego se escala para calzar con el dibujo.
  const P = opts.portal || { x: 0, y: -0.039, ry: 0.18 };
  const root = new THREE.Group();
  root.position.set(P.x, P.y, 0);
  root.scale.setScalar(P.ry / 0.18);
  anchorRoot.add(root);
  const HOLE = { x: 0, y: 0, rx: 0.29, ry: 0.18 };
  const DEPTH = 1.8;

  // 1) Oclusor: plano invisible con un agujero ovalado. Escribe profundidad pero no color,
  //    así todo lo que está "detrás" del marcador solo se ve a través del agujero.
  const shape = new THREE.Shape();
  shape.moveTo(-4, -4); shape.lineTo(4, -4); shape.lineTo(4, 4); shape.lineTo(-4, 4); shape.lineTo(-4, -4);
  const hole = new THREE.Path();
  hole.absellipse(HOLE.x, HOLE.y, HOLE.rx, HOLE.ry, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const occluder = new THREE.Mesh(new THREE.ShapeGeometry(shape, 64), new THREE.MeshBasicMaterial({ colorWrite: false }));
  occluder.renderOrder = -1;
  root.add(occluder);

  // 2) Túnel de océano hacia adentro de la proyección
  const tunnelMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
      varying vec3 vP; uniform float uTime;
      void main(){
        float d = clamp(-vP.z / ${DEPTH.toFixed(2)}, 0., 1.);          // 0 = boca, 1 = fondo
        vec3 shallow = vec3(0.10,0.62,0.78), deep = vec3(0.01,0.04,0.10);
        vec3 col = mix(shallow, deep, pow(d, .55));
        float a = atan(vP.y, vP.x);
        float caust = sin(a*9. + uTime*1.3 + vP.z*14.) * sin(a*5. - uTime*.9 - vP.z*9.);
        col += vec3(.25,.55,.6) * smoothstep(.55,1.,caust) * (1.-d) * .6;
        gl_FragColor = vec4(col,1.);
      }`
  });
  const tunnelGeo = new THREE.CylinderGeometry(1, 1, DEPTH, 64, 12, true);
  tunnelGeo.rotateX(Math.PI / 2);                 // eje del cilindro → Z
  tunnelGeo.translate(0, 0, -DEPTH / 2);
  const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
  tunnel.scale.set(HOLE.rx, HOLE.ry, 1);
  tunnel.position.set(HOLE.x, HOLE.y, 0);
  root.add(tunnel);
  const back = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x02070f }));
  back.scale.set(HOLE.rx, HOLE.ry, 1); back.position.set(HOLE.x, HOLE.y, -DEPTH + 0.001);
  root.add(back);

  // borde luminoso del portal
  const rim = new THREE.Mesh(
    new THREE.RingGeometry(1, 1.06, 96),
    new THREE.MeshBasicMaterial({ color: 0x8ff3ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  rim.scale.set(HOLE.rx, HOLE.ry, 1); rim.position.set(HOLE.x, HOLE.y, 0.002);
  root.add(rim);

  // 3) Ballena low-poly
  const whale = makeWhale();
  root.add(whale.group);

  // 4) Recorrido: sale del fondo, cruza el portal, da una vuelta frente a la gente y se vuelve a meter
  const H = new THREE.Vector3(HOLE.x, HOLE.y, 0);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -1.7).add(H),
    new THREE.Vector3(0, 0, -0.8).add(H),
    new THREE.Vector3(0, 0.01, -0.15).add(H),
    new THREE.Vector3(0, 0.08, 0.2).add(H),        // sale del portal hacia la gente
    new THREE.Vector3(-0.24, 0.25, 0.34).add(H),    // sube por la izquierda
    new THREE.Vector3(0.02, 0.4, 0.4).add(H),     // cruza por arriba (de perfil)
    new THREE.Vector3(0.3, 0.22, 0.36).add(H),    // baja por la derecha
    new THREE.Vector3(0.24, -0.06, 0.28).add(H),
    new THREE.Vector3(0.08, -0.06, 0.15).add(H),
    new THREE.Vector3(0, 0, -0.05).add(H),         // se vuelve a meter
    new THREE.Vector3(0, -0.01, -0.9).add(H),
    new THREE.Vector3(0, 0, -1.7).add(H),
  ], false, 'catmullrom', 0.5);

  const fx = makeSplashFX(root, H);
  const bubbles = makeBubbles(root, H, HOLE);

  // Reparte el tiempo: lo de adentro pasa rápido y la vuelta afuera dura ~65% del ciclo
  let uOut = 0, uIn = 1;
  for (let i = 1, prev = -1; i <= 400; i++) {
    const z = path.getPointAt(i / 400).z - H.z;
    if (prev < 0 && z >= 0 && !uOut) uOut = i / 400;
    if (prev > 0 && z <= 0) uIn = i / 400;
    prev = z;
  }
  const warp = (u) => {
    const ease = (x) => x * x * (3 - 2 * x);
    if (u < 0.2) return ease(u / 0.2) * uOut;
    if (u < 0.85) return uOut + ((u - 0.2) / 0.65) * (uIn - uOut);
    return uIn + ease((u - 0.85) / 0.15) * (1 - uIn);
  };
  const PERIOD = 12, PAUSE = 1.0;
  let t0 = 0, prevZ = -9;
  const m = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0), next = new THREE.Vector3();

  return {
    onFound() { t0 = performance.now() / 1000; prevZ = -9; },
    update(t, dt) {
      tunnelMat.uniforms.uTime.value = t;
      rim.material.opacity = 0.45 + 0.15 * Math.sin(t * 2.2);
      const local = t - t0;
      const cyc = local % (PERIOD + PAUSE);
      const u = Math.min(1, Math.max(0, (cyc - PAUSE) / PERIOD));
      const e = warp(u);
      const p = path.getPointAt(e);
      path.getPointAt(Math.min(1, e + 0.004), next);
      if (next.distanceToSquared(p) < 1e-10) next.copy(p).add(new THREE.Vector3(0, 0, -1));
      whale.group.position.copy(p);
      m.lookAt(next, p, up);
      whale.group.quaternion.setFromRotationMatrix(m);
      whale.group.rotateZ(Math.sin(local * 0.9) * 0.18);       // pequeño "banking"
      const vis = smooth(-1.65, -0.95, p.z - H.z);             // aparece desde la oscuridad
      whale.group.scale.setScalar(0.7 * Math.max(0.001, vis));
      whale.animate(t);
      if ((prevZ < 0 && p.z >= 0) || (prevZ > 0 && p.z <= 0)) fx.burst();
      prevZ = p.z;
      fx.update(dt);
      bubbles.update(dt);
    }
  };
}

function makeWhale() {
  const group = new THREE.Group();
  const top = new THREE.Color(0x1d3a57), belly = new THREE.Color(0xd9e6ee);
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7, metalness: 0.05 });

  const lathe = (pts) => {
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 14);
    g.rotateX(Math.PI / 2);      // largo del cuerpo → +Z (cabeza adelante)
    g.scale(1, 0.82, 1);
    const pos = g.attributes.position, col = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i), z = pos.getZ(i);
      let k = smooth(-0.05, 0.08, y);
      // surcos ventrales tipo jorobada
      if (y < -0.02 && z > 0.05 && Math.sin(pos.getX(i) * 140) > 0.2) k = 0.15;
      c.copy(belly).lerp(top, k); col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  };

  // cuerpo delantero (cabeza a +0.5)
  const front = new THREE.Mesh(lathe([[0.0, -0.12], [0.165, -0.1], [0.19, 0.05], [0.185, 0.18], [0.15, 0.32], [0.09, 0.44], [0.03, 0.5], [0, 0.505]]), mat);
  group.add(front);

  // cola articulada
  const tailPivot = new THREE.Group(); tailPivot.position.z = -0.1; group.add(tailPivot);
  const tail = new THREE.Mesh(lathe([[0, -0.42], [0.03, -0.4], [0.06, -0.3], [0.11, -0.15], [0.165, 0.0], [0, 0.0]]), mat);
  tailPivot.add(tail);
  const flukePivot = new THREE.Group(); flukePivot.position.z = -0.4; tailPivot.add(flukePivot);
  const fs = new THREE.Shape();
  fs.moveTo(0, 0); fs.bezierCurveTo(0.08, 0.02, 0.2, 0.06, 0.26, 0.16);
  fs.bezierCurveTo(0.17, 0.12, 0.08, 0.12, 0, 0.07);
  fs.bezierCurveTo(-0.08, 0.12, -0.17, 0.12, -0.26, 0.16);
  fs.bezierCurveTo(-0.2, 0.06, -0.08, 0.02, 0, 0);
  const flukeGeo = new THREE.ShapeGeometry(fs, 8); flukeGeo.rotateX(-Math.PI / 2);
  const finMat = new THREE.MeshStandardMaterial({ color: top, flatShading: true, side: THREE.DoubleSide, roughness: 0.8 });
  flukePivot.add(new THREE.Mesh(flukeGeo, finMat));

  // aletas pectorales largas (jorobada)
  const ps = new THREE.Shape();
  ps.moveTo(0, 0); ps.bezierCurveTo(0.05, -0.02, 0.3, -0.05, 0.42, -0.1);
  ps.bezierCurveTo(0.3, -0.1, 0.1, -0.08, 0, -0.07); ps.lineTo(0, 0);
  const pg = new THREE.ShapeGeometry(ps, 6); pg.rotateX(-Math.PI / 2);
  const finR = new THREE.Mesh(pg, finMat), finL = new THREE.Mesh(pg, finMat);
  finR.position.set(0.15, -0.08, 0.22); finL.position.set(-0.15, -0.08, 0.22); finL.scale.x = -1;
  group.add(finR, finL);

  // ojos
  const eyeGeo = new THREE.SphereGeometry(0.014, 8, 6), eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const eR = new THREE.Mesh(eyeGeo, eyeMat), eL = new THREE.Mesh(eyeGeo, eyeMat);
  eR.position.set(0.135, -0.025, 0.36); eL.position.set(-0.135, -0.025, 0.36); group.add(eR, eL);

  group.traverse(o => { if (o.isMesh) o.renderOrder = 2; });

  return {
    group,
    animate(t) {
      const w = t * 3.6;
      tailPivot.rotation.x = Math.sin(w) * 0.28;
      flukePivot.rotation.x = Math.sin(w - 0.9) * 0.45;
      front.rotation.x = Math.sin(w + Math.PI) * 0.05;
      finR.rotation.z = -0.35 + Math.sin(t * 1.4) * 0.25;
      finL.rotation.z = 0.35 - Math.sin(t * 1.4) * 0.25;
      finR.rotation.y = 0.5; finL.rotation.y = -0.5;
    }
  };
}

function makeSplashFX(root, center) {
  const rings = [];
  const ringGeo = new THREE.RingGeometry(0.9, 1, 64);
  const N = 140;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xbff8ff, size: 0.018, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat); pts.renderOrder = 3; root.add(pts);
  let life = 0;
  return {
    burst() {
      for (let i = 0; i < 2; i++) {
        const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xbff8ff, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
        r.position.copy(center).setZ(0.004); r.scale.setScalar(0.2); r.userData.t = -i * 0.18; r.renderOrder = 3;
        root.add(r); rings.push(r);
      }
      for (let i = 0; i < N; i++) {
        const a = Math.random() * Math.PI * 2, s = 0.25 + Math.random() * 0.7;
        pos[i * 3] = center.x + Math.cos(a) * 0.2; pos[i * 3 + 1] = center.y + Math.sin(a) * 0.12; pos[i * 3 + 2] = 0.01;
        vel[i * 3] = Math.cos(a) * s * 0.5; vel[i * 3 + 1] = Math.sin(a) * s * 0.5 + 0.2; vel[i * 3 + 2] = 0.3 + Math.random() * 0.8;
      }
      life = 1;
    },
    update(dt) {
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; r.userData.t += dt;
        const k = Math.max(0, r.userData.t);
        r.scale.set(0.3 + k * 0.45, 0.19 + k * 0.28, 1);
        r.material.opacity = Math.max(0, 0.8 - k * 0.9);
        if (k > 1) { root.remove(r); r.material.dispose(); rings.splice(i, 1); }
      }
      if (life > 0) {
        life -= dt * 0.8;
        for (let i = 0; i < N; i++) {
          vel[i * 3 + 1] -= dt * 0.9;
          pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = Math.max(0, life);
      }
    }
  };
}

function makeBubbles(root, center, hole) {
  const N = 60, pos = new Float32Array(N * 3), spd = new Float32Array(N);
  const reset = (i, z) => {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.85;
    pos[i * 3] = center.x + Math.cos(a) * hole.rx * r;
    pos[i * 3 + 1] = center.y + Math.sin(a) * hole.ry * r;
    pos[i * 3 + 2] = z ?? -1.2 - Math.random() * 0.4;
    spd[i] = 0.12 + Math.random() * 0.25;
  };
  for (let i = 0; i < N; i++) reset(i, -1.5 + Math.random() * 2.2);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xdffbff, size: 0.012, transparent: true, opacity: 0.7, depthWrite: false });
  const pts = new THREE.Points(geo, mat); pts.renderOrder = 1; root.add(pts);
  return {
    update(dt) {
      for (let i = 0; i < N; i++) {
        pos[i * 3 + 2] += spd[i] * dt;
        pos[i * 3 + 1] += Math.sin(pos[i * 3 + 2] * 9 + i) * 0.0008 + (pos[i * 3 + 2] > 0 ? dt * 0.12 : 0);
        if (pos[i * 3 + 2] > 0.8) reset(i);
      }
      geo.attributes.position.needsUpdate = true;
    }
  };
}

/* ──────────────────────────── 02 · MEDUSAS (partículas) ──────────────────────────── */
export function buildJellies(root, opts = {}) {
  const A = opts.aspect ?? 1;          // alto/ancho del marcador
  const jellies = [];
  const colors = [0x00c4cc, 0x8ff3ff, 0xff7ad9, 0xb69cff, 0x00c4cc];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const bell = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: colors[i], emissive: colors[i], emissiveIntensity: 0.8, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
    );
    bell.rotation.x = Math.PI / 2;   // la campana mira hacia +Z (hacia la gente)
    g.add(bell);
    const tentacles = [];
    for (let k = 0; k < 7; k++) {
      const pts = Array.from({ length: 10 }, () => new THREE.Vector3());
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: colors[i], transparent: true, opacity: 0.7 }));
      line.userData.a = (k / 7) * Math.PI * 2; tentacles.push(line); g.add(line);
    }
    g.userData = { tentacles, bell, ph: Math.random() * 10, x: (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 0.8 * A, sp: 0.06 + Math.random() * 0.05 };
    root.add(g); jellies.push(g);
  }
  const N = 300, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 1.4; pos[i * 3 + 1] = (Math.random() - 0.5) * 1.4 * A; pos[i * 3 + 2] = Math.random() * 0.9; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8ff3ff, size: 0.008, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(dust);

  return {
    update(t, dt) {
      for (const g of jellies) {
        const d = g.userData, ph = t * 1.6 + d.ph;
        const pulse = 1 + Math.sin(ph) * 0.18;
        d.bell.scale.set(pulse, pulse, 1 / pulse);
        const z = ((t * d.sp + d.ph) % 1) * 0.9 + 0.02;
        g.position.set(d.x + Math.sin(t * 0.4 + d.ph) * 0.06, d.y + Math.cos(t * 0.3 + d.ph) * 0.06, z);
        g.scale.setScalar(smooth(0, 0.12, z) * (1 - smooth(0.8, 0.92, z)) + 0.001);
        for (const line of d.tentacles) {
          const arr = line.geometry.attributes.position.array, a = line.userData.a;
          for (let j = 0; j < 10; j++) {
            const s = j / 9, r = 0.055 * pulse * (1 - s * 0.4);
            arr[j * 3] = Math.cos(a) * r + Math.sin(ph - s * 4 + a) * 0.012 * s;
            arr[j * 3 + 1] = Math.sin(a) * r + Math.cos(ph - s * 4) * 0.012 * s;
            arr[j * 3 + 2] = -s * 0.22;
          }
          line.geometry.attributes.position.needsUpdate = true;
        }
      }
      for (let i = 0; i < N; i++) { pos[i * 3 + 2] += dt * 0.03; if (pos[i * 3 + 2] > 0.9) pos[i * 3 + 2] = 0; }
      geo.attributes.position.needsUpdate = true;
    }
  };
}

/* ──────────────────────────── 03 · CALIBRACIÓN (estabilidad) ──────────────────────────── */
export function buildCalib(root, opts = {}) {
  const h = (opts.aspect ?? 1) / 2;
  const frame = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([[-.5, -h], [.5, -h], [.5, h], [-.5, h]].map(([x, y]) => new THREE.Vector3(x, y, 0.001))),
    new THREE.LineBasicMaterial({ color: 0x00ff88 })
  );
  root.add(frame);
  const grid = new THREE.GridHelper(1, 8, 0x00ff88, 0x00aa66); grid.rotation.x = Math.PI / 2; grid.scale.z = h * 2; grid.material.transparent = true; grid.material.opacity = 0.35;
  root.add(grid);
  root.add(new THREE.AxesHelper(0.35));
  const colors = [0xE2572B, 0xF5DC00, 0x00C4CC];
  colors.forEach((c, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), new THREE.MeshStandardMaterial({ color: c, flatShading: true }));
    b.position.set(0, 0, 0.08 + i * 0.16); root.add(b);
  });
  const corners = [[-.5, -h], [.5, -h], [.5, h], [-.5, h]].map(([x, y]) => {
    const p = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    p.rotation.x = Math.PI / 2; p.position.set(x, y, 0.06); root.add(p); return p;
  });
  const top = root.children[root.children.length - 5];
  return { update(t) { top.rotation.z = t * 0.8; corners.forEach((c, i) => c.scale.setScalar(1 + 0.15 * Math.sin(t * 3 + i))); } };
}
