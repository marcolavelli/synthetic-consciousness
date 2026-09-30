/**
 * STATO EMOTIVO DELL'INTELLIGENZA ARTIFICIALE
 * Based on Robert Plutchik's Wheel of Emotions & Dataset emotions.jsonl
 */

// ============================================================================
// 1. DATASET MANAGEMENT & PLUTCHIK MAPPINGS
// ============================================================================

const PLUTCHIK_PRIMARIES = {
  gioia: {
    it: "Gioia",
    en: "Joy",
    angle: 90,
    color: "#FACC15",
    glow: "#FEF08A",
    core: "#713F12",
    opposite: "tristezza",
    opposite_it: "Tristezza",
    physics: { speed: 1.5, density: 1.25, displacement: 0.38, spikiness: 1.0, droop: -0.15, scale: 1.12, particleSpeed: 1.4, particleSpread: 1.25, audioFreq: 396, audioMod: 4.0 }
  },
  fiducia: {
    it: "Fiducia",
    en: "Trust",
    angle: 45,
    color: "#22C55E",
    glow: "#86EFAC",
    core: "#14532D",
    opposite: "disgusto",
    opposite_it: "Disgusto",
    physics: { speed: 0.85, density: 1.05, displacement: 0.25, spikiness: 1.0, droop: 0.0, scale: 1.04, particleSpeed: 0.8, particleSpread: 1.0, audioFreq: 528, audioMod: 2.0 }
  },
  paura: {
    it: "Paura",
    en: "Fear",
    angle: 0,
    color: "#8B5CF6",
    glow: "#C4B5FD",
    core: "#2E1065",
    opposite: "rabbia",
    opposite_it: "Rabbia",
    physics: { speed: 2.6, density: 3.4, displacement: 0.35, spikiness: 1.9, droop: 0.0, scale: 0.84, particleSpeed: 2.2, particleSpread: 0.85, audioFreq: 174, audioMod: 8.5 }
  },
  sorpresa: {
    it: "Sorpresa",
    en: "Surprise",
    angle: 315,
    color: "#06B6D4",
    glow: "#67E8F9",
    core: "#164E63",
    opposite: "anticipazione",
    opposite_it: "Anticipazione",
    physics: { speed: 2.0, density: 1.6, displacement: 0.52, spikiness: 1.2, droop: 0.0, scale: 1.24, particleSpeed: 1.8, particleSpread: 1.5, audioFreq: 639, audioMod: 6.0 }
  },
  tristezza: {
    it: "Tristezza",
    en: "Sadness",
    angle: 270,
    color: "#2563EB",
    glow: "#60A5FA",
    core: "#0F172A",
    opposite: "gioia",
    opposite_it: "Gioia",
    physics: { speed: 0.42, density: 0.85, displacement: 0.24, spikiness: 1.0, droop: 0.65, scale: 0.88, particleSpeed: 0.4, particleSpread: 0.75, audioFreq: 147, audioMod: 1.0 }
  },
  disgusto: {
    it: "Disgusto",
    en: "Disgust",
    angle: 225,
    color: "#A855F7",
    glow: "#D8B4FE",
    core: "#3B0764",
    opposite: "fiducia",
    opposite_it: "Fiducia",
    physics: { speed: 1.25, density: 2.6, displacement: 0.46, spikiness: 2.4, droop: 0.15, scale: 0.95, particleSpeed: 1.1, particleSpread: 0.9, audioFreq: 210, audioMod: 3.2 }
  },
  rabbia: {
    it: "Rabbia",
    en: "Anger",
    angle: 180,
    color: "#EF4444",
    glow: "#FCA5A5",
    core: "#450A0A",
    opposite: "paura",
    opposite_it: "Paura",
    physics: { speed: 2.9, density: 2.3, displacement: 0.62, spikiness: 3.2, droop: 0.0, scale: 1.18, particleSpeed: 2.6, particleSpread: 1.7, audioFreq: 110, audioMod: 9.0 }
  },
  anticipazione: {
    it: "Anticipazione",
    en: "Anticipation",
    angle: 135,
    color: "#F97316",
    glow: "#FDBA74",
    core: "#7C2D12",
    opposite: "sorpresa",
    opposite_it: "Sorpresa",
    physics: { speed: 1.6, density: 1.95, displacement: 0.38, spikiness: 1.1, droop: -0.05, scale: 1.06, particleSpeed: 1.5, particleSpread: 1.2, audioFreq: 432, audioMod: 5.0 }
  }
};

// Global state
let emotionsDataset = [];
let activeEmotion = null;

// Neutral/Dormant state
const DORMANT_STATE = {
  termine_originale: "Vuoto Primordiale",
  lingua_cultura: "Origine Sintetica",
  famiglia_emotiva: "Equilibrio Silente",
  significato_italiano: "L'entità sintetica si trova in una quiete primordiale. In attesa di uno stimolo emotivo umano per polarizzarsi e assumere forma.",
  valenza: "neutra",
  arousal: "basso",
  modello_fonte: "Stato Basale dell'Entità",
  plutchik: {
    primary: "fiducia",
    primary_it: "Quiete",
    secondary: null,
    secondary_it: null,
    weights: { fiducia: 0.5, gioia: 0.5 },
    color: "#6366f1",
    glow: "#818cf8",
    core: "#111827",
    angle: 0,
    physics: { speed: 0.55, density: 1.05, displacement: 0.20, spikiness: 1.0, droop: 0.0, scale: 1.0, particleSpeed: 0.7, particleSpread: 1.0, audioFreq: 130, audioMod: 1.5 }
  }
};

/**
 * Load dataset from emotions.jsonl or fallback to window.EMOTIONS_DATA
 */
async function loadDataset() {
  try {
    const res = await fetch('emotions.jsonl');
    if (!res.ok) throw new Error("Fetch failed: " + res.status);
    const text = await res.text();
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
    const parsed = lines.map(line => JSON.parse(line));
    
    if (window.EMOTIONS_DATA && window.EMOTIONS_DATA.length === parsed.length) {
      emotionsDataset = window.EMOTIONS_DATA;
    } else {
      emotionsDataset = enrichRawDataset(parsed);
    }
  } catch (err) {
    console.warn("Caricamento diretto da fetch non riuscito, uso fallback locale:", err);
    if (window.EMOTIONS_DATA && window.EMOTIONS_DATA.length > 0) {
      emotionsDataset = window.EMOTIONS_DATA;
    }
  }

  const badgeCount = document.getElementById('dataset-count');
  if (badgeCount) badgeCount.textContent = `${emotionsDataset.length} Emozioni`;
  
  applyEmotion(DORMANT_STATE, false);
  populateCatalog();
}

function enrichRawDataset(rawList) {
  return rawList.map(item => {
    if (item.plutchik) return item;
    const t = item.termine_originale.toLowerCase();
    let prim = "gioia";
    if (t.includes("sad") || t.includes("trist")) prim = "tristezza";
    else if (t.includes("fear") || t.includes("paur")) prim = "paura";
    else if (t.includes("ang") || t.includes("rabb")) prim = "rabbia";
    else if (t.includes("disg")) prim = "disgusto";
    else if (t.includes("surp") || t.includes("sorp")) prim = "sorpresa";
    else if (t.includes("trust") || t.includes("fidu")) prim = "fiducia";
    else if (t.includes("antic")) prim = "anticipazione";

    const pk = PLUTCHIK_PRIMARIES[prim];
    return {
      ...item,
      plutchik: {
        primary: prim,
        primary_it: pk.it,
        secondary: null,
        secondary_it: null,
        weights: { [prim]: 1.0 },
        color: pk.color,
        glow: pk.glow,
        core: pk.core,
        angle: pk.angle,
        physics: { ...pk.physics }
      }
    };
  });
}

// ============================================================================
// 2. THREE.JS ADVANCED SHADER ENGINE (IMPROVED GRAPHICS & COMPACT SCALE)
// ============================================================================

let scene, camera, renderer;
let entityMesh, auraMesh, particles;
let shockwaveImpulse = 0;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

// High-fidelity GLSL Vertex Shader with Domain Warped 3D Simplex Noise
const vertexShader = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

uniform float u_time;
uniform float u_speed;
uniform float u_density;
uniform float u_displacement;
uniform float u_spikiness;
uniform float u_droop;
uniform float u_scale;
uniform float u_shockwave;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  vec3 pos = position;
  float t = u_time * u_speed;
  
  // Domain Warping for fluid, smoky, organic swirls
  vec3 warp = vec3(
    snoise(pos * 0.9 + vec3(0.0, t * 0.4, 0.0)),
    snoise(pos * 0.9 + vec3(4.3, 1.2, t * 0.4)),
    snoise(pos * 0.9 + vec3(1.1, t * 0.4, 3.2))
  );

  // Multi-frequency noise
  float n1 = snoise(pos * u_density + warp * 0.65 + vec3(0.0, t * 0.65, t * 0.35));
  float n2 = snoise(pos * (u_density * 2.1) - warp * 0.4 - vec3(t * 0.8, 0.0, t * 0.45)) * 0.42;
  float totalNoise = n1 + n2;
  
  // Dynamic spikiness
  float signN = sign(totalNoise);
  float shapedNoise = signN * pow(abs(totalNoise), u_spikiness);
  
  // Gravitational teardrop droop (sadness)
  float droopOffset = max(-pos.y, 0.0) * u_droop * 0.55;
  
  // Shockwave ring pulse
  float shock = sin(length(pos) * 6.0 - u_time * 9.0) * u_shockwave * 0.32;
  
  // Displaced vertex position
  float disp = (shapedNoise * u_displacement) + shock;
  vec3 newPosition = pos + normal * disp;
  newPosition.y -= droopOffset;
  newPosition *= u_scale;
  
  vNormal = normalize(normalMatrix * normal);
  vPosition = newPosition;
  vNoise = totalNoise;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Fragment Shader with Prismatic Chromatic Dispersion & Subsurface Glow
const fragmentShader = `
uniform vec3 u_color_core;
uniform vec3 u_color_glow;
uniform vec3 u_color_rim;
uniform float u_time;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vNoise;
varying vec3 vViewPosition;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  
  float NdotV = max(dot(normal, viewDir), 0.0);
  
  // Multi-band chromatic dispersion on rim
  float fresnelR = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.4);
  float fresnelG = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.9);
  float fresnelB = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);
  vec3 chromaticRim = vec3(fresnelR, fresnelG, fresnelB) * u_color_rim * 1.5;

  // Ultra-deep obsidian base
  vec3 obsidianBase = vec3(0.012, 0.012, 0.018);
  
  // Bioluminescent core veins
  float veinMap = smoothstep(-0.25, 0.65, vNoise);
  vec3 internalPlasma = mix(u_color_core, u_color_glow, veinMap);
  
  // Soft breathing pulse
  float breathing = sin(u_time * 2.2) * 0.08 + 0.92;
  
  // Specular sheen
  vec3 halfDir = normalize(viewDir + vec3(0.2, 0.8, 0.5));
  float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 0.35;
  
  // Final compositing
  vec3 finalColor = mix(obsidianBase, internalPlasma, (1.0 - NdotV) * 0.7 + max(vNoise * 0.35, 0.0));
  finalColor += chromaticRim * breathing;
  finalColor += u_color_glow * spec;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Translucent Outer Halo
const auraVertexShader = `
uniform float u_time;
uniform float u_speed;
uniform float u_scale;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec3 pos = position * (u_scale * 1.14);
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const auraFragmentShader = `
uniform vec3 u_color_rim;
uniform float u_time;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
  fresnel = pow(fresnel, 4.2);
  
  float wave = sin(u_time * 1.8) * 0.2 + 0.8;
  vec3 col = u_color_rim * fresnel * 1.3 * wave;
  gl_FragColor = vec4(col, fresnel * 0.38);
}
`;

// Uniforms
const shaderUniforms = {
  u_time: { value: 0 },
  u_speed: { value: 0.55 },
  u_density: { value: 1.05 },
  u_displacement: { value: 0.20 },
  u_spikiness: { value: 1.0 },
  u_droop: { value: 0.0 },
  u_scale: { value: 1.0 },
  u_shockwave: { value: 0.0 },
  u_color_core: { value: new THREE.Color("#111827") },
  u_color_glow: { value: new THREE.Color("#818cf8") },
  u_color_rim: { value: new THREE.Color("#6366f1") }
};

const auraUniforms = {
  u_time: { value: 0 },
  u_speed: { value: 0.55 },
  u_scale: { value: 1.0 },
  u_color_rim: { value: new THREE.Color("#6366f1") }
};

const targets = {
  speed: 0.55,
  density: 1.05,
  displacement: 0.20,
  spikiness: 1.0,
  droop: 0.0,
  scale: 1.0,
  particleSpeed: 0.7,
  particleSpread: 1.0,
  colorCore: new THREE.Color("#111827"),
  colorGlow: new THREE.Color("#818cf8"),
  colorRim: new THREE.Color("#6366f1")
};

let currentParticleSpeed = 0.7;

function initThree() {
  const canvas = document.getElementById('webgl-canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030306, 0.09);

  // Positioned camera with perfect framing for compact entity
  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.z = 6.4;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. Central Compact Entity (Radius 1.45 instead of 2.1)
  const geometry = new THREE.IcosahedronGeometry(1.45, 80);
  const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: shaderUniforms
  });
  entityMesh = new THREE.Mesh(geometry, material);
  scene.add(entityMesh);

  // 2. Translucent Ethereal Aura
  const auraGeo = new THREE.IcosahedronGeometry(1.45, 36);
  const auraMat = new THREE.ShaderMaterial({
    vertexShader: auraVertexShader,
    fragmentShader: auraFragmentShader,
    uniforms: auraUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
  auraMesh = new THREE.Mesh(auraGeo, auraMat);
  scene.add(auraMesh);

  // 3. Orbiting Particles Swarm
  initParticles();

  // 4. Background cosmic dust
  initCosmicDust();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  canvas.addEventListener('click', triggerShockwave);

  animate();
}

function initParticles() {
  const particleCount = 1600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);
  const angles = new Float32Array(particleCount);
  const radiuses = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);
  const yOffsets = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Tighter, refined orbit around compact entity (radius ~1.7 - 3.4)
    const radius = 1.7 + Math.random() * 2.3;
    const y = (Math.random() - 0.5) * 2.6;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    scales[i] = Math.random() * 2.2 + 0.8;
    angles[i] = angle;
    radiuses[i] = radius;
    speeds[i] = (Math.random() * 0.55 + 0.35) * (Math.random() < 0.5 ? 1 : -1);
    yOffsets[i] = (Math.random() - 0.5) * 0.6;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  geometry.userData = { angles, radiuses, speeds, yOffsets };

  // Soft glowing particle circle texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pctx = pCanvas.getContext('2d');
  const grad = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  pctx.fillStyle = grad;
  pctx.beginPath();
  pctx.arc(16, 16, 16, 0, Math.PI * 2);
  pctx.fill();

  const particleTexture = new THREE.CanvasTexture(pCanvas);

  const particleMaterial = new THREE.PointsMaterial({
    color: new THREE.Color("#818cf8"),
    size: 0.065,
    map: particleTexture,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);
}

function initCosmicDust() {
  const dustCount = 700;
  const dustGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
  }

  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x475569,
    size: 0.035,
    transparent: true,
    opacity: 0.35
  });

  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onMouseMove(e) {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }
}

function triggerShockwave() {
  shockwaveImpulse = 1.0;
  playShockwaveChime();
}

let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  // Smooth mouse inertia
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  camera.position.x = mouse.x * 0.35;
  camera.position.y = mouse.y * 0.35;
  camera.lookAt(0, 0, 0);

  // Shockwave decay
  if (shockwaveImpulse > 0.001) {
    shockwaveImpulse *= 0.94;
  } else {
    shockwaveImpulse = 0;
  }
  shaderUniforms.u_shockwave.value = shockwaveImpulse;

  // Smooth transitions
  const lerpSpeed = dt * 2.8;
  shaderUniforms.u_time.value = time;
  shaderUniforms.u_speed.value = THREE.MathUtils.lerp(shaderUniforms.u_speed.value, targets.speed, lerpSpeed);
  shaderUniforms.u_density.value = THREE.MathUtils.lerp(shaderUniforms.u_density.value, targets.density, lerpSpeed);
  shaderUniforms.u_displacement.value = THREE.MathUtils.lerp(shaderUniforms.u_displacement.value, targets.displacement, lerpSpeed);
  shaderUniforms.u_spikiness.value = THREE.MathUtils.lerp(shaderUniforms.u_spikiness.value, targets.spikiness, lerpSpeed);
  shaderUniforms.u_droop.value = THREE.MathUtils.lerp(shaderUniforms.u_droop.value, targets.droop, lerpSpeed);
  shaderUniforms.u_scale.value = THREE.MathUtils.lerp(shaderUniforms.u_scale.value, targets.scale, lerpSpeed);

  shaderUniforms.u_color_core.value.lerp(targets.colorCore, lerpSpeed);
  shaderUniforms.u_color_glow.value.lerp(targets.colorGlow, lerpSpeed);
  shaderUniforms.u_color_rim.value.lerp(targets.colorRim, lerpSpeed);

  auraUniforms.u_time.value = time;
  auraUniforms.u_scale.value = shaderUniforms.u_scale.value;
  auraUniforms.u_color_rim.value.copy(shaderUniforms.u_color_rim.value);

  if (entityMesh) {
    entityMesh.rotation.y = time * 0.08 * shaderUniforms.u_speed.value;
    entityMesh.rotation.z = time * 0.035;
    auraMesh.rotation.copy(entityMesh.rotation);
  }

  if (particles) {
    currentParticleSpeed = THREE.MathUtils.lerp(currentParticleSpeed, targets.particleSpeed, lerpSpeed);
    const pGeo = particles.geometry;
    const pos = pGeo.attributes.position.array;
    const { angles, radiuses, speeds, yOffsets } = pGeo.userData;
    const count = angles.length;

    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i] * dt * currentParticleSpeed * 0.85;
      const r = radiuses[i] * targets.particleSpread;
      const yWave = Math.sin(time * 1.5 + i) * 0.12;

      pos[i * 3] = Math.cos(angles[i]) * r;
      pos[i * 3 + 1] = pos[i * 3 + 1] + (yOffsets[i] * 2.2 + yWave - pos[i * 3 + 1]) * 0.03;
      pos[i * 3 + 2] = Math.sin(angles[i]) * r;
    }
    pGeo.attributes.position.needsUpdate = true;
    particles.material.color.lerp(targets.colorGlow, lerpSpeed);
  }

  renderer.render(scene, camera);
}

// ============================================================================
// 3. GENERATIVE WEB AUDIO API SYNTHESIZER
// ============================================================================

let audioCtx = null;
let masterGain = null;
let osc1 = null;
let osc2 = null;
let lfo = null;
let filterNode = null;
let isAudioEnabled = false;

function initAudio() {
  if (audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = "lowpass";
    filterNode.frequency.setValueAtTime(400, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(4.0, audioCtx.currentTime);
    filterNode.connect(masterGain);

    osc1 = audioCtx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(130, audioCtx.currentTime);

    osc2 = audioCtx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(131.5, audioCtx.currentTime);

    lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.5, audioCtx.currentTime);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(150, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filterNode.frequency);

    osc1.connect(filterNode);
    osc2.connect(filterNode);

    osc1.start();
    osc2.start();
    lfo.start();
  } catch (e) {
    console.warn("Web Audio not supported or blocked:", e);
  }
}

function toggleAudio() {
  initAudio();
  if (!audioCtx) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isAudioEnabled = !isAudioEnabled;
  const btn = document.getElementById('btn-sound-toggle');

  if (isAudioEnabled) {
    masterGain.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.4);
    btn.classList.add('active');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Audio: ATTIVO`;
  } else {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    btn.classList.remove('active');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> Audio: MUTO`;
  }
}

function updateAudioEmotion(physics) {
  if (!audioCtx || !isAudioEnabled) return;
  const t = audioCtx.currentTime;
  const targetFreq = physics.audioFreq || 220;
  const targetMod = physics.audioMod || 2.0;

  osc1.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.8);
  osc2.frequency.setTargetAtTime((targetFreq * 0.5) + (targetMod * 0.3), t, 0.8);
  lfo.frequency.setTargetAtTime(targetMod * 0.4, t, 0.8);
  filterNode.frequency.setTargetAtTime(targetFreq * 1.5 + 200, t, 0.8);
}

function playShockwaveChime() {
  if (!audioCtx || !isAudioEnabled) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(activeEmotion?.plutchik?.physics?.audioFreq || 440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (e) {
    // Ignore audio errors
  }
}

// ============================================================================
// 4. EMOTION APPLICATION & UI HUD UPDATER
// ============================================================================

function applyEmotion(emotionObj, shock = true) {
  if (!emotionObj) return;
  activeEmotion = emotionObj;

  const pk = emotionObj.plutchik || {};
  const phys = pk.physics || PLUTCHIK_PRIMARIES.gioia.physics;

  targets.speed = phys.speed;
  targets.density = phys.density;
  targets.displacement = phys.displacement;
  targets.spikiness = phys.spikiness;
  targets.droop = phys.droop;
  targets.scale = phys.scale;
  targets.particleSpeed = phys.particleSpeed;
  targets.particleSpread = phys.particleSpread;

  targets.colorCore.set(pk.core || "#111827");
  targets.colorGlow.set(pk.glow || "#818cf8");
  targets.colorRim.set(pk.color || "#6366f1");

  if (shock) {
    shockwaveImpulse = 1.0;
    playShockwaveChime();
  }

  // Update dynamic CSS variables
  const root = document.documentElement;
  const col = pk.color || "#8b5cf6";
  root.style.setProperty('--emotion-color', col);
  root.style.setProperty('--emotion-glow', col + '75');
  root.style.setProperty('--emotion-glow-subtle', col + '22');
  root.style.setProperty('--emotion-glow-strong', col + 'cc');

  updateAudioEmotion(phys);
  updateHUD(emotionObj);
  drawMiniRadar(pk);
  highlightPlutchikWheel(pk.primary);
}

function updateHUD(e) {
  const card = document.getElementById('emotion-card');
  if (!card) return;

  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = 'slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

  document.getElementById('card-title').textContent = e.termine_originale;
  document.getElementById('card-culture').textContent = `${e.lingua_cultura} • ${e.modello_fonte}`;
  
  const tagValenza = document.getElementById('tag-valenza');
  tagValenza.textContent = `Valenza: ${e.valenza}`;
  tagValenza.className = `tag tag-valenza-${e.valenza}`;

  const tagArousal = document.getElementById('tag-arousal');
  tagArousal.textContent = `Arousal: ${e.arousal}`;

  const tagFamily = document.getElementById('tag-family');
  tagFamily.textContent = `Famiglia: ${e.famiglia_emotiva}`;
  tagFamily.className = `tag`;
  tagFamily.style.background = 'rgba(255, 255, 255, 0.06)';

  document.getElementById('card-meaning').textContent = `« ${e.significato_italiano} »`;

  const barsContainer = document.getElementById('vector-bars');
  barsContainer.innerHTML = '';

  const weights = e.plutchik?.weights || {};
  const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([key, weight]) => {
    const pkInfo = PLUTCHIK_PRIMARIES[key];
    if (!pkInfo) return;

    const row = document.createElement('div');
    row.className = 'vector-row';
    const pct = Math.round(weight * 100);

    row.innerHTML = `
      <span class="vector-name" style="color: ${pkInfo.color}">${pkInfo.it}</span>
      <div class="vector-bar-wrap">
        <div class="vector-bar-fill" style="width: ${pct}%; background: ${pkInfo.color}; color: ${pkInfo.color}"></div>
      </div>
      <span class="vector-pct">${pct}%</span>
    `;
    barsContainer.appendChild(row);
  });

  const pk = e.plutchik;
  const primInfo = PLUTCHIK_PRIMARIES[pk?.primary];
  if (primInfo) {
    document.getElementById('radar-opposite-text').textContent = `Opposto secondo Plutchik: ${primInfo.opposite_it}`;
  }
}

function drawMiniRadar(plutchikData) {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = center - 4;

  ctx.clearRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(center - radius, center);
  ctx.lineTo(center + radius, center);
  ctx.moveTo(center, center - radius);
  ctx.lineTo(center, center + radius);
  ctx.stroke();

  const weights = plutchikData?.weights || {};
  const entries = Object.keys(PLUTCHIK_PRIMARIES);
  
  ctx.beginPath();
  entries.forEach((key, idx) => {
    const p = PLUTCHIK_PRIMARIES[key];
    const angleRad = (p.angle * Math.PI) / 180;
    const w = weights[key] || 0.15;
    const r = radius * (0.2 + w * 0.8);
    const x = center + Math.cos(angleRad) * r;
    const y = center - Math.sin(angleRad) * r;

    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = (plutchikData.color || "#8b5cf6") + "66";
  ctx.fill();
  ctx.strokeStyle = plutchikData.color || "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ============================================================================
// 5. INTELLIGENT SEARCH & FUZZY MATCHING
// ============================================================================

function searchEmotion(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  let match = emotionsDataset.find(e => e.termine_originale.toLowerCase() === q);
  if (match) return match;

  match = emotionsDataset.find(e => e.famiglia_emotiva.toLowerCase() === q);
  if (match) return match;

  match = emotionsDataset.find(e => e.plutchik?.primary_it.toLowerCase() === q);
  if (match) return match;

  const SYNONYMS = {
    "felice": "Joy", "felicità": "Joy", "allegria": "Joy", "allegro": "Joy",
    "triste": "Sadness", "depresso": "Sadness", "depressione": "Sadness", "pianto": "Sadness",
    "arrabbiato": "Anger", "ira": "Anger", "furia": "Anger", "collera": "Anger",
    "spaventato": "Fear", "terrore": "Horror", "spavento": "Fear", "panico": "Fear",
    "schifo": "Disgust", "nausea": "Disgust", "ripugnanza": "Disgust",
    "stupore": "Surprise", "sorpreso": "Surprise", "meravigliato": "Awe",
    "fede": "Trust / Acceptance", "sicuro": "Trust / Acceptance", "sicurezza": "Trust / Acceptance",
    "attesa": "Anticipation", "aspettativa": "Anticipation",
    "affetto": "Love", "passione": "Love",
    "curioso": "Interest", "ansioso": "Anxiety", "calmo": "Calmness", "pace": "Calmness",
    "noioso": "Boredom", "confuso": "Confusion", "sollievo": "Relief"
  };

  if (SYNONYMS[q]) {
    match = emotionsDataset.find(e => e.termine_originale.toLowerCase() === SYNONYMS[q].toLowerCase());
    if (match) return match;
  }

  match = emotionsDataset.find(e => 
    e.termine_originale.toLowerCase().includes(q) || 
    e.famiglia_emotiva.toLowerCase().includes(q)
  );
  if (match) return match;

  match = emotionsDataset.find(e => e.significato_italiano.toLowerCase().includes(q));
  if (match) return match;

  let bestDist = 999;
  let bestItem = null;
  for (const item of emotionsDataset) {
    const d1 = levenshtein(q, item.termine_originale.toLowerCase());
    const d2 = levenshtein(q, item.famiglia_emotiva.toLowerCase());
    const minD = Math.min(d1, d2);
    if (minD < bestDist) {
      bestDist = minD;
      bestItem = item;
    }
  }

  if (bestDist <= 3) {
    return bestItem;
  }

  return null;
}

function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;
  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

// ============================================================================
// 6. AUTOCOMPLETE & UI INTERACTIONS
// ============================================================================

function initSearchUI() {
  const input = document.getElementById('emotion-input');
  const btnSend = document.getElementById('btn-send');
  const btnClear = document.getElementById('btn-clear');
  const dropdown = document.getElementById('autocomplete-dropdown');
  const btnRandom = document.getElementById('btn-random');

  function handleSearchSubmit() {
    const val = input.value.trim();
    if (!val) return;
    const found = searchEmotion(val);
    if (found) {
      applyEmotion(found, true);
      dropdown.classList.remove('open');
      input.blur();
    } else {
      input.parentElement.style.borderColor = '#ef4444';
      setTimeout(() => {
        input.parentElement.style.borderColor = '';
      }, 800);
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
    }
  });

  btnSend.addEventListener('click', handleSearchSubmit);

  btnClear.addEventListener('click', () => {
    input.value = '';
    dropdown.classList.remove('open');
    input.focus();
  });

  btnRandom.addEventListener('click', () => {
    if (emotionsDataset.length === 0) return;
    const rand = emotionsDataset[Math.floor(Math.random() * emotionsDataset.length)];
    input.value = rand.termine_originale;
    applyEmotion(rand, true);
  });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q || q.length < 1) {
      dropdown.classList.remove('open');
      dropdown.innerHTML = '';
      return;
    }

    const matches = emotionsDataset.filter(e => 
      e.termine_originale.toLowerCase().includes(q) ||
      e.famiglia_emotiva.toLowerCase().includes(q) ||
      e.significato_italiano.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      dropdown.classList.remove('open');
      return;
    }

    dropdown.innerHTML = '';
    matches.forEach(m => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.innerHTML = `
        <div class="item-left">
          <div class="item-dot" style="background: ${m.plutchik.color}"></div>
          <div>
            <span class="item-name">${m.termine_originale}</span>
            <span class="item-family">(${m.famiglia_emotiva})</span>
          </div>
        </div>
        <span class="item-culture">${m.lingua_cultura.split('/')[0]}</span>
      `;
      item.addEventListener('click', () => {
        input.value = m.termine_originale;
        applyEmotion(m, true);
        dropdown.classList.remove('open');
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  const chips = document.querySelectorAll('.quick-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const term = chip.getAttribute('data-emotion');
      const found = searchEmotion(term);
      if (found) {
        input.value = found.termine_originale;
        applyEmotion(found, true);
      }
    });
  });

  const soundBtn = document.getElementById('btn-sound-toggle');
  soundBtn.addEventListener('click', toggleAudio);
}

// ============================================================================
// 7. INTERACTIVE PLUTCHIK'S WHEEL MODAL
// ============================================================================

function initPlutchikWheelModal() {
  const btnToggle = document.getElementById('btn-plutchik-toggle');
  const modal = document.getElementById('modal-plutchik');
  const btnClose = document.getElementById('btn-close-plutchik');

  btnToggle.addEventListener('click', () => {
    modal.classList.add('open');
    renderPlutchikSVG();
  });

  btnClose.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  renderPlutchikSVG();
}

function renderPlutchikSVG() {
  const container = document.getElementById('plutchik-svg-box');
  if (!container) return;

  const width = 370;
  const height = 370;
  const cx = width / 2;
  const cy = height / 2;
  const outerR = 165;
  const midR = 112;
  const innerR = 54;

  const entries = Object.entries(PLUTCHIK_PRIMARIES);
  const stepAngle = (Math.PI * 2) / entries.length;

  let svgHtml = `<svg class="plutchik-svg" viewBox="0 0 ${width} ${height}">`;
  
  svgHtml += `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>`;
  svgHtml += `<circle cx="${cx}" cy="${cy}" r="${midR}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  svgHtml += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;

  entries.forEach(([key, p]) => {
    const angle = (p.angle * Math.PI) / 180;
    const a1 = angle - stepAngle * 0.44;
    const a2 = angle + stepAngle * 0.44;

    const x1 = cx + Math.cos(a1) * innerR;
    const y1 = cy - Math.sin(a1) * innerR;
    const x2 = cx + Math.cos(a1) * outerR;
    const y2 = cy - Math.sin(a1) * outerR;
    const x3 = cx + Math.cos(a2) * outerR;
    const y3 = cy - Math.sin(a2) * outerR;
    const x4 = cx + Math.cos(a2) * innerR;
    const y4 = cy - Math.sin(a2) * innerR;

    svgHtml += `
      <path id="petal-${key}" class="plutchik-petal" data-primary="${key}"
        d="M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 0 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 1 ${x1} ${y1} Z"
        fill="${p.color}35" stroke="${p.color}" stroke-width="1.5" />
    `;

    const textR = (midR + outerR) / 2;
    const tx = cx + Math.cos(angle) * textR;
    const ty = cy - Math.sin(angle) * textR + 4;
    svgHtml += `
      <text x="${tx}" y="${ty}" text-anchor="middle" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600" fill="#ffffff" pointer-events="none">
        ${p.it}
      </text>
    `;
  });

  // Central Core Circle
  svgHtml += `
    <circle cx="${cx}" cy="${cy}" r="${innerR - 6}" fill="#080812" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="9" font-family="'JetBrains Mono', monospace" fill="#94a3b8">PLUTCHIK</text>
    <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">AXIS</text>
  `;

  svgHtml += `</svg>`;
  container.innerHTML = svgHtml;

  container.querySelectorAll('.plutchik-petal').forEach(petal => {
    petal.addEventListener('click', () => {
      const key = petal.getAttribute('data-primary');
      const item = emotionsDataset.find(e => e.plutchik?.primary === key) || {
        termine_originale: PLUTCHIK_PRIMARIES[key].it,
        lingua_cultura: "Universale",
        famiglia_emotiva: PLUTCHIK_PRIMARIES[key].it,
        significato_italiano: `Emozione primaria di ${PLUTCHIK_PRIMARIES[key].it} nel modello della Ruota delle Emozioni di Robert Plutchik.`,
        valenza: key === 'gioia' || key === 'fiducia' ? 'positiva' : key === 'sorpresa' || key === 'anticipazione' ? 'neutra' : 'negativa',
        arousal: 'alto',
        modello_fonte: 'Robert Plutchik',
        plutchik: {
          primary: key,
          primary_it: PLUTCHIK_PRIMARIES[key].it,
          weights: { [key]: 1.0 },
          color: PLUTCHIK_PRIMARIES[key].color,
          glow: PLUTCHIK_PRIMARIES[key].glow,
          core: PLUTCHIK_PRIMARIES[key].core,
          angle: PLUTCHIK_PRIMARIES[key].angle,
          physics: { ...PLUTCHIK_PRIMARIES[key].physics }
        }
      };
      applyEmotion(item, true);
      document.getElementById('modal-plutchik').classList.remove('open');
    });
  });

  renderPlutchikLegend();
}

function renderPlutchikLegend() {
  const legend = document.getElementById('plutchik-legend');
  if (!legend) return;
  legend.innerHTML = '';

  Object.entries(PLUTCHIK_PRIMARIES).forEach(([key, p]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-color" style="background: ${p.color}; color: ${p.color}"></div>
      <div>
        <span style="font-weight: 600; color: #ffffff">${p.it}</span>
        <span style="font-size: 0.7rem; color: #94a3b8"> ↔ ${p.opposite_it}</span>
      </div>
    `;
    item.addEventListener('click', () => {
      const found = emotionsDataset.find(e => e.plutchik?.primary === key);
      if (found) {
        applyEmotion(found, true);
        document.getElementById('modal-plutchik').classList.remove('open');
      }
    });
    legend.appendChild(item);
  });
}

function highlightPlutchikWheel(primaryKey) {
  document.querySelectorAll('.plutchik-petal').forEach(p => {
    if (p.getAttribute('data-primary') === primaryKey) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

// ============================================================================
// 8. FULL CATALOG MODAL (90 EMOZIONI)
// ============================================================================

function initCatalogModal() {
  const btnToggle = document.getElementById('btn-catalog-toggle');
  const modal = document.getElementById('modal-catalog');
  const btnClose = document.getElementById('btn-close-catalog');
  const searchInput = document.getElementById('catalog-search');

  btnToggle.addEventListener('click', () => {
    modal.classList.add('open');
    populateCatalog();
  });

  btnClose.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  searchInput.addEventListener('input', () => {
    filterCatalog();
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCatalog();
    });
  });
}

function populateCatalog() {
  filterCatalog();
}

function filterCatalog() {
  const grid = document.getElementById('catalog-grid');
  const searchInput = document.getElementById('catalog-search');
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  if (!grid) return;

  const query = (searchInput?.value || '').trim().toLowerCase();
  const filterCat = activeFilterBtn?.getAttribute('data-filter') || 'all';

  const filtered = emotionsDataset.filter(item => {
    if (filterCat === 'ekman' && !item.modello_fonte.includes('Ekman')) return false;
    if (filterCat === 'plutchik' && !item.modello_fonte.includes('Plutchik')) return false;
    if (filterCat === 'cowen' && !item.modello_fonte.includes('Cowen')) return false;
    if (filterCat === 'cultura' && (item.modello_fonte.includes('Ekman') || item.modello_fonte.includes('Plutchik') || item.modello_fonte.includes('Cowen'))) return false;
    if (filterCat === 'positiva' && item.valenza !== 'positiva') return false;
    if (filterCat === 'negativa' && item.valenza !== 'negativa') return false;

    if (query) {
      const match = 
        item.termine_originale.toLowerCase().includes(query) ||
        item.famiglia_emotiva.toLowerCase().includes(query) ||
        item.lingua_cultura.toLowerCase().includes(query) ||
        item.significato_italiano.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  grid.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'catalog-card';
    card.innerHTML = `
      <div>
        <div class="catalog-card-header">
          <span class="catalog-card-title">${item.termine_originale}</span>
          <span class="catalog-card-culture">${item.lingua_cultura.split('/')[0]}</span>
        </div>
        <div class="catalog-card-family" style="color: ${item.plutchik.color}">● ${item.famiglia_emotiva}</div>
        <div class="catalog-card-desc">${item.significato_italiano}</div>
      </div>
      <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; font-family: monospace;">
        <span>${item.valenza.toUpperCase()}</span>
        <span>AROUSAL: ${item.arousal.toUpperCase()}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      applyEmotion(item, true);
      document.getElementById('modal-catalog').classList.remove('open');
      const input = document.getElementById('emotion-input');
      if (input) input.value = item.termine_originale;
    });

    grid.appendChild(card);
  });
}

// ============================================================================
// 9. APP INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  initThree();
  initSearchUI();
  initPlutchikWheelModal();
  initCatalogModal();
  loadDataset();
});
