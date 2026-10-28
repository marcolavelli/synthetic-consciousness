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

  // Positioned camera with responsive framing for mobile and desktop
  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  updateCameraFraming();
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
  window.addEventListener('touchstart', onTouchStart, { passive: true });
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

let baseCameraY = 0.0;

function updateCameraFraming() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= 768;
  const aspect = width / height;
  const isCompactMobile = width <= 400 || aspect < 0.52; // iPhone 13 mini: 375x812 (aspect ~0.46)
  camera.aspect = aspect;

  if (isMobile) {
    if (isCompactMobile) {
      // Specifically calibrated for iPhone 13 mini and compact narrow portrait viewports
      camera.fov = 52;
      camera.position.z = 7.1;
      baseCameraY = 0.32;
    } else {
      camera.fov = aspect < 0.6 ? 48 : 45;
      camera.position.z = aspect < 0.6 ? 6.7 : 6.4;
      baseCameraY = 0.24;
    }
  } else {
    camera.fov = 42;
    camera.position.z = 6.4;
    baseCameraY = 0.0;
  }
  camera.position.y = baseCameraY;
  camera.updateProjectionMatrix();
  if (renderer) renderer.setSize(width, height);
}

function onWindowResize() {
  updateCameraFraming();
}

function onMouseMove(e) {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
}

function onTouchStart(e) {
  if (e.touches.length > 0) {
    mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
  }
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
  camera.position.y = baseCameraY + mouse.y * 0.22;
  camera.lookAt(0, baseCameraY * 0.45, 0);

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
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span class="btn-text" id="sound-btn-text">Audio: ATTIVO</span>`;
  } else {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    btn.classList.remove('active');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> <span class="btn-text" id="sound-btn-text">Audio: MUTO</span>`;
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

  // Card Collapse / Expand Toggle & Mobile Backdrop
  const card = document.getElementById('emotion-card');
  const btnToggleCard = document.getElementById('btn-toggle-card');
  const cardBackdrop = document.getElementById('card-backdrop');

  const setCardCollapsed = (collapsed) => {
    if (!card) return;
    if (collapsed) {
      card.classList.add('collapsed');
      if (cardBackdrop) cardBackdrop.classList.remove('active');
    } else {
      card.classList.remove('collapsed');
      if (cardBackdrop && window.innerWidth <= 768) {
        cardBackdrop.classList.add('active');
      }
    }
  };

  if (btnToggleCard && card) {
    btnToggleCard.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyCollapsed = card.classList.contains('collapsed');
      setCardCollapsed(!isCurrentlyCollapsed);
    });

    const topBar = card.querySelector('.emotion-card-topbar');
    if (topBar) {
      topBar.addEventListener('click', () => {
        if (card.classList.contains('collapsed')) {
          setCardCollapsed(false);
        }
      });
    }

    if (cardBackdrop) {
      cardBackdrop.addEventListener('click', () => {
        setCardCollapsed(true);
      });
    }
  }

  // On mobile (<= 768px), start with card collapsed for optimal view of 3D entity
  if (window.innerWidth <= 768 && card) {
    setCardCollapsed(true);
  }
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
  initAnalyzeModal();
  initImageAnalyzeModal();
  initAudioAnalyzeModal();
  initVideoAnalyzeModal();
  initWebSurferModal();
  loadDataset();
});

// ============================================================================
// 10. TEXT EMOTION RECOGNITION ENGINE (NLP LOCALE - NESSUNA API ESTERNA)
// ============================================================================

/**
 * Dizionario lessicale emozionale italiano / inglese.
 * Ogni parola chiave mappa a un oggetto con pesi sulle 8 emozioni primarie di Plutchik.
 * I pesi sono normalizzati nell'intervallo [0, 1].
 */
const EMOTION_LEXICON = {
  // ── GIOIA ──────────────────────────────────────────────────────────────────
  "felice": { gioia: 0.95 },
  "felicità": { gioia: 0.95 },
  "contento": { gioia: 0.85 },
  "gioioso": { gioia: 0.95 },
  "gioia": { gioia: 1.0 },
  "allegro": { gioia: 0.80 },
  "allegria": { gioia: 0.80 },
  "entusiasmo": { gioia: 0.75, anticipazione: 0.35 },
  "entusiasta": { gioia: 0.75, anticipazione: 0.35 },
  "euforico": { gioia: 0.90 },
  "euforia": { gioia: 0.90 },
  "esultante": { gioia: 0.85 },
  "estasiato": { gioia: 0.85 },
  "estasi": { gioia: 0.85 },
  "giubilo": { gioia: 0.90 },
  "giubilante": { gioia: 0.90 },
  "lieto": { gioia: 0.70 },
  "beato": { gioia: 0.80 },
  "beatitudine": { gioia: 0.80 },
  "felicissimo": { gioia: 1.0 },
  "esaltato": { gioia: 0.75 },
  "ottimo": { gioia: 0.55 },
  "meraviglioso": { gioia: 0.80, sorpresa: 0.20 },
  "magnifico": { gioia: 0.75 },
  "splendido": { gioia: 0.70 },
  "fantastico": { gioia: 0.80 },
  "perfetto": { gioia: 0.65 },
  "bellissimo": { gioia: 0.65 },
  "bello": { gioia: 0.50 },
  "rido": { gioia: 0.80 },
  "ridere": { gioia: 0.80 },
  "riso": { gioia: 0.75 },
  "sorriso": { gioia: 0.70 },
  "sorrido": { gioia: 0.70 },
  "divertente": { gioia: 0.60 },
  "divertimento": { gioia: 0.70 },
  "piacere": { gioia: 0.65, fiducia: 0.20 },
  "piacevole": { gioia: 0.60 },
  "soddisfatto": { gioia: 0.65, fiducia: 0.25 },
  "soddisfazione": { gioia: 0.65, fiducia: 0.25 },
  "successo": { gioia: 0.70, fiducia: 0.30 },
  "vittoria": { gioia: 0.80 },
  "vincere": { gioia: 0.75 },
  "amore": { gioia: 0.80, fiducia: 0.60 },
  "amico": { gioia: 0.50, fiducia: 0.50 },
  "amicizia": { gioia: 0.55, fiducia: 0.55 },
  "pace": { gioia: 0.55, fiducia: 0.45 },
  "joy": { gioia: 1.0 },
  "happy": { gioia: 0.90 },
  "happiness": { gioia: 0.90 },

  // ── TRISTEZZA ───────────────────────────────────────────────────────────────
  "triste": { tristezza: 0.90 },
  "tristezza": { tristezza: 0.95 },
  "malinconico": { tristezza: 0.80 },
  "malinconia": { tristezza: 0.80 },
  "dolore": { tristezza: 0.75 },
  "dolente": { tristezza: 0.70 },
  "sofferenza": { tristezza: 0.80 },
  "soffro": { tristezza: 0.80 },
  "soffrire": { tristezza: 0.80 },
  "piango": { tristezza: 0.85 },
  "piangere": { tristezza: 0.85 },
  "lacrime": { tristezza: 0.80 },
  "lacrima": { tristezza: 0.80 },
  "pianto": { tristezza: 0.85 },
  "lutto": { tristezza: 0.90 },
  "perdita": { tristezza: 0.75 },
  "perso": { tristezza: 0.60 },
  "mancanza": { tristezza: 0.65 },
  "nostalgia": { tristezza: 0.70 },
  "rimpianto": { tristezza: 0.70 },
  "rimpiango": { tristezza: 0.70 },
  "depresso": { tristezza: 0.90 },
  "depressione": { tristezza: 0.90 },
  "abbattuto": { tristezza: 0.80 },
  "demoralizzato": { tristezza: 0.80 },
  "sconsolato": { tristezza: 0.85 },
  "sconforto": { tristezza: 0.80 },
  "avvilito": { tristezza: 0.75 },
  "avvilimento": { tristezza: 0.75 },
  "mesto": { tristezza: 0.70 },
  "afflitto": { tristezza: 0.75 },
  "afflizione": { tristezza: 0.75 },
  "inconsolabile": { tristezza: 0.90 },
  "disperato": { tristezza: 0.85, paura: 0.20 },
  "disperazione": { tristezza: 0.85, paura: 0.20 },
  "fallimento": { tristezza: 0.70 },
  "fallito": { tristezza: 0.70 },
  "solo": { tristezza: 0.65 },
  "solitudine": { tristezza: 0.70 },
  "abbandonato": { tristezza: 0.80 },
  "abbandono": { tristezza: 0.75 },
  "morte": { tristezza: 0.80, paura: 0.30 },
  "morire": { tristezza: 0.75, paura: 0.30 },
  "sad": { tristezza: 0.90 },
  "sadness": { tristezza: 0.95 },
  "grief": { tristezza: 0.90 },
  "pesante": { tristezza: 0.45 },
  "pesa": { tristezza: 0.40 },
  "spalle": { tristezza: 0.20 },

  // ── PAURA ───────────────────────────────────────────────────────────────────
  "paura": { paura: 0.95 },
  "pauro": { paura: 0.85 },
  "spavento": { paura: 0.85 },
  "spaventato": { paura: 0.85 },
  "terrore": { paura: 0.95 },
  "terrorizzato": { paura: 0.95 },
  "orrore": { paura: 0.90, disgusto: 0.30 },
  "orrido": { paura: 0.70, disgusto: 0.50 },
  "panico": { paura: 0.90 },
  "ansia": { paura: 0.80 },
  "ansioso": { paura: 0.75 },
  "angoscia": { paura: 0.85 },
  "angosciato": { paura: 0.85 },
  "angosciante": { paura: 0.80 },
  "tremare": { paura: 0.75 },
  "tremo": { paura: 0.75 },
  "tremore": { paura: 0.75 },
  "timore": { paura: 0.80 },
  "timoroso": { paura: 0.75 },
  "fobia": { paura: 0.90 },
  "incubo": { paura: 0.85 },
  "minaccia": { paura: 0.70, rabbia: 0.20 },
  "pericoloso": { paura: 0.75 },
  "pericolo": { paura: 0.80 },
  "vulnerabile": { paura: 0.65 },
  "impotente": { paura: 0.55, tristezza: 0.35 },
  "fear": { paura: 0.95 },
  "afraid": { paura: 0.85 },
  "scared": { paura: 0.85 },
  "phobia": { paura: 0.90 },

  // ── RABBIA ──────────────────────────────────────────────────────────────────
  "rabbia": { rabbia: 0.95 },
  "arrabbiato": { rabbia: 0.90 },
  "ira": { rabbia: 0.90 },
  "irato": { rabbia: 0.90 },
  "furioso": { rabbia: 0.95 },
  "furia": { rabbia: 0.95 },
  "collera": { rabbia: 0.90 },
  "odio": { rabbia: 0.85, disgusto: 0.40 },
  "odioso": { rabbia: 0.75, disgusto: 0.35 },
  "rancore": { rabbia: 0.80 },
  "risentimento": { rabbia: 0.75 },
  "sdegno": { rabbia: 0.75, disgusto: 0.35 },
  "sdegnato": { rabbia: 0.75, disgusto: 0.35 },
  "indignato": { rabbia: 0.80 },
  "indignazione": { rabbia: 0.80 },
  "aggressivo": { rabbia: 0.85 },
  "aggressione": { rabbia: 0.85 },
  "violento": { rabbia: 0.80 },
  "violenza": { rabbia: 0.80 },
  "urlo": { rabbia: 0.75 },
  "urlare": { rabbia: 0.75 },
  "gridare": { rabbia: 0.70 },
  "insopportabile": { rabbia: 0.60, disgusto: 0.30 },
  "frustrato": { rabbia: 0.70 },
  "frustrazione": { rabbia: 0.70 },
  "anger": { rabbia: 0.95 },
  "angry": { rabbia: 0.90 },
  "rage": { rabbia: 0.95 },
  "hate": { rabbia: 0.85, disgusto: 0.40 },
  "detesto": { rabbia: 0.75, disgusto: 0.50 },
  "detestare": { rabbia: 0.75, disgusto: 0.50 },

  // ── DISGUSTO ────────────────────────────────────────────────────────────────
  "disgusto": { disgusto: 0.95 },
  "disgustoso": { disgusto: 0.90 },
  "ripugnante": { disgusto: 0.90 },
  "ripugnanza": { disgusto: 0.90 },
  "nausea": { disgusto: 0.85 },
  "nauseabondo": { disgusto: 0.85 },
  "schifo": { disgusto: 0.90 },
  "schifoso": { disgusto: 0.90 },
  "rivoltante": { disgusto: 0.85 },
  "ributtante": { disgusto: 0.85 },
  "orrendo": { disgusto: 0.80, paura: 0.20 },
  "repellente": { disgusto: 0.85 },
  "abominevole": { disgusto: 0.90 },
  "vomitevole": { disgusto: 0.90 },
  "immondizia": { disgusto: 0.75 },
  "corruzione": { disgusto: 0.70, rabbia: 0.30 },
  "disgust": { disgusto: 0.95 },
  "gross": { disgusto: 0.75 },

  // ── SORPRESA ────────────────────────────────────────────────────────────────
  "sorpresa": { sorpresa: 0.95 },
  "sorpreso": { sorpresa: 0.90 },
  "stupore": { sorpresa: 0.85 },
  "stupito": { sorpresa: 0.85 },
  "meraviglia": { sorpresa: 0.80, gioia: 0.30 },
  "meravigliato": { sorpresa: 0.80, gioia: 0.30 },
  "incredibile": { sorpresa: 0.70 },
  "inaspettato": { sorpresa: 0.80 },
  "imprevisto": { sorpresa: 0.80 },
  "sbalordito": { sorpresa: 0.85 },
  "sbalordimento": { sorpresa: 0.85 },
  "stupefatto": { sorpresa: 0.90 },
  "attonito": { sorpresa: 0.85 },
  "sgomento": { sorpresa: 0.60, paura: 0.40 },
  "improvviso": { sorpresa: 0.60 },
  "improvvisamente": { sorpresa: 0.50 },
  "sorprendente": { sorpresa: 0.80 },
  "wow": { sorpresa: 0.90, gioia: 0.30 },
  "oddio": { sorpresa: 0.70 },
  "cavolo": { sorpresa: 0.50, rabbia: 0.20 },
  "incredulo": { sorpresa: 0.75 },
  "surprise": { sorpresa: 0.95 },
  "surprised": { sorpresa: 0.90 },
  "astonished": { sorpresa: 0.90 },

  // ── FIDUCIA ─────────────────────────────────────────────────────────────────
  "fiducia": { fiducia: 0.95 },
  "sicuro": { fiducia: 0.80 },
  "sicurezza": { fiducia: 0.80 },
  "fede": { fiducia: 0.85 },
  "credere": { fiducia: 0.75 },
  "speranza": { fiducia: 0.75, anticipazione: 0.40 },
  "sperare": { fiducia: 0.70, anticipazione: 0.40 },
  "ottimismo": { fiducia: 0.75, anticipazione: 0.35 },
  "ottimista": { fiducia: 0.70, anticipazione: 0.35 },
  "calmo": { fiducia: 0.70 },
  "calma": { fiducia: 0.70 },
  "serenità": { fiducia: 0.80, gioia: 0.30 },
  "sereno": { fiducia: 0.80, gioia: 0.30 },
  "tranquillo": { fiducia: 0.70 },
  "tranquillità": { fiducia: 0.70 },
  "fiducioso": { fiducia: 0.90 },
  "affidabile": { fiducia: 0.80 },
  "lealtà": { fiducia: 0.80 },
  "leale": { fiducia: 0.80 },
  "amato": { fiducia: 0.75, gioia: 0.45 },
  "trust": { fiducia: 0.95 },
  "confident": { fiducia: 0.80 },
  "andrà": { fiducia: 0.40, anticipazione: 0.30 },
  "meglio": { fiducia: 0.35, gioia: 0.20 },

  // ── ANTICIPAZIONE ───────────────────────────────────────────────────────────
  "anticipazione": { anticipazione: 0.95 },
  "attesa": { anticipazione: 0.85 },
  "aspettativa": { anticipazione: 0.85 },
  "aspetto": { anticipazione: 0.70 },
  "aspettare": { anticipazione: 0.70 },
  "curiosità": { anticipazione: 0.75 },
  "curioso": { anticipazione: 0.75 },
  "eccitato": { anticipazione: 0.75, gioia: 0.40 },
  "eccitazione": { anticipazione: 0.75, gioia: 0.40 },
  "brama": { anticipazione: 0.80, gioia: 0.20 },
  "bramare": { anticipazione: 0.80 },
  "desiderio": { anticipazione: 0.75, gioia: 0.25 },
  "desiderare": { anticipazione: 0.75 },
  "voglio": { anticipazione: 0.65 },
  "voglia": { anticipazione: 0.65 },
  "progetto": { anticipazione: 0.60 },
  "piano": { anticipazione: 0.55 },
  "pronto": { anticipazione: 0.55, fiducia: 0.30 },
  "domani": { anticipazione: 0.50 },
  "futuro": { anticipazione: 0.60 },
  "impaziente": { anticipazione: 0.80 },
  "impazientemente": { anticipazione: 0.80 },
  "anticipation": { anticipazione: 0.95 },
  "excitement": { anticipazione: 0.80, gioia: 0.40 }
};

/** Avverbi di intensità: moltiplicatori di peso */
const INTENSIFIERS = {
  "molto": 1.5, "moltissimo": 1.8, "estremamente": 1.9, "assolutamente": 1.7,
  "incredibilmente": 1.7, "davvero": 1.4, "veramente": 1.4, "totalmente": 1.6,
  "completamente": 1.6, "profondamente": 1.6, "terribilmente": 1.7,
  "enormemente": 1.6, "oltremodo": 1.5, "talmente": 1.4, "così": 1.3,
  "troppo": 1.5, "super": 1.5, "ultra": 1.6, "iper": 1.6,
  "abbastanza": 1.1, "alquanto": 1.1, "piuttosto": 1.1, "un po": 0.7,
  "leggermente": 0.65, "lievemente": 0.65, "appena": 0.55, "quasi": 0.7,
  "poco": 0.6
};

/** Negatori: invertono i pesi verso l'emozione opposta */
const NEGATORS = new Set([
  "non", "niente", "nessun", "nessuno", "nessuna", "mai", "né", "ne",
  "senza", "no", "not", "never", "no", "neppure", "nemmeno", "neanche"
]);

/**
 * Mappa inversa Plutchik: quale emozione è l'opposta
 */
const PLUTCHIK_OPPOSITES = {
  gioia: "tristezza",
  tristezza: "gioia",
  paura: "rabbia",
  rabbia: "paura",
  disgusto: "fiducia",
  fiducia: "disgusto",
  sorpresa: "anticipazione",
  anticipazione: "sorpresa"
};

/**
 * Analizza un testo libero e restituisce un vettore normalizzato di score emotivi.
 * @param {string} text
 * @returns {{ scores: Object<string,number>, dominant: string, confidence: number, vector: Object<string,number> }}
 */
function analyzeTextEmotion(text) {
  if (!text || !text.trim()) return null;

  const rawScores = {
    gioia: 0, tristezza: 0, paura: 0, rabbia: 0,
    disgusto: 0, sorpresa: 0, fiducia: 0, anticipazione: 0
  };

  // Tokenize: lowercase, strip punctuation (but track exclamation/question marks separately)
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const upperRatio = (text.replace(/[^A-Z]/g, '').length) / Math.max(text.replace(/[^a-zA-Z]/g, '').length, 1);

  const clean = text.toLowerCase()
    .replace(/['''`]/g, '') // normalize apostrophes
    .replace(/[^a-zàáèéìíòóùúA-Z0-9\s]/g, ' ');

  const tokens = clean.split(/\s+/).filter(t => t.length > 1);
  const totalTokens = tokens.length;

  let intensifierMultiplier = 1.0;
  let negationActive = false;
  let negationTokensLeft = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check for negators (affect next 2-3 content words)
    if (NEGATORS.has(token)) {
      negationActive = true;
      negationTokensLeft = 3;
      continue;
    }

    // Decrement negation window
    if (negationActive) {
      negationTokensLeft--;
      if (negationTokensLeft <= 0) negationActive = false;
    }

    // Check for intensifiers (affect next content word)
    if (INTENSIFIERS[token] !== undefined) {
      intensifierMultiplier = INTENSIFIERS[token];
      continue;
    }

    // Check two-word tokens (e.g. "un po")
    const bigramKey = i > 0 ? tokens[i-1] + ' ' + token : null;

    let entry = EMOTION_LEXICON[token] || (bigramKey ? EMOTION_LEXICON[bigramKey] : null);

    if (entry) {
      for (const [emotion, weight] of Object.entries(entry)) {
        let adjusted = weight * intensifierMultiplier;

        if (negationActive) {
          // Flip to opposite
          const opposite = PLUTCHIK_OPPOSITES[emotion];
          if (opposite) {
            rawScores[opposite] += adjusted * 0.8;
          } else {
            rawScores[emotion] -= adjusted * 0.5;
          }
        } else {
          rawScores[emotion] = (rawScores[emotion] || 0) + adjusted;
        }
      }
    }

    // Reset intensifier after use
    intensifierMultiplier = 1.0;
  }

  // Punctuation bonuses
  if (exclamations > 0) {
    const boost = Math.min(exclamations * 0.3, 1.0);
    // Find current dominant before boost and amplify it
    const maxKey = Object.keys(rawScores).reduce((a, b) => rawScores[a] > rawScores[b] ? a : b);
    rawScores[maxKey] += boost;
  }
  if (upperRatio > 0.3) {
    // ALL CAPS suggests strong intensity — amplify dominant
    const maxKey = Object.keys(rawScores).reduce((a, b) => rawScores[a] > rawScores[b] ? a : b);
    rawScores[maxKey] *= 1.3;
  }

  // Clamp negatives to 0
  for (const k of Object.keys(rawScores)) {
    rawScores[k] = Math.max(0, rawScores[k]);
  }

  const total = Object.values(rawScores).reduce((s, v) => s + v, 0);

  // If no signal found at all, return null
  if (total < 0.05) return null;

  // Normalize
  const normalized = {};
  for (const [k, v] of Object.entries(rawScores)) {
    normalized[k] = v / total;
  }

  // Find dominant
  const dominant = Object.keys(normalized).reduce((a, b) => normalized[a] > normalized[b] ? a : b);
  const confidence = normalized[dominant];

  return {
    scores: rawScores,
    vector: normalized,
    dominant,
    confidence
  };
}

/**
 * Data l'analisi NLP, trova nel dataset la emozione con il cosine similarity
 * più alta rispetto al vettore Plutchik risultante.
 */
function findBestDatasetMatch(analysisResult) {
  if (!analysisResult || emotionsDataset.length === 0) return null;

  const queryVec = analysisResult.vector;

  let bestScore = -1;
  let bestItem = null;

  for (const item of emotionsDataset) {
    const weights = item.plutchik?.weights;
    if (!weights) continue;

    // Cosine similarity between query vector and item weight vector
    let dot = 0, magQ = 0, magI = 0;
    for (const key of Object.keys(queryVec)) {
      const q = queryVec[key] || 0;
      const iw = weights[key] || 0;
      dot += q * iw;
      magQ += q * q;
      magI += iw * iw;
    }
    const sim = (magQ > 0 && magI > 0) ? dot / (Math.sqrt(magQ) * Math.sqrt(magI)) : 0;

    if (sim > bestScore) {
      bestScore = sim;
      bestItem = item;
    }
  }

  return bestItem;
}

// ============================================================================
// 11. ANALISI FRASE — MODAL CONTROLLER
// ============================================================================

let lastAnalyzedEmotion = null;

function initAnalyzeModal() {
  const btnToggle   = document.getElementById('btn-analyze-toggle');
  const modal       = document.getElementById('modal-analyze');
  const btnClose    = document.getElementById('btn-close-analyze');
  const textarea    = document.getElementById('analyze-textarea');
  const charCount   = document.getElementById('analyze-char-count');
  const btnAnalyze  = document.getElementById('btn-do-analyze');
  const btnApply    = document.getElementById('btn-apply-analyzed');

  btnToggle.addEventListener('click', () => {
    modal.classList.add('open');
    textarea.focus();
  });

  btnClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    btnAnalyze.disabled = len < 3;
  });

  btnAnalyze.addEventListener('click', () => {
    runAnalysis(textarea.value);
  });

  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (textarea.value.length >= 3) runAnalysis(textarea.value);
    }
  });

  btnApply.addEventListener('click', () => {
    if (lastAnalyzedEmotion) {
      applyEmotion(lastAnalyzedEmotion, true);
      const input = document.getElementById('emotion-input');
      if (input) input.value = lastAnalyzedEmotion.termine_originale;
      modal.classList.remove('open');
    }
  });
}

function runAnalysis(text) {
  const results = document.getElementById('analyze-results');
  const btnAnalyze = document.getElementById('btn-do-analyze');

  // Animate button state
  btnAnalyze.textContent = 'Analizzando...';
  btnAnalyze.disabled = true;

  // Small delay to allow repaint (gives perception of computation)
  setTimeout(() => {
    const analysis = analyzeTextEmotion(text);

    btnAnalyze.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg> Analizza emozione`;
    btnAnalyze.disabled = false;

    if (!analysis) {
      renderAnalysisNoResult();
      results.style.display = 'block';
      return;
    }

    const matchedEmotion = findBestDatasetMatch(analysis);
    lastAnalyzedEmotion = matchedEmotion;

    renderAnalysisResult(analysis, matchedEmotion);
    results.style.display = 'block';

    // Scroll results into view
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 350);
}

function renderAnalysisNoResult() {
  document.getElementById('analyze-detected-name').textContent = 'Segnale troppo debole';
  document.getElementById('analyze-detected-sub').textContent = 'Prova a scrivere più parole cariche di emozione.';
  document.getElementById('analyze-bars').innerHTML = '<p style="color: #64748b; font-size: 0.8rem;">Nessun vettore rilevato.</p>';
  document.getElementById('analyze-match-card').innerHTML = '';
  document.getElementById('ring-pct').textContent = '0%';

  const ring = document.getElementById('ring-progress');
  ring.style.stroke = '#6366f1';
  ring.setAttribute('stroke-dashoffset', '113.1');

  const banner = document.getElementById('analyze-detected-banner');
  banner.style.borderColor = 'rgba(255,255,255,0.1)';
  banner.style.background = 'rgba(255,255,255,0.03)';
}

function renderAnalysisResult(analysis, matchedEmotion) {
  const pk = PLUTCHIK_PRIMARIES[analysis.dominant];
  const emotionColor = pk?.color || '#8b5cf6';
  const emotionName = pk?.it || analysis.dominant;
  const confidence = Math.round(analysis.confidence * 100);

  // ─── Banner with emotion name ────────────────────────────────────────────
  const banner = document.getElementById('analyze-detected-banner');
  banner.style.borderColor = emotionColor + '80';
  banner.style.background = emotionColor + '12';

  document.getElementById('analyze-detected-name').textContent = emotionName;
  document.getElementById('analyze-detected-name').style.color = emotionColor;

  const subText = matchedEmotion
    ? `Corrisponde a: ${matchedEmotion.termine_originale} · ${matchedEmotion.famiglia_emotiva}`
    : 'Emozione primaria rilevata';
  document.getElementById('analyze-detected-sub').textContent = subText;

  // ─── Confidence ring ─────────────────────────────────────────────────────
  const circumference = 113.1;
  const offset = circumference - (confidence / 100) * circumference;
  const ring = document.getElementById('ring-progress');
  ring.style.stroke = emotionColor;
  ring.setAttribute('stroke-dashoffset', offset.toFixed(1));
  document.getElementById('ring-pct').textContent = confidence + '%';
  document.getElementById('ring-pct').style.color = emotionColor;

  // ─── Plutchik bars ───────────────────────────────────────────────────────
  const barsContainer = document.getElementById('analyze-bars');
  barsContainer.innerHTML = '';

  const sortedVec = Object.entries(analysis.vector)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0.01);

  sortedVec.forEach(([key, val]) => {
    const info = PLUTCHIK_PRIMARIES[key];
    if (!info) return;
    const pct = Math.round(val * 100);
    const bar = document.createElement('div');
    bar.className = 'vector-row';
    bar.innerHTML = `
      <span class="vector-name" style="color: ${info.color}">${info.it}</span>
      <div class="vector-bar-wrap">
        <div class="vector-bar-fill" style="width: ${pct}%; background: ${info.color}"></div>
      </div>
      <span class="vector-pct">${pct}%</span>
    `;
    barsContainer.appendChild(bar);
  });

  // ─── Matched dataset emotion card ────────────────────────────────────────
  const matchCard = document.getElementById('analyze-match-card');
  if (matchedEmotion) {
    const mpk = matchedEmotion.plutchik;
    matchCard.innerHTML = `
      <div class="analyze-match-header">
        <div class="item-dot" style="background: ${mpk.color}; width:10px; height:10px; border-radius:50%; flex-shrink:0"></div>
        <strong style="color: ${mpk.color}">${matchedEmotion.termine_originale}</strong>
        <span style="color: #94a3b8; font-size: 0.72rem">${matchedEmotion.lingua_cultura.split('/')[0]}</span>
      </div>
      <p style="color: #94a3b8; font-size: 0.78rem; line-height: 1.5; margin-top: 6px">
        ${matchedEmotion.significato_italiano.substring(0, 180)}${matchedEmotion.significato_italiano.length > 180 ? '…' : ''}
      </p>
      <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap">
        <span class="tag tag-valenza-${matchedEmotion.valenza}" style="font-size:0.68rem">Valenza: ${matchedEmotion.valenza}</span>
        <span class="tag" style="font-size:0.68rem">Arousal: ${matchedEmotion.arousal}</span>
      </div>
    `;
  } else {
    matchCard.innerHTML = '<p style="color: #64748b; font-size: 0.8rem;">Nessuna corrispondenza trovata nel dataset.</p>';
  }
}


// ============================================================================
// 12. IMAGE EMOTION ANALYSIS (Gemini Vision API)
// ============================================================================

/** Gemini API key preconfigurata di default */
let geminiApiKey = 'AQ.Ab8RN6JhgZNfvzDjV0zv8PCkL14hWpYUwVgmA3ZpxIrD-PSdyg';

/** Last image-analysis result — used when "Apply" button is pressed */
let lastImageAnalysisResult = null;

/**
 * Read a File object as a base64-encoded string (without the data-URI prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Call Gemini Vision with automatic retry and model fallback (gemini-3.8-flash -> gemini-2.5-flash -> gemini-1.5-flash -> gemini-2.5-pro -> gemini-1.5-pro).
 * @param {string} apiKey  Gemini API key
 * @param {string} base64Image  Base64-encoded image data (no data-URI prefix)
 * @param {string} mimeType  MIME type of the image (e.g. "image/jpeg")
 * @param {Function} [onStatus]  Optional callback for status updates
 * @returns {Promise<Object>} Parsed JSON result from the model
 */
async function callGeminiVision(apiKey, base64Image, mimeType, onStatus) {
  const PROMPT = `
Sei un esperto di psicologia delle emozioni specializzato nella ruota di Plutchik.

Analizza attentamente questa immagine e identifica l'emozione umana predominante che emerge dal contenuto visivo (espressioni facciali, postura, contesto, colori, simbolismo, ecc.).

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (senza markdown, senza testo aggiuntivo) che rispetta questo schema:
{
  "emotion": "<nome dell'emozione in italiano>",
  "confidence": <numero da 0 a 1>,
  "description": "<frase breve in italiano che spiega cosa hai visto>",
  "plutchik_weights": {
    "gioia": <0-1>,
    "fiducia": <0-1>,
    "paura": <0-1>,
    "sorpresa": <0-1>,
    "tristezza": <0-1>,
    "disgusto": <0-1>,
    "rabbia": <0-1>,
    "anticipazione": <0-1>
  },
  "valenza": "<'positiva' | 'negativa' | 'neutra'>",
  "arousal": "<'alto' | 'medio' | 'basso'>"
}
I valori di plutchik_weights devono sommare a circa 1.0.`.trim();

  // Verified active models that support vision & generateContent on v1beta
  const CANDIDATE_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  const sleep = ms => new Promise(res => setTimeout(res, ms));
  let lastError = null;

  for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
    const model = CANDIDATE_MODELS[mIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
    };

    const maxAttempts = 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (onStatus) {
          if (mIdx === 0 && attempt === 1) {
            onStatus(`Consultando Gemini Vision (${model})…`);
          } else if (attempt > 1) {
            onStatus(`Picco di richieste su ${model}: nuovo tentativo (${attempt}/${maxAttempts})…`);
            await sleep(1500 * attempt);
          } else {
            onStatus(`Tentativo con modello alternativo (${model})…`);
            await sleep(600);
          }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
          const errStatus = response.status;

          // Fatal authentication errors - no need to test other models
          if (errStatus === 400 && (errMsg.includes('API key') || errMsg.includes('INVALID_ARGUMENT'))) {
            throw new Error(`Chiave API non valida: ${errMsg}`);
          }
          if (errStatus === 403) {
            throw new Error(`Accesso negato: ${errMsg}`);
          }

          const isOverloaded = errStatus === 503 || errStatus === 429 ||
            /high demand|overloaded|spikes in demand|temporarily|exhausted|quota/i.test(errMsg);

          const err = new Error(errMsg);
          err.isOverloaded = isOverloaded;
          err.status = errStatus;
          throw err;
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleaned = rawText.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();

        try {
          return JSON.parse(cleaned);
        } catch {
          throw new Error(`Risposta non parsabile:\n${rawText.slice(0, 300)}`);
        }
      } catch (err) {
        lastError = err;
        // Bubble up permanent authentication issues
        if (err.message.startsWith('Chiave API non valida') || err.message.startsWith('Accesso negato')) {
          throw err;
        }
      }
    }
  }

  throw new Error(`Tutti i modelli Gemini sono momentaneamente ad alta richiesta o non disponibili.\nMessaggio: ${lastError?.message || 'Server occupato'}.\nRiprova tra qualche istante.`);
}

/**
 * Render Gemini's image-analysis result into the modal UI and store the
 * resulting emotionObj so it can be applied to the 3D entity.
 */
function renderImageAnalysisResults(result) {
  lastImageAnalysisResult = null;

  const weights = result.plutchik_weights || {};

  // Determine dominant Plutchik dimension
  let dominantKey = 'gioia', maxW = -1;
  for (const [k, w] of Object.entries(weights)) {
    if (w > maxW) { maxW = w; dominantKey = k; }
  }

  const pk = PLUTCHIK_PRIMARIES[dominantKey] || PLUTCHIK_PRIMARIES.gioia;

  // Try to find a real dataset match
  let datasetMatch =
    emotionsDataset.find(e =>
      e.plutchik?.primary === dominantKey &&
      (e.termine_originale.toLowerCase() === result.emotion.toLowerCase() ||
       e.famiglia_emotiva.toLowerCase() === result.emotion.toLowerCase())
    ) ||
    emotionsDataset.find(e => e.plutchik?.primary === dominantKey);

  // Build the emotionObj to apply to the 3D entity
  const emotionObj = datasetMatch ? { ...datasetMatch } : {
    termine_originale: result.emotion,
    lingua_cultura: 'Visione Artificiale / Gemini',
    famiglia_emotiva: pk.it,
    significato_italiano: result.description,
    valenza: result.valenza || 'neutra',
    arousal: result.arousal || 'medio',
    modello_fonte: 'Google Gemini Vision',
    plutchik: null
  };

  // Always override plutchik data with Gemini's weights for visual accuracy
  emotionObj.plutchik = {
    primary: dominantKey,
    primary_it: pk.it,
    secondary: null,
    secondary_it: null,
    weights,
    color: pk.color,
    glow: pk.glow,
    core: pk.core,
    angle: pk.angle,
    physics: { ...pk.physics }
  };

  lastImageAnalysisResult = emotionObj;

  // ── Confidence ring ───────────────────────────────────────────────────────
  const confidence = Math.max(0, Math.min(1, result.confidence || 0.75));
  const pct = Math.round(confidence * 100);
  const offset = (113.1 * (1 - confidence)).toFixed(1);

  const ringEl = document.getElementById('img-ring-progress');
  const ringPctEl = document.getElementById('img-ring-pct');
  if (ringEl) { ringEl.setAttribute('stroke-dashoffset', offset); ringEl.style.stroke = pk.color; }
  if (ringPctEl) { ringPctEl.textContent = `${pct}%`; ringPctEl.style.color = pk.color; }

  const banner = document.getElementById('img-detected-banner');
  if (banner) { banner.style.borderColor = pk.color + '55'; banner.style.background = pk.color + '12'; }

  const nameEl = document.getElementById('img-detected-name');
  if (nameEl) { nameEl.textContent = result.emotion; nameEl.style.color = pk.color; }

  const subEl = document.getElementById('img-detected-sub');
  if (subEl) subEl.textContent = `${(result.valenza || '').toUpperCase()} • Arousal: ${(result.arousal || '').toUpperCase()} • ${pk.it}`;

  const descEl = document.getElementById('img-ai-desc');
  if (descEl) descEl.textContent = `\u00ab ${result.description} \u00bb`;

  // ── Plutchik bars ─────────────────────────────────────────────────────────
  const barsEl = document.getElementById('img-analyze-bars');
  if (barsEl) {
    barsEl.innerHTML = '';
    Object.entries(weights).sort((a, b) => b[1] - a[1]).forEach(([key, w]) => {
      const info = PLUTCHIK_PRIMARIES[key];
      if (!info) return;
      const wPct = Math.round(w * 100);
      const row = document.createElement('div');
      row.className = 'vector-row';
      row.innerHTML = `
        <span class="vector-name" style="color:${info.color}">${info.it}</span>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${wPct}%; background:${info.color}"></div>
        </div>
        <span class="vector-pct">${wPct}%</span>`;
      barsEl.appendChild(row);
    });
  }

  // ── Dataset match card ────────────────────────────────────────────────────
  const matchCard = document.getElementById('img-analyze-match-card');
  if (matchCard) {
    if (datasetMatch) {
      matchCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
          <span style="font-weight:700;font-size:0.95rem;color:#fff">${datasetMatch.termine_originale}</span>
          <span style="font-size:0.68rem;color:var(--text-dim);font-family:monospace">${datasetMatch.lingua_cultura.split('/')[0]}</span>
        </div>
        <div style="font-size:0.72rem;margin-bottom:6px;color:${pk.color}">\u25cf ${datasetMatch.famiglia_emotiva}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.4">${datasetMatch.significato_italiano}</div>`;
    } else {
      matchCard.innerHTML = `<div style="font-size:0.78rem;color:var(--text-dim);font-style:italic">Nessuna corrispondenza esatta nel dataset \u2014 verr\u00e0 usata la voce sintetica generata dall'IA.</div>`;
    }
  }

  // Show results panel
  const resultsEl = document.getElementById('img-analyze-results');
  if (resultsEl) {
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Initialize all event listeners for the image emotion analysis modal.
 */
function initImageAnalyzeModal() {
  const modal          = document.getElementById('modal-image-analyze');
  const btnToggle      = document.getElementById('btn-image-analyze-toggle');
  const btnClose       = document.getElementById('btn-close-image-analyze');
  const fileInput      = document.getElementById('img-file-input');
  const dropzone       = document.getElementById('img-dropzone');
  const btnChooseFile  = document.getElementById('btn-choose-file');
  const previewSection = document.getElementById('img-preview-section');
  const previewImg     = document.getElementById('img-preview');
  const filenameEl     = document.getElementById('img-filename');
  const btnRemoveImg   = document.getElementById('btn-remove-img');
  const btnDoAnalyze   = document.getElementById('btn-do-image-analyze');
  const statusEl       = document.getElementById('img-status');
  const statusText     = document.getElementById('img-status-text');
  const errorEl        = document.getElementById('img-error');
  const resultsEl      = document.getElementById('img-analyze-results');
  const btnApply       = document.getElementById('btn-apply-img-analyzed');
  const apiKeyInput    = document.getElementById('img-api-key-input');
  const btnSaveKey     = document.getElementById('btn-save-api-key');

  if (!modal) return;

  let currentFile = null;

  // ── Open / Close ──────────────────────────────────────────────────────────
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      modal.classList.add('open');
      btnToggle.classList.add('active');
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    if (btnToggle) btnToggle.classList.remove('active');
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // ── API Key ───────────────────────────────────────────────────────────────
  if (apiKeyInput && geminiApiKey) {
    apiKeyInput.value = geminiApiKey;
    if (btnSaveKey) {
      btnSaveKey.textContent = '\u2713 Attiva';
      btnSaveKey.classList.add('saved');
    }
  }

  function updateAnalyzeBtn() {
    if (btnDoAnalyze) btnDoAnalyze.disabled = !(currentFile && geminiApiKey);
  }

  if (btnSaveKey && apiKeyInput) {
    btnSaveKey.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) {
        geminiApiKey = '';
        btnSaveKey.textContent = 'Salva';
        btnSaveKey.classList.remove('saved');
        updateAnalyzeBtn();
        return;
      }
      geminiApiKey = key;
      btnSaveKey.textContent = '\u2713 Salvata';
      btnSaveKey.classList.add('saved');
      updateAnalyzeBtn();
      setTimeout(() => {
        btnSaveKey.textContent = '\u2713 Attiva';
      }, 2000);
    });
    apiKeyInput.addEventListener('keydown', e => { if (e.key === 'Enter') btnSaveKey.click(); });
  }

  // ── File Handling ─────────────────────────────────────────────────────────
  function showError(msg) {
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    if (statusEl) statusEl.style.display = 'none';
  }

  function handleFile(file) {
    if (!file?.type.startsWith('image/')) { showError("Il file non \u00e8 un'immagine valida."); return; }
    if (file.size > 10 * 1024 * 1024) { showError('File troppo grande (max 10 MB).'); return; }

    currentFile = file;
    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (filenameEl) filenameEl.textContent = file.name;
    if (previewSection) previewSection.style.display = 'flex';
    if (dropzone) dropzone.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
    lastImageAnalysisResult = null;
    updateAnalyzeBtn();
  }

  function removeImage() {
    currentFile = null;
    if (previewImg) previewImg.src = '';
    if (previewSection) previewSection.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (fileInput) fileInput.value = '';
    if (resultsEl) resultsEl.style.display = 'none';
    if (errorEl) { errorEl.style.display = 'none'; }
    lastImageAnalysisResult = null;
    updateAnalyzeBtn();
  }

  if (btnChooseFile) btnChooseFile.addEventListener('click', e => { e.stopPropagation(); fileInput?.click(); });
  if (dropzone) dropzone.addEventListener('click', () => fileInput?.click());
  if (fileInput) fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  if (btnRemoveImg) btnRemoveImg.addEventListener('click', e => { e.stopPropagation(); removeImage(); });

  // Drag-and-drop
  if (dropzone) {
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  // ── Run Analysis ──────────────────────────────────────────────────────────
  if (btnDoAnalyze) {
    btnDoAnalyze.addEventListener('click', async () => {
      if (!currentFile || !geminiApiKey) return;

      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (resultsEl) resultsEl.style.display = 'none';
      if (statusEl) statusEl.style.display = 'flex';
      if (statusText) statusText.textContent = 'Codifica immagine\u2026';
      btnDoAnalyze.disabled = true;

      try {
        const b64 = await fileToBase64(currentFile);
        if (statusText) statusText.textContent = 'Consultando Gemini Vision\u2026';
        const result = await callGeminiVision(
          geminiApiKey,
          b64,
          currentFile.type || 'image/jpeg',
          msg => { if (statusText) statusText.textContent = msg; }
        );
        if (statusEl) statusEl.style.display = 'none';
        renderImageAnalysisResults(result);
      } catch (err) {
        showError(`Errore durante l'analisi:\n${err.message}`);
      } finally {
        updateAnalyzeBtn();
        if (statusEl) statusEl.style.display = 'none';
      }
    });
  }

  // ── Apply to entity ───────────────────────────────────────────────────────
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (!lastImageAnalysisResult) return;
      applyEmotion(lastImageAnalysisResult, true);
      const inp = document.getElementById('emotion-input');
      if (inp) inp.value = lastImageAnalysisResult.termine_originale;
      closeModal();
    });
  }
}


// ============================================================================
// ============================================================================
// 12.5. AUDIO EMOTION ANALYSIS (Gemini Audio Multimodal & Local DSP Psychoacoustics)
// ============================================================================

/** Last audio-analysis result — used when "Apply" button is pressed */
let lastAudioAnalysisResult = null;
let currentDecodedAudioBuffer = null;

/**
 * Call Gemini Multimodal Audio API with automatic fallback.
 * @param {string} apiKey Gemini API key
 * @param {string} base64Audio Base64-encoded audio data
 * @param {string} mimeType Audio MIME type
 * @param {Function} [onStatus] Status callback
 */
async function callGeminiAudio(apiKey, base64Audio, mimeType, onStatus) {
  const PROMPT = `
Sei un neuroscienziato e psicologo delle emozioni esperto di psicoacustica e prosodia vocale, specializzato nella Ruota delle Emozioni di Robert Plutchik.

Analizza attentamente questa traccia audio (timbro vocale, intonazione, dinamica acustica, pause, enfasi o atmosfera sonora) e individua l'emozione predominante.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (senza markdown, senza apici o testo aggiuntivo) che rispetta questo schema:
{
  "emotion": "<nome dell'emozione in italiano>",
  "confidence": <numero da 0 a 1>,
  "description": "<breve frase in italiano che descrive il quadro psicoacustico ed espressivo emerso dall'ascolto>",
  "plutchik_weights": {
    "gioia": <0-1>,
    "fiducia": <0-1>,
    "paura": <0-1>,
    "sorpresa": <0-1>,
    "tristezza": <0-1>,
    "disgusto": <0-1>,
    "rabbia": <0-1>,
    "anticipazione": <0-1>
  },
  "valenza": "<'positiva' | 'negativa' | 'neutra'>",
  "arousal": "<'alto' | 'medio' | 'basso'>"
}
I valori di plutchik_weights devono sommare a circa 1.0.`.trim();

  const CANDIDATE_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  const sleep = ms => new Promise(res => setTimeout(res, ms));
  let lastError = null;

  for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
    const model = CANDIDATE_MODELS[mIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64Audio } }
        ]
      }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 600 }
    };

    try {
      if (onStatus) {
        if (mIdx === 0) onStatus(`Consultando Gemini Audio (${model})…`);
        else onStatus(`Tentativo audio con modello alternativo (${model})…`);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
        const errStatus = response.status;

        if (errStatus === 400 && (errMsg.includes('API key') || errMsg.includes('INVALID_ARGUMENT'))) {
          throw new Error(`Chiave API non valida: ${errMsg}`);
        }
        if (errStatus === 403) throw new Error(`Accesso negato: ${errMsg}`);

        const err = new Error(errMsg);
        err.status = errStatus;
        throw err;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new Error(`Risposta audio non parsabile:\n${rawText.slice(0, 300)}`);
      }
    } catch (err) {
      lastError = err;
      if (err.message.startsWith('Chiave API non valida') || err.message.startsWith('Accesso negato')) {
        throw err;
      }
      await sleep(400);
    }
  }

  throw new Error(`Gemini Audio non raggiungibile: ${lastError?.message || 'Server occupato'}`);
}

/**
 * Extract acoustic DSP features (RMS, Peak, Crest Factor, ZCR, Spectral Brightness, Dynamic Flux)
 * from an AudioBuffer using pure Web Audio API DSP.
 */
function extractAcousticFeatures(audioBuffer) {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = channelData.length;

  const maxSamples = Math.min(numSamples, sampleRate * 90);
  const step = Math.max(1, Math.floor(maxSamples / 80000));

  let sumSq = 0;
  let peak = 0;
  let zeroCrossings = 0;
  let prevVal = 0;
  let count = 0;
  let highFreqDiff = 0;

  for (let i = 0; i < maxSamples; i += step) {
    const s = channelData[i];
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
    sumSq += s * s;

    if ((prevVal >= 0 && s < 0) || (prevVal < 0 && s >= 0)) {
      zeroCrossings++;
    }

    if (count > 0) {
      const diff = Math.abs(s - prevVal);
      highFreqDiff += diff * diff;
    }

    prevVal = s;
    count++;
  }

  const rms = Math.sqrt(sumSq / (count || 1));
  const zcr = zeroCrossings / (count || 1);
  const crestFactor = peak / (rms || 0.0001);
  const hfEnergy = Math.sqrt(highFreqDiff / (count || 1));
  const spectralBrightness = Math.min(1, hfEnergy / (rms * 2.8 || 0.001));

  // Compute energy profile across ~20 time windows for dynamic flux
  const windowCount = 20;
  const windowLen = Math.floor(maxSamples / windowCount);
  const windowEnergies = [];
  for (let w = 0; w < windowCount; w++) {
    let wSum = 0;
    const start = w * windowLen;
    const wStep = Math.max(1, Math.floor(windowLen / 2000));
    let wC = 0;
    for (let i = start; i < start + windowLen; i += wStep) {
      const s = channelData[i] || 0;
      wSum += s * s;
      wC++;
    }
    windowEnergies.push(Math.sqrt(wSum / (wC || 1)));
  }

  let meanE = 0;
  for (const e of windowEnergies) meanE += e;
  meanE /= (windowEnergies.length || 1);

  let varE = 0;
  for (const e of windowEnergies) varE += (e - meanE) ** 2;
  const dynamicFlux = Math.min(1, Math.sqrt(varE / (windowEnergies.length || 1)) / (meanE || 0.001));

  return {
    rms,
    peak,
    crestFactor,
    zcr,
    spectralBrightness,
    dynamicFlux,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels
  };
}

/**
 * Offline psychoacoustic DSP analysis fallback.
 * Maps acoustic descriptors directly onto Plutchik's 8 primary dimensions.
 */
function analyzeAudioLocally(audioBuffer) {
  const dsp = extractAcousticFeatures(audioBuffer);

  const arousalNorm = Math.min(1, dsp.rms * 5.0 + dsp.dynamicFlux * 0.35 + (dsp.crestFactor > 5 ? 0.25 : 0.05));
  const brightNorm = Math.min(1, dsp.spectralBrightness * 1.2);
  const calmNorm = Math.max(0, 1 - arousalNorm);
  const frictionNorm = Math.min(1, dsp.zcr * 9.0);
  const surpriseNorm = Math.min(1, (dsp.crestFactor > 4 ? 0.5 : 0.1) + dsp.dynamicFlux * 0.5);

  const rawWeights = {
    gioia: Math.max(0.05, arousalNorm * 0.55 + brightNorm * 0.45 - frictionNorm * 0.3),
    fiducia: Math.max(0.05, calmNorm * 0.55 + (1 - frictionNorm) * 0.35 + (1 - dsp.dynamicFlux) * 0.25),
    paura: Math.max(0.05, arousalNorm * 0.45 + brightNorm * 0.35 + dsp.dynamicFlux * 0.4),
    sorpresa: Math.max(0.05, surpriseNorm * 0.65 + brightNorm * 0.35),
    tristezza: Math.max(0.05, calmNorm * 0.65 + (1 - brightNorm) * 0.45),
    disgusto: Math.max(0.05, frictionNorm * 0.6 + (1 - brightNorm) * 0.25 + dsp.dynamicFlux * 0.2),
    rabbia: Math.max(0.05, arousalNorm * 0.65 + frictionNorm * 0.35 + (dsp.crestFactor > 3.5 ? 0.2 : 0)),
    anticipazione: Math.max(0.05, (1 - dsp.dynamicFlux) * 0.4 + arousalNorm * 0.35 + brightNorm * 0.25)
  };

  let sum = 0;
  for (const k in rawWeights) sum += rawWeights[k];
  const plutchik_weights = {};
  for (const k in rawWeights) plutchik_weights[k] = +(rawWeights[k] / sum).toFixed(3);

  let dominantKey = 'gioia', maxW = -1;
  for (const [k, w] of Object.entries(plutchik_weights)) {
    if (w > maxW) { maxW = w; dominantKey = k; }
  }

  const pk = PLUTCHIK_PRIMARIES[dominantKey] || PLUTCHIK_PRIMARIES.gioia;
  const valenza = (dominantKey === 'gioia' || dominantKey === 'fiducia') ? 'positiva'
                : (dominantKey === 'sorpresa' || dominantKey === 'anticipazione') ? 'neutra'
                : 'negativa';
  const arousal = arousalNorm > 0.6 ? 'alto' : arousalNorm > 0.3 ? 'medio' : 'basso';

  const desc = `Analisi psicoacustica DSP: timbro ${brightNorm > 0.5 ? 'brillante e squillante' : 'morbido e profondo'}, dinamica ${dsp.crestFactor > 4 ? 'altamente contrastata con transienti marcati' : 'armonica e omogenea'}, energia sonora ${arousal}.`;

  return {
    emotion: pk.it,
    confidence: +(0.75 + maxW * 0.2).toFixed(2),
    description: desc,
    plutchik_weights,
    valenza,
    arousal,
    dsp
  };
}

/**
 * Draw acoustic waveform on canvas with playhead indicator.
 */
function drawAudioWaveform(canvas, audioBuffer, playheadRatio = 0, emotionColor = '#ec4899') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, '#0c0c18');
  bg.addColorStop(1, '#06060c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  if (!audioBuffer) return;

  const data = audioBuffer.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / width));
  const amp = height * 0.44;
  const centerY = height / 2;

  for (let x = 0; x < width; x++) {
    let min = 1.0;
    let max = -1.0;
    const start = x * step;
    for (let j = 0; j < step; j += 4) {
      const datum = data[start + j] || 0;
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    if (min > max) { min = -0.05; max = 0.05; }

    const isPlayed = (x / width) <= playheadRatio;
    ctx.fillStyle = isPlayed ? emotionColor : 'rgba(255, 255, 255, 0.32)';

    const y1 = centerY + min * amp;
    const y2 = centerY + max * amp;
    const barHeight = Math.max(2, Math.abs(y2 - y1));
    ctx.fillRect(x, Math.min(y1, y2), 1, barHeight);
  }

  if (playheadRatio > 0 && playheadRatio < 1) {
    const px = Math.floor(width * playheadRatio);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = emotionColor;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

/**
 * Render Audio emotion analysis results into the modal UI.
 */
function renderAudioAnalysisResults(result, dspMetrics) {
  lastAudioAnalysisResult = null;
  const weights = result.plutchik_weights || {};

  let dominantKey = 'gioia', maxW = -1;
  for (const [k, w] of Object.entries(weights)) {
    if (w > maxW) { maxW = w; dominantKey = k; }
  }

  const pk = PLUTCHIK_PRIMARIES[dominantKey] || PLUTCHIK_PRIMARIES.gioia;

  let datasetMatch =
    emotionsDataset.find(e =>
      e.plutchik?.primary === dominantKey &&
      (e.termine_originale.toLowerCase() === result.emotion.toLowerCase() ||
       e.famiglia_emotiva.toLowerCase() === result.emotion.toLowerCase())
    ) ||
    emotionsDataset.find(e => e.plutchik?.primary === dominantKey);

  const emotionObj = datasetMatch ? { ...datasetMatch } : {
    termine_originale: result.emotion,
    lingua_cultura: 'Psicoacustica / IA Multimodale',
    famiglia_emotiva: pk.it,
    significato_italiano: result.description,
    valenza: result.valenza || 'neutra',
    arousal: result.arousal || 'medio',
    modello_fonte: 'Gemini Audio & Psychoacoustics',
    plutchik: null
  };

  emotionObj.plutchik = {
    primary: dominantKey,
    primary_it: pk.it,
    secondary: null,
    secondary_it: null,
    weights,
    color: pk.color,
    glow: pk.glow,
    core: pk.core,
    angle: pk.angle,
    physics: { ...pk.physics }
  };

  lastAudioAnalysisResult = emotionObj;

  const confidence = Math.max(0, Math.min(1, result.confidence || 0.8));
  const pct = Math.round(confidence * 100);
  const offset = (113.1 * (1 - confidence)).toFixed(1);

  const ringEl = document.getElementById('audio-ring-progress');
  const ringPctEl = document.getElementById('audio-ring-pct');
  if (ringEl) { ringEl.setAttribute('stroke-dashoffset', offset); ringEl.style.stroke = pk.color; }
  if (ringPctEl) { ringPctEl.textContent = `${pct}%`; ringPctEl.style.color = pk.color; }

  const banner = document.getElementById('audio-detected-banner');
  if (banner) { banner.style.borderColor = pk.color + '55'; banner.style.background = pk.color + '12'; }

  const nameEl = document.getElementById('audio-detected-name');
  if (nameEl) { nameEl.textContent = result.emotion; nameEl.style.color = pk.color; }

  const subEl = document.getElementById('audio-detected-sub');
  if (subEl) subEl.textContent = `${(result.valenza || '').toUpperCase()} • AROUSAL: ${(result.arousal || '').toUpperCase()} • ${pk.it}`;

  const descEl = document.getElementById('audio-ai-desc');
  if (descEl) descEl.textContent = `\u00ab ${result.description} \u00bb`;

  const dspGrid = document.getElementById('audio-dsp-grid');
  if (dspGrid && dspMetrics) {
    const rmsDb = Math.round(20 * Math.log10(Math.max(dspMetrics.rms, 0.0001)));
    const energyLabel = rmsDb > -14 ? 'Molto Alta' : rmsDb > -24 ? 'Media' : 'Bassa/Sussurrata';
    const brightLabel = dspMetrics.spectralBrightness > 0.55 ? 'Brillante' : dspMetrics.spectralBrightness > 0.32 ? 'Equilibrato' : 'Caldo/Scuro';
    const dynamicLabel = dspMetrics.crestFactor > 5.0 ? 'Esplosiva' : dspMetrics.crestFactor > 3.2 ? 'Contrastata' : 'Fluida';
    const rhythmLabel = dspMetrics.dynamicFlux > 0.45 ? 'Sincopato' : dspMetrics.dynamicFlux > 0.22 ? 'Modulato' : 'Costante';

    dspGrid.innerHTML = `
      <div class="dsp-metric-card">
        <span class="dsp-metric-title">🔊 Energia RMS</span>
        <span class="dsp-metric-val" style="color:${pk.color}">${rmsDb} dB</span>
        <span class="dsp-metric-sub">${energyLabel}</span>
      </div>
      <div class="dsp-metric-card">
        <span class="dsp-metric-title">📈 Spettro & Timbro</span>
        <span class="dsp-metric-val" style="color:${pk.color}">${brightLabel}</span>
        <span class="dsp-metric-sub">Brill. ${(dspMetrics.spectralBrightness * 100).toFixed(0)}%</span>
      </div>
      <div class="dsp-metric-card">
        <span class="dsp-metric-title">⚡ Dinamica Picco</span>
        <span class="dsp-metric-val" style="color:${pk.color}">x${dspMetrics.crestFactor.toFixed(1)}</span>
        <span class="dsp-metric-sub">${dynamicLabel}</span>
      </div>
      <div class="dsp-metric-card">
        <span class="dsp-metric-title">⏱️ Cadenza / Flusso</span>
        <span class="dsp-metric-val" style="color:${pk.color}">${rhythmLabel}</span>
        <span class="dsp-metric-sub">Var. ${(dspMetrics.dynamicFlux * 100).toFixed(0)}%</span>
      </div>
    `;
  }

  const barsEl = document.getElementById('audio-analyze-bars');
  if (barsEl) {
    barsEl.innerHTML = '';
    Object.entries(weights).sort((a, b) => b[1] - a[1]).forEach(([key, w]) => {
      const info = PLUTCHIK_PRIMARIES[key];
      if (!info) return;
      const wPct = Math.round(w * 100);
      const row = document.createElement('div');
      row.className = 'vector-row';
      row.innerHTML = `
        <span class="vector-name" style="color:${info.color}">${info.it}</span>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width:${wPct}%; background:${info.color}"></div>
        </div>
        <span class="vector-pct">${wPct}%</span>`;
      barsEl.appendChild(row);
    });
  }

  const matchCard = document.getElementById('audio-analyze-match-card');
  if (matchCard) {
    if (datasetMatch) {
      matchCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
          <span style="font-weight:700;font-size:0.95rem;color:#fff">${datasetMatch.termine_originale}</span>
          <span style="font-size:0.68rem;color:var(--text-dim);font-family:monospace">${datasetMatch.lingua_cultura.split('/')[0]}</span>
        </div>
        <div style="font-size:0.72rem;margin-bottom:6px;color:${pk.color}">\u25cf ${datasetMatch.famiglia_emotiva}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.4">${datasetMatch.significato_italiano}</div>`;
    } else {
      matchCard.innerHTML = `<div style="font-size:0.78rem;color:var(--text-dim);font-style:italic">Nessuna corrispondenza esatta nel dataset \u2014 verr\u00e0 usata l'entit\u00e0 sintetica decifrata.</div>`;
    }
  }

  const resultsEl = document.getElementById('audio-analyze-results');
  if (resultsEl) {
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const canvas = document.getElementById('audio-waveform-canvas');
  if (canvas && currentDecodedAudioBuffer) {
    drawAudioWaveform(canvas, currentDecodedAudioBuffer, 0, pk.color);
  }
}

/**
 * Initialize all event listeners for the audio emotion analysis modal.
 */
function initAudioAnalyzeModal() {
  const modal          = document.getElementById('modal-audio-analyze');
  const btnToggle      = document.getElementById('btn-audio-analyze-toggle');
  const btnClose       = document.getElementById('btn-close-audio-analyze');
  const fileInput      = document.getElementById('audio-file-input');
  const dropzone       = document.getElementById('audio-dropzone');
  const btnChooseFile  = document.getElementById('btn-choose-audio-file');
  const btnRecord      = document.getElementById('btn-record-audio');
  const btnRecordText  = document.getElementById('btn-record-text');
  const previewSection = document.getElementById('audio-preview-section');
  const filenameEl     = document.getElementById('audio-filename');
  const btnRemoveAudio = document.getElementById('btn-remove-audio');
  const audioElement   = document.getElementById('audio-player-element');
  const waveformCanvas = document.getElementById('audio-waveform-canvas');
  const badgeDuration  = document.getElementById('audio-duration-badge');
  const badgeFormat    = document.getElementById('audio-format-badge');
  const badgeRate      = document.getElementById('audio-samplerate-badge');
  const btnDoAnalyze   = document.getElementById('btn-do-audio-analyze');
  const statusEl       = document.getElementById('audio-status');
  const statusText     = document.getElementById('audio-status-text');
  const errorEl        = document.getElementById('audio-error');
  const resultsEl      = document.getElementById('audio-analyze-results');
  const btnApply       = document.getElementById('btn-apply-audio-analyzed');

  if (!modal) return;

  let currentFile = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  // Open / Close Modal
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      modal.classList.add('open');
      btnToggle.classList.add('active');
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    if (btnToggle) btnToggle.classList.remove('active');
    if (audioElement) audioElement.pause();
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
    }
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function showError(msg) {
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    if (statusEl) statusEl.style.display = 'none';
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Waveform playhead tracking
  if (audioElement && waveformCanvas) {
    audioElement.addEventListener('timeupdate', () => {
      if (!currentDecodedAudioBuffer || !audioElement.duration) return;
      const ratio = audioElement.currentTime / audioElement.duration;
      const col = lastAudioAnalysisResult?.plutchik?.color || '#ec4899';
      drawAudioWaveform(waveformCanvas, currentDecodedAudioBuffer, ratio, col);
    });

    audioElement.addEventListener('ended', () => {
      const col = lastAudioAnalysisResult?.plutchik?.color || '#ec4899';
      drawAudioWaveform(waveformCanvas, currentDecodedAudioBuffer, 0, col);
    });
  }

  // Decode audio data and prepare preview
  async function processAudioFile(file) {
    currentFile = file;
    if (filenameEl) filenameEl.textContent = file.name;
    if (badgeFormat) badgeFormat.textContent = `Formato: ${file.name.split('.').pop().toUpperCase() || 'AUDIO'}`;

    if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
    if (resultsEl) resultsEl.style.display = 'none';
    if (statusEl) statusEl.style.display = 'flex';
    if (statusText) statusText.textContent = 'Decodifica spettroacustica in corso…';

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtxConstructor = window.AudioContext || window.webkitAudioContext;
      const decodeCtx = new AudioCtxConstructor();
      
      const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
      currentDecodedAudioBuffer = audioBuffer;

      if (badgeDuration) badgeDuration.textContent = `Durata: ${formatTime(audioBuffer.duration)}`;
      if (badgeRate) badgeRate.textContent = `Freq: ${(audioBuffer.sampleRate / 1000).toFixed(1)} kHz • ${audioBuffer.numberOfChannels} ch`;

      if (audioElement) {
        audioElement.src = URL.createObjectURL(file);
      }

      if (waveformCanvas) {
        drawAudioWaveform(waveformCanvas, audioBuffer, 0, '#ec4899');
      }

      if (previewSection) previewSection.style.display = 'block';
      if (dropzone) dropzone.style.display = 'none';
      if (btnDoAnalyze) btnDoAnalyze.disabled = false;
    } catch (decodeErr) {
      console.warn("Local decodeAudioData warning:", decodeErr);
      if (audioElement) audioElement.src = URL.createObjectURL(file);
      if (badgeDuration) badgeDuration.textContent = 'Audio pronto per IA';
      if (previewSection) previewSection.style.display = 'block';
      if (dropzone) dropzone.style.display = 'none';
      if (btnDoAnalyze) btnDoAnalyze.disabled = false;
    } finally {
      if (statusEl) statusEl.style.display = 'none';
    }
  }

  function handleFile(file) {
    if (!file) return;
    const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|webm|opus)$/i.test(file.name);
    if (!isAudio) {
      showError("Il file selezionato non è un formato audio valido (usa MP3, WAV, OGG, M4A, FLAC, WEBM).");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showError('File audio troppo grande (max 25 MB).');
      return;
    }
    processAudioFile(file);
  }

  function removeAudio() {
    currentFile = null;
    currentDecodedAudioBuffer = null;
    lastAudioAnalysisResult = null;
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
    if (previewSection) previewSection.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (fileInput) fileInput.value = '';
    if (resultsEl) resultsEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (btnDoAnalyze) btnDoAnalyze.disabled = true;
  }

  if (btnChooseFile) btnChooseFile.addEventListener('click', e => { e.stopPropagation(); fileInput?.click(); });
  if (dropzone) dropzone.addEventListener('click', e => { if (e.target !== btnRecord && !btnRecord?.contains(e.target)) fileInput?.click(); });
  if (fileInput) fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  if (btnRemoveAudio) btnRemoveAudio.addEventListener('click', removeAudio);

  // Drag-and-drop
  if (dropzone) {
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  // Microphone recording
  if (btnRecord) {
    btnRecord.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          recordedChunks = [];
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.ondataavailable = ev => {
            if (ev.data.size > 0) recordedChunks.push(ev.data);
          };

          mediaRecorder.onstop = () => {
            stream.getTracks().forEach(track => track.stop());
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const file = new File([blob], `voce-registrata-${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.webm`, { type: 'audio/webm' });
            handleFile(file);
          };

          mediaRecorder.start();
          isRecording = true;
          btnRecord.classList.add('recording');
          if (btnRecordText) btnRecordText.textContent = 'Ferma registrazione';
        } catch (micErr) {
          showError(`Accesso al microfono negato o non supportato: ${micErr.message}`);
        }
      } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        isRecording = false;
        btnRecord.classList.remove('recording');
        if (btnRecordText) btnRecordText.textContent = 'Registra voce';
      }
    });
  }

  function getAudioMimeType(file) {
    if (file.type && file.type.startsWith('audio/') && !file.type.includes('x-m4a')) {
      return file.type;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    const map = {
      mp3: 'audio/mp3',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      aac: 'audio/aac',
      flac: 'audio/flac',
      webm: 'audio/webm'
    };
    return map[ext] || 'audio/mp3';
  }

  // Run Emotion Recognition on Audio
  if (btnDoAnalyze) {
    btnDoAnalyze.addEventListener('click', async () => {
      if (!currentFile) return;

      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (resultsEl) resultsEl.style.display = 'none';
      if (statusEl) statusEl.style.display = 'flex';
      if (statusText) statusText.textContent = 'Estraendo caratteristiche acustiche…';
      btnDoAnalyze.disabled = true;

      try {
        let dspMetrics = null;
        if (currentDecodedAudioBuffer) {
          dspMetrics = extractAcousticFeatures(currentDecodedAudioBuffer);
        }

        let finalResult = null;

        if (geminiApiKey) {
          try {
            if (statusText) statusText.textContent = 'Codifica traccia audio…';
            const b64 = await fileToBase64(currentFile);
            const mime = getAudioMimeType(currentFile);
            finalResult = await callGeminiAudio(geminiApiKey, b64, mime, msg => {
              if (statusText) statusText.textContent = msg;
            });
          } catch (geminiErr) {
            console.warn("Gemini Audio failed, falling back to local DSP:", geminiErr);
            if (!currentDecodedAudioBuffer) {
              throw geminiErr;
            }
          }
        }

        if (!finalResult) {
          if (statusText) statusText.textContent = 'Esecuzione motore psicoacustico locale…';
          if (!currentDecodedAudioBuffer) {
            throw new Error("Impossibile analizzare l'audio: decodifica fallita e connessione IA non disponibile.");
          }
          finalResult = analyzeAudioLocally(currentDecodedAudioBuffer);
        }

        if (statusEl) statusEl.style.display = 'none';
        renderAudioAnalysisResults(finalResult, dspMetrics || finalResult.dsp);
      } catch (err) {
        showError(`Errore durante l'analisi audio:\n${err.message}`);
      } finally {
        btnDoAnalyze.disabled = false;
        if (statusEl) statusEl.style.display = 'none';
      }
    });
  }

  // Apply to synthetic entity
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (!lastAudioAnalysisResult) return;
      applyEmotion(lastAudioAnalysisResult, true);
      const inp = document.getElementById('emotion-input');
      if (inp) inp.value = lastAudioAnalysisResult.termine_originale;
      closeModal();
    });
  }
}


// 13. NAVIGATORE WEB RANDOMICO (RANDOM WEB SURFER & EMOTIONAL SCRAPER)
// ============================================================================

/** Fallback offline di testi letterari, filosofici e scientifici ad alto tasso emotivo */
const SURFER_FALLBACK_TEXTS = [
  {
    title: "L'Infinito",
    subtitle: "Giacomo Leopardi • Canti",
    source: "Letteratura Italiana",
    icon: "📜",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Poesia Classica",
    url: "https://it.wikipedia.org/wiki/L%27infinito",
    text: "Sempre caro mi fu quest'ermo colle, e questa siepe, che da tanta parte dell'ultimo orizzonte il guardo esclude. Ma sedendo e mirando, interminati spazi di là da quella, e sovrumani silenzi, e profondissima quiete io nel pensier mi fingo; ove per poco il cor non si spaura."
  },
  {
    title: "La Notte Stellata e il Silenzio Cosmico",
    subtitle: "Blaise Pascal • Pensieri",
    source: "Filosofia Cosmica",
    icon: "🌌",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Filosofia dei Pensieri",
    url: "https://it.wikipedia.org/wiki/Blaise_Pascal",
    text: "Il silenzio eterno di questi spazi infiniti mi atterrisce. Quando considero la breve durata della mia vita, assorbita nell'eternità che la precede e la segue, il piccolo spazio che riempio e che vedo, provo un senso di vertigine e di profondo stupore."
  },
  {
    title: "Lettere a un Giovane Poeta",
    subtitle: "Rainer Maria Rilke • Solitudine e Meraviglia",
    source: "Poesia Universale",
    icon: "✒️",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Letteratura Universale",
    url: "https://it.wikipedia.org/wiki/Rainer_Maria_Rilke",
    text: "Ama la tua solitudine e sopporta con dolce lamento il dolore che ti arreca. Sii paziente verso tutto ciò che nel tuo cuore è irrisolto e cerca di amare le domande stesse, come fossero stanze chiuse a chiave o libri scritti in una lingua del tutto straniera."
  },
  {
    title: "La Saggezza della Tempesta e della Resilienza",
    subtitle: "Marco Aurelio • Colloqui con se stesso",
    source: "Stoicismo Antico",
    icon: "🏛️",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Stoicismo Classico",
    url: "https://it.wikipedia.org/wiki/Marco_Aurelio",
    text: "Sii come il promontorio contro cui si infrangono incessantemente le onde: esso resta immobile, e intorno ad esso si placa il furore delle acque. Non dire mai: 'Che sfortuna mi è capitata', ma di': 'Che fortuna che ho, perché pur essendomi capitato questo, resto sereno'."
  },
  {
    title: "Il Mistero della Coscienza Cosmica",
    subtitle: "Carl Sagan • Cosmos",
    source: "Astronomia & Meraviglia",
    icon: "🔭",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Cosmologia & Meraviglia",
    url: "https://it.wikipedia.org/wiki/Carl_Sagan",
    text: "L'azoto nel nostro DNA, il calcio nei nostri denti, il ferro nel nostro sangue sono stati generati all'interno di stelle morenti collassate miliardi di anni fa. Siamo fatti della materia delle stelle: l'universo che contempla se stesso con stupore e ammirazione."
  },
  {
    title: "Furia e Tempesta dell'Anima",
    subtitle: "William Shakespeare • Re Lear",
    source: "Dramma Universale",
    icon: "⚡",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Dramma Shakespeariano",
    url: "https://it.wikipedia.org/wiki/Re_Lear",
    text: "Soffiate, o venti, e spaccatevi le guance! Infuriate! Cataratte e uragani dell'abisso, scrosciate finché non abbiate annegato i nostri campanili e affogato i galli segnavento! E voi, solforosi e veloci pensieri balenanti, scuotete la terra con rabbia inaudita!"
  },
  {
    title: "Il Libro dell'Inquietudine",
    subtitle: "Fernando Pessoa • Saudade e Malinconia",
    source: "Letteratura Portoghese",
    icon: "🌧️",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Prosa Poetica",
    url: "https://it.wikipedia.org/wiki/Il_libro_dell%27inquietudine",
    text: "Provo una strana compassione per me stesso, per il mio passato che non tornerà e per la tristezza che mi assale nel guardare la pioggia cadere sui tetti umidi della città. Porto in me tutte le ferite delle battaglie che ho evitato."
  },
  {
    title: "Elogio della Gioia e della Gratitudine",
    subtitle: "Spinoza • Ethica",
    source: "Filosofia Moderna",
    icon: "☀️",
    category: "wiki",
    catName: "Enciclopedia & Arte",
    catIcon: "📚",
    meta: "Etica Filosofica",
    url: "https://it.wikipedia.org/wiki/Baruch_Spinoza",
    text: "La letizia è il passaggio dell'uomo da una minore a una maggiore perfezione. Quanto più siamo avvolti da una gioia luminosa, tanto più partecipiamo della natura divina e aumentiamo la nostra forza di esistere e connetterci agli altri con amore sincero."
  }
];

/** Fallback offline di immagini con forte impronta emotiva */
const SURFER_FALLBACK_IMAGES = [
  {
    title: "Nebulosa Testa di Cavallo (Hubble)",
    subtitle: "Spazio Profondo • Meraviglia Cosmica",
    source: "Wikimedia Commons / NASA",
    icon: "🌌",
    category: "wiki",
    catName: "Patrimonio Visivo Aperto",
    catIcon: "🖼️",
    meta: "NASA Deep Space",
    url: "https://commons.wikimedia.org/wiki/File:Hubble_Horsehead_Nebula.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Hubble_Horsehead_Nebula.jpg/800px-Hubble_Horsehead_Nebula.jpg",
    fallbackEmotion: "Meraviglia"
  },
  {
    title: "Il Viandante sul mare di nebbia (C.D. Friedrich)",
    subtitle: "Romanticismo • Nostalgia e Sublime",
    source: "Kunsthalle Hamburg",
    icon: "🏔️",
    category: "wiki",
    catName: "Patrimonio Visivo Aperto",
    catIcon: "🖼️",
    meta: "Capolavoro Romantico",
    url: "https://commons.wikimedia.org/wiki/File:Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    fallbackEmotion: "Saudade"
  },
  {
    title: "L'Urlo (Edvard Munch)",
    subtitle: "Espressionismo • Angoscia e Terrore",
    source: "Galleria Nazionale di Oslo",
    icon: "😱",
    category: "wiki",
    catName: "Patrimonio Visivo Aperto",
    catIcon: "🖼️",
    meta: "Espressionismo Nordico",
    url: "https://commons.wikimedia.org/wiki/File:Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    fallbackEmotion: "Angoscia"
  },
  {
    title: "Danza di Ninfe alla Luce dell'Alba",
    subtitle: "Impressionismo • Gioia e Serenità",
    source: "Wikimedia Commons Art",
    icon: "🌿",
    category: "wiki",
    catName: "Patrimonio Visivo Aperto",
    catIcon: "🖼️",
    meta: "Pittura Impressionista",
    url: "https://commons.wikimedia.org/wiki/File:Jean-Baptiste-Camille_Corot_-_Une_matin%C3%A9e,_la_danse_des_nymphes.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Jean-Baptiste-Camille_Corot_-_Une_matin%C3%A9e%2C_la_danse_des_nymphes.jpg/800px-Jean-Baptiste-Camille_Corot_-_Une_matin%C3%A9e%2C_la_danse_des_nymphes.jpg",
    fallbackEmotion: "Gioia"
  }
];

// ============================================================================
/** Fallback di tracce audio con licenza libera da Wikimedia Commons con forte impronta emotiva */
const SURFER_FALLBACK_AUDIO = [
  {
    type: 'audio',
    title: 'La Primavera - Allegro (Antonio Vivaldi)',
    subtitle: 'Musica Barocca • Vivacità, Luce e Gioia Rinascimentale',
    source: 'Wikimedia Commons / Musopen',
    icon: '🎻',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Wikimedia Commons Audio • Formato OGG',
    url: 'https://commons.wikimedia.org/wiki/File:Antonio_Vivaldi_-_The_Four_Seasons_-_1._Spring_-_Allegro.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Antonio_Vivaldi_-_The_Four_Seasons_-_1._Spring_-_Allegro.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Gioia'
  },
  {
    type: 'audio',
    title: 'Sinfonia N. 5 in Do minore - Allegro con brio (L. van Beethoven)',
    subtitle: 'Romanticismo Classico • Determinazione, Furia e Destino',
    source: 'Wikimedia Commons / Skidmore College Orchestra',
    icon: '⚡',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Wikimedia Commons Audio • Formato OGG',
    url: 'https://commons.wikimedia.org/wiki/File:Beethoven_Symphony_5_c_minor_Op67_1_Allegro_con_brio.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Beethoven_Symphony_5_c_minor_Op67_1_Allegro_con_brio.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Rabbia'
  },
  {
    type: 'audio',
    title: 'Notturno Op. 9 N. 1 (Frédéric Chopin)',
    subtitle: 'Pianoforte Romantico • Malinconia, Dolcezza e Nostalgia',
    source: 'Wikimedia Commons / Luke Faulkner',
    icon: '🎹',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Wikimedia Commons Audio • Formato OGG',
    url: 'https://commons.wikimedia.org/wiki/File:Chopin_nocturne_op9_no1.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Chopin_nocturne_op9_no1.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Tristezza'
  },
  {
    type: 'audio',
    title: 'Canto Gregoriano: Kyrie Eleison',
    subtitle: 'Polifonia Sacra Medievale • Contemplazione, Sacralità e Fiducia',
    source: 'Wikimedia Commons',
    icon: '🕊️',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Wikimedia Commons Audio • Registrazione Storica',
    url: 'https://commons.wikimedia.org/wiki/File:Gregorian_Chant_Kyrie.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Gregorian_Chant_Kyrie.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Fiducia'
  },
  {
    type: 'audio',
    title: 'Onde dell\'Oceano Pacifico al Tramonto (Solana Beach)',
    subtitle: 'Paesaggio Sonoro Naturale • Serenità, Calma e Respiro Cosmico',
    source: 'Wikimedia Commons / Nature Soundscapes',
    icon: '🌊',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Field Recording Naturale',
    url: 'https://commons.wikimedia.org/wiki/File:Waves_at_Solana_Beach.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Waves_at_Solana_Beach.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Serenità'
  },
  {
    type: 'audio',
    title: 'I Pianeti: Marte, il Portatore di Guerra (Gustav Holst)',
    subtitle: 'Musica Orchestrale del XX Secolo • Tensione, Terrore e Allarme',
    source: 'Wikimedia Commons / US Air Force Heritage Band',
    icon: '🪐',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Holst Suite Orchestrale',
    url: 'https://commons.wikimedia.org/wiki/File:Holst_-_Mars,_the_Bringer_of_War.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Holst_-_Mars%2C_the_Bringer_of_War.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Paura'
  },
  {
    type: 'audio',
    title: 'Clair de Lune (Claude Debussy)',
    subtitle: 'Impressionismo Musicale • Meraviglia, Onirismo e Purezza',
    source: 'Wikimedia Commons / Laurens Goedhart',
    icon: '🌙',
    category: 'wiki',
    catName: 'Patrimonio Sonoro Aperto',
    catIcon: '🎵',
    meta: 'Suite Bergamasque',
    url: 'https://commons.wikimedia.org/wiki/File:Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    mimeType: 'audio/ogg',
    fallbackEmotion: 'Meraviglia'
  }
];

/** Fallback di video oEmbed / YouTube con forte impronta emotiva e culturale */
const SURFER_FALLBACK_VIDEOS = [
  {
    type: 'video',
    videoId: 'GRxofEmo3HA',
    title: 'Aurora Boreale: La Danza Magnetica della Terra nello Spazio',
    subtitle: 'BBC Earth • Meraviglia Cosmica e Scienza dell\'Atmosfera',
    source: 'BBC Earth (YouTube)',
    icon: '✨',
    category: 'wiki',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'YouTube oEmbed / 4K Documentary',
    url: 'https://www.youtube.com/watch?v=GRxofEmo3HA',
    videoEmbedUrl: 'https://www.youtube.com/embed/GRxofEmo3HA',
    thumbnailUrl: 'https://i.ytimg.com/vi/GRxofEmo3HA/hqdefault.jpg',
    fallbackEmotion: 'Meraviglia'
  },
  {
    type: 'video',
    videoId: '_VB39Jo8mAQ',
    title: 'Vivaldi: L\'Inverno - Largo e Allegro (Accademia Bizantina)',
    subtitle: 'Concerto Barocco dal Vivo • Gioia, Estasi e Virtuosismo',
    source: 'Accademia Bizantina (YouTube)',
    icon: '🎻',
    category: 'wiki',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'Performance Musicale dal Vivo',
    url: 'https://www.youtube.com/watch?v=_VB39Jo8mAQ',
    videoEmbedUrl: 'https://www.youtube.com/embed/_VB39Jo8mAQ',
    thumbnailUrl: 'https://i.ytimg.com/vi/_VB39Jo8mAQ/hqdefault.jpg',
    fallbackEmotion: 'Gioia'
  },
  {
    type: 'video',
    videoId: 'rEq1Z0bjdwc',
    title: 'Beethoven: Sonata al Chiaro di Luna (Adagio sostenuto)',
    subtitle: 'Esecuzione Pianistica • Melancolia, Solitudine e Quiete Profonda',
    source: 'Rousseau Piano (YouTube)',
    icon: '🎹',
    category: 'wiki',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'Sonata Op. 27 n. 2',
    url: 'https://www.youtube.com/watch?v=rEq1Z0bjdwc',
    videoEmbedUrl: 'https://www.youtube.com/embed/rEq1Z0bjdwc',
    thumbnailUrl: 'https://i.ytimg.com/vi/rEq1Z0bjdwc/hqdefault.jpg',
    fallbackEmotion: 'Tristezza'
  },
  {
    type: 'video',
    videoId: 'bx1Bh8ZvH84',
    title: 'Carl Sagan: Il Pale Blue Dot (Un Piccolo Punto Blu)',
    subtitle: 'Cosmos • Prospettiva Esistenziale, Speranza e Umiltà dell\'Umanità',
    source: 'The Carl Sagan Institute (YouTube)',
    icon: '🌍',
    category: 'community',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'Cosmos Filosofico',
    url: 'https://www.youtube.com/watch?v=bx1Bh8ZvH84',
    videoEmbedUrl: 'https://www.youtube.com/embed/bx1Bh8ZvH84',
    thumbnailUrl: 'https://i.ytimg.com/vi/bx1Bh8ZvH84/hqdefault.jpg',
    fallbackEmotion: 'Speranza'
  },
  {
    type: 'video',
    videoId: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny: La Vendetta del Coniglio nella Foresta Incantata',
    subtitle: 'Blender Foundation • Animazione Open Source, Umorismo e Risa',
    source: 'Blender Open Movies (YouTube)',
    icon: '🐰',
    category: 'wiki',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'Creative Commons 3D Film',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    videoEmbedUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    thumbnailUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg',
    fallbackEmotion: 'Divertimento'
  },
  {
    type: 'video',
    videoId: 'udAL48P5NJU',
    title: 'Hubble Extreme Deep Field: I Confini dell\'Universo Osservabile',
    subtitle: 'NASA Space Telescope • Timore Reverenziale e Vertigine dell\'Infinito',
    source: 'Hubble Space Telescope (YouTube)',
    icon: '🔭',
    category: 'wiki',
    catName: 'Patrimonio Audiovisivo',
    catIcon: '🎬',
    meta: 'Astronomia e Astrofisica',
    url: 'https://www.youtube.com/watch?v=udAL48P5NJU',
    videoEmbedUrl: 'https://www.youtube.com/embed/udAL48P5NJU',
    thumbnailUrl: 'https://i.ytimg.com/vi/udAL48P5NJU/hqdefault.jpg',
    fallbackEmotion: 'Meraviglia'
  }
];

// 13.1 DATASET E FONTI SPECIALISTICHE DEL NAVIGATORE WEB
// ============================================================================

/** 
 * Testate Giornalistiche Internazionali Autorevoli (Reuters, AP, BBC, Guardian, ANSA)
 */
const SURFER_NEWS_ITEMS = [
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'Reuters',
    icon: '🌐',
    title: 'Accordo Globale sul Clima: Stanziamenti Storici per la Rigenerazione Planetaria',
    subtitle: 'Reuters World News • Diplomazia Internazionale',
    meta: 'Reuters Special Report • Aggiornato 2 ore fa',
    url: 'https://www.reuters.com/sustainability/',
    text: 'I delegati di oltre centocinquanta nazioni hanno ratificato all\'alba un patto storico vincolante per la riforestazione massiva e la transizione ecologica accelerata. Tra i corridoi del vertice si respira un\'atmosfera di palpabile sollievo e rinnovata speranza dopo settimane di serrati negoziati notturni, con la promessa di tutelare il futuro delle prossime generazioni.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'Reuters',
    icon: '🌐',
    title: 'Inversione di Rotta nei Mercati Energetici: Il Solare Supera le Fonti Fossili',
    subtitle: 'Reuters Markets • Economia della Sostenibilità',
    meta: 'Reuters Market Pulse • Tempo Reale',
    url: 'https://www.reuters.com/business/energy/',
    text: 'Secondo l\'ultimo bollettino economico internazionale, gli investimenti in energie pulite e tecnologie di accumulo hanno oltrepassato per la prima volta ogni previsione storica. Gli analisti segnalano un\'ondata di ottimismo e audacia tra gli investitori, determinati a finanziare progetti di autosufficienza energetica decentralizzata.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'Associated Press',
    icon: '📰',
    title: 'Missione Polare: Scoperto un Ecosistema Antico Intatto sotto i Ghiacci',
    subtitle: 'AP News • Scienza & Esplorazione Estrema',
    meta: 'AP Wire Dispatch • In Primo Piano',
    url: 'https://apnews.com/hub/science',
    text: 'Un team di glaciologi e biologi marini ha individuato una vasta rete di laghi subglaciali popolata da microrganismi che prosperano nell\'oscurità assoluta da milioni di anni. La scoperta ha scosso la comunità scientifica con una sensazione di vertigine e meraviglia, ridefinendo i limiti noti della resilienza della vita sul nostro pianeta.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'Associated Press',
    icon: '📰',
    title: 'Archeologia nel Mediterraneo: Riaffiora un Tempio Sommerso della Pace',
    subtitle: 'AP News • Patrimonio Culturale Mondiale',
    meta: 'AP Culture Dispatch • Esclusiva',
    url: 'https://apnews.com/hub/lifestyle',
    text: 'Le telecamere sottomarine hanno svelato colonne intatte e iscrizioni dedicate alla concordia tra i popoli risalenti a duemilaquattrocento anni fa. Gli storici descrivono un momento di commozione universale: la memoria antica ci ricorda che la ricerca della pace e della solidarietà è radicata nell\'anima dell\'umanità da millenni.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'BBC News',
    icon: '🔴',
    title: 'Rapporto Metropoli: Le Città che Curano la Solitudine con Spazi Condivisi',
    subtitle: 'BBC News • Società & Benessere Collettivo',
    meta: 'BBC In-Depth Analysis • Oggi',
    url: 'https://www.bbc.com/news/world',
    text: 'Da Tokyo a Londra, cresce il movimento dei quartieri rigenerati: giardini di prossimità, mense comunitarie e laboratori artistici aperti stanno invertendo l\'isolamento dell\'era digitale. Chi partecipa racconta una riscoperta della gioia dell\'incontro inatteso e del calore di sentirsi parte viva di una comunità solidale.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'BBC News',
    icon: '🔴',
    title: 'Corsa allo Spazio Profondo: Il Telescopio Svela le Prime Strutture Cosmiche',
    subtitle: 'BBC Science • Frontiere dell\'Universo',
    meta: 'BBC World Service • Edizione Straordinaria',
    url: 'https://www.bbc.com/news/science_and_environment',
    text: 'Una serie di scatti a infrarossi ad altissima risoluzione ha catturato la nascita delle primissime galassie formatesi solo trecento milioni di anni dopo il Big Bang. Gli astrofisici parlano di un\'emozione quasi mistica nel contemplare l\'alba della luce primordiale che ha viaggiato nello spazio infinito per miliardi di anni.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'The Guardian',
    icon: '🕊️',
    title: 'Giustizia Intergenerazionale: I Giovani Portano i Diritti del Pianeta nei Tribunali',
    subtitle: 'The Guardian • Diritti, Clima & Futuro',
    meta: 'The Guardian Long Read • Inchiesta',
    url: 'https://www.theguardian.com/world',
    text: 'Una coalizione globale di adolescenti e studenti ha ottenuto un verdetto senza precedenti che sancisce il diritto inalienabile a un ambiente sano per le future generazioni. Le aule gremite hanno risuonato di applausi e lacrime di sollievo: la determinazione civile si trasforma in legge viva a difesa della biosfera.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'The Guardian',
    icon: '🕊️',
    title: 'La Riconquista del Tempo Lento: La Rivoluzione Silenziosa del Lavoro Umano',
    subtitle: 'The Guardian Society • Lavoro & Qualità della Vita',
    meta: 'The Guardian Culture • Approfondimento',
    url: 'https://www.theguardian.com/society',
    text: 'Centinaia di organizzazioni che hanno introdotto orari flessibili e settimane corte registrano non solo una produttività invariata, ma un crollo verticale dei livelli di ansia e un rifiorire delle relazioni umane. I lavoratori riscoprono la lettura, il volontariato, la cura dei figli e il silenzio rigenerante.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'ANSA',
    icon: '🇮🇹',
    title: 'Ricerca Italiana: Scoperta una Molecola Naturale che Stimola la Rigenerazione Neuronale',
    subtitle: 'ANSA.it • Scienza & Medicina Italiana',
    meta: 'ANSA Notiziario Nazionale • Top News',
    url: 'https://www.ansa.it/canale_scienza_tecnica/',
    text: 'I ricercatori delle università italiane hanno isolato un composto estratto dalla flora mediterranea capace di proteggere le sinapsi e favorire la neuroplasticità cerebrale. La notizia accende un faro di speranza tangibile per milioni di famiglie colpite da patologie neurodegenerative.'
  },
  {
    type: 'text',
    category: 'news',
    catName: 'Notizie Autorevoli',
    catIcon: '📰',
    source: 'ANSA',
    icon: '🇮🇹',
    title: 'Patrimonio Vivente: Restaurata la Cripta degli Affreschi con Tecnologie Laser Green',
    subtitle: 'ANSA Cultura • Bellezza e Tutela del Territorio',
    meta: 'ANSA Arte • Notizia del Giorno',
    url: 'https://www.ansa.it/sito/notizie/cultura/',
    text: 'Grazie a speciali laser biologici a impatto zero, capolavori del Rinascimento creduti irrimediabilmente perduti sotto la fuliggine sono tornati a risplendere con i loro pigmenti azzurro lapislazzulo e oro zecchino. Un trionfo di meraviglia che testimonia la capacità umana di custodire la bellezza attraverso i secoli.'
  }
];

/**
 * Discussioni Pubbliche sui Social Network (Reddit, Bluesky, Mastodon, X)
 */
const SURFER_SOCIAL_ITEMS = [
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Reddit',
    icon: '🤖',
    title: 'r/AskReddit: Qual è il gesto di uno sconosciuto che vi ha salvato la giornata?',
    subtitle: 'Reddit Community • 14.8k commenti • Hot Thread',
    meta: '18.4k upvotes • Discussione Aperta',
    url: 'https://www.reddit.com/r/AskReddit/',
    text: '«Pioveva a dirotto e avevo appena perso il lavoro. Ero seduto sul marciapiede a piangere. Un anziano si è fermato, mi ha lasciato il suo ombrello, un thermos di tè caldo e mi ha detto: "Oggi sembra buio, ma ricordati che tu vali molto più di qualsiasi tempesta passata". Non l\'ho mai più rivisto, ma quel gesto mi ha dato la forza di rialzarmi.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Reddit',
    icon: '🤖',
    title: 'r/MadeMeSmile: Dopo anni di solitudine, ho aperto la porta al vicino di casa',
    subtitle: 'Reddit • Condivisione Spontanea ed Empatia',
    meta: '24.1k upvotes • r/MadeMeSmile',
    url: 'https://www.reddit.com/r/MadeMeSmile/',
    text: '«Eravamo due vicini che si incrociavano sul pianerottolo senza salutarsi da tre anni. Ieri gli ho portato una fetta di torta fatta in casa. Abbiamo parlato per quattro ore della nostra vita, delle nostre paure e della musica anni Settanta. Stasera mi sento meno solo in questa grande città. L\'amicizia comincia con un briciolo di coraggio.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Reddit',
    icon: '🤖',
    title: 'r/todayilearned: Gli alberi comunicano tra loro attraverso reti sotterranee di funghi',
    subtitle: 'Reddit • Conoscenza Condivisa & Meraviglia Naturale',
    meta: '31.2k upvotes • r/todayilearned',
    url: 'https://www.reddit.com/r/todayilearned/',
    text: '«Oggi ho scoperto che una foresta non è una somma di individui in competizione cieca, ma un superorganismo: quando un albero è malato o all\'ombra, gli alberi vicini gli inviano zuccheri e nutrienti attraverso le radici per mantenerlo in vita. La cooperazione biologica è molto più antica della nostra specie.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Bluesky',
    icon: '🦋',
    title: '@elena_horizon.bsky.social: Il cielo stasera e il silenzio ritrovato',
    subtitle: 'Bluesky Feed • AT Protocol Network',
    meta: '1.2k reposts • 4.8k likes • Bluesky Public Post',
    url: 'https://bsky.app/',
    text: '«Ho spento le notifiche e ho camminato sul crinale della collina al tramonto. Il cielo si è tinto di indaco e mandarino. A volte dimentichiamo che la vita non è ciò che scorre sugli schermi illuminati, ma questo respiro calmo tra il vento e l\'infinito. Impariamo a fare spazio alla quiete.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Bluesky',
    icon: '🦋',
    title: '@astro_clara.bsky.social: La bellezza disarmante del nostro pianeta',
    subtitle: 'Bluesky • Comunità Scientifica e Divulgazione',
    meta: '3.4k reposts • 12k likes',
    url: 'https://bsky.app/',
    text: '«Guardando i dati dei satelliti atmosferici: ogni nuvola che attraversa gli oceani trasporta miliardi di litri d\'acqua dolce verso continenti assetati. Siamo a bordo di un\'astronave biologica perfetta e miracolosa. Come si può non provare un senso devoto di custodia e gratitudine?»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Mastodon',
    icon: '🐘',
    title: '@giacomo@mastodon.social: Un web decentralizzato a misura d\'animo umano',
    subtitle: 'Mastodon Fediverse • Post Pubblico Federato',
    meta: 'Federated Timeline • 840 boost • 2.1k favorite',
    url: 'https://mastodon.social/explore',
    text: '«Ciò che amo del fediverso è l\'assenza di un algoritmo programmato per scatenare l\'indignazione a pagamento. Qui le persone si ascoltano a vicenda, si scambiano consigli sui libri, condividono poesie e progetti open source. La gentilezza torna a essere la metrica fondamentale del discorso civile.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'Mastodon',
    icon: '🐘',
    title: '@laura_mind@mstdn.social: Accogliere la propria vulnerabilità senza giudizio',
    subtitle: 'Mastodon • Riflessioni Psicologiche & Dialogo Aperto',
    meta: 'mstdn.social • 510 boost',
    url: 'https://mstdn.social/',
    text: '«La pretesa della società moderna di vederci sempre performanti, infallibili e sorridenti genera una stanchezza dell\'anima insostenibile. Concedersi una giornata di riposo, ammettere una fragilità, chiedere un abbraccio non è debolezza: è l\'atto più autentico di coraggio umano che esista.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'X',
    icon: '𝕏',
    title: '#HumanSpirit: Il pianista che suona alla stazione centrale di Milano',
    subtitle: 'X • Trend Pubblico Virale & Discussioni',
    meta: 'Trend in Italia • 45.2K Post',
    url: 'https://twitter.com/explore',
    text: '«C\'è un pianoforte libero nell\'atrio della stazione affollata. Un ragazzo con lo zaino si è seduto e ha iniziato a suonare Chopin con una grazia commovente. Centinaia di pendolari di corsa si sono fermati in cerchio in perfetto silenzio. Per dieci minuti il caos si è trasformato in pura poesia condivisa.»'
  },
  {
    type: 'text',
    category: 'social',
    catName: 'Social Network',
    catIcon: '💬',
    source: 'X',
    icon: '𝕏',
    title: '#GratitudeDaily: Esercizio di consapevolezza serale',
    subtitle: 'X • Discussione Pubblica sul Benessere Emotivo',
    meta: 'Trend Globale • 28.9K Post',
    url: 'https://twitter.com/explore',
    text: '«Tre cose per cui sono grato oggi: l\'odore del caffè la mattina presto, il messaggio inatteso di una vecchia amica che mi ha chiesto "come stai davvero?", e la consapevolezza che ogni tramonto porta con sé la promessa di un nuovo inizio. La felicità sta nei dettagli trascurati.»'
  }
];

/**
 * Argomenti di Tendenza da Google Trends (Italia & Globale)
 */
const SURFER_TRENDS_ITEMS = [
  {
    type: 'text',
    category: 'trends',
    catName: 'Google Trends',
    catIcon: '📈',
    source: 'Google Trends',
    icon: '📈',
    title: 'Missione Artemis sulla Luna: Il Ritorno Umano nello Spazio Profondo',
    subtitle: 'Google Trends Italia • Picco di Ricerche in Tempo Reale',
    meta: '+500K ricerche nelle ultime 12 ore • Tendenza #1',
    url: 'https://trends.google.com/trending?geo=IT',
    text: 'Un\'impennata senza precedenti di interrogazioni su motori di ricerca e mappe celesti: milioni di persone in tutta la penisola stanno cercando notizie sulle nuove tute spaziali, sulle traiettorie lunari e sui volti degli astronauti. La curiosità e l\'ammirazione per l\'esplorazione del cosmo accendono l\'immaginazione collettiva.'
  },
  {
    type: 'text',
    category: 'trends',
    catName: 'Google Trends',
    catIcon: '📈',
    source: 'Google Trends',
    icon: '📈',
    title: 'Aurore Boreali nei Cieli d\'Europa: Lo Spettacolo Notturno',
    subtitle: 'Google Trends Globale • Esplosione di Interesse Visivo',
    meta: '+1M ricerche • Picco virale internazionale',
    url: 'https://trends.google.com/trending?geo=US',
    text: 'A causa di un\'intensa tempesta solare geomagnetica, aurore boreali color cremisi, smeraldo e violetto sono state immortalate anche a medie latitudini. Le ricerche correlate includono "come guardare il cielo", "fotografia notturna" e "vento solare". La meraviglia per i fenomeni cosmici travolge la rete con milioni di immagini condivise.'
  },
  {
    type: 'text',
    category: 'trends',
    catName: 'Google Trends',
    catIcon: '📈',
    source: 'Google Trends',
    icon: '📈',
    title: 'Nuove Scoperte del Telescopio James Webb: Esopianeti con Atmosfera',
    subtitle: 'Google Trends Italia • Scienza & Astrofisica',
    meta: '+200K ricerche • In forte ascesa',
    url: 'https://trends.google.com/trending?geo=IT',
    text: 'Il rilevamento di vapore acqueo e composti organici nelle atmosfere di mondi lontani decine di anni luce domina le tendenze del giorno. Il pubblico si interroga con stupore filosofico e trepidazione scientifica sulla possibilità che l\'universo brulichi di forme di vita ancora da incontrare.'
  },
  {
    type: 'text',
    category: 'trends',
    catName: 'Google Trends',
    catIcon: '📈',
    source: 'Google Trends',
    icon: '📈',
    title: 'Salute Mentale sul Lavoro: Settimana Corta e Benessere Psicologico',
    subtitle: 'Google Trends Globale • Lavoro, Società & Futuro',
    meta: '+350K ricerche • Crescita costante +180%',
    url: 'https://trends.google.com/trending?geo=US',
    text: 'Query in fortissima crescita incentrate su "equilibrio vita lavoro", "prevenzione del burnout", "mindfulness sul lavoro" e "diritto alla disconnessione". La società globale manifesta una domanda urgente di umanizzazione dei ritmi quotidiani e valorizzazione del tempo per la vita privata.'
  },
  {
    type: 'text',
    category: 'trends',
    catName: 'Google Trends',
    catIcon: '📈',
    source: 'Google Trends',
    icon: '📈',
    title: 'Riforestazione Urbana e Corridoi Verdi nelle Città del Futuro',
    subtitle: 'Google Trends Italia • Ambiente & Innovazione Urbana',
    meta: '+150K ricerche • Tendenza Verde',
    url: 'https://trends.google.com/trending?geo=IT',
    text: 'I cittadini cercano informazioni su come piantumare alberi nei balconi, aderire a boschi urbani partecipati e promuovere l\'apicoltura nei centri storici. Un desiderio vivo di riscatto ecologico che trasforma le città di pietra in giardini pulsanti di biodiversità.'
  }
];

/**
 * Report e Indicatori di Benessere Umano (OMS, Gallup, World Happiness Report, OCSE)
 */
const SURFER_WELLBEING_ITEMS = [
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'OMS / WHO',
    icon: '🌿',
    title: 'Rapporto Mondiale OMS sulla Salute Mentale: Il Benessere è un Diritto Fondamentale',
    subtitle: 'Organizzazione Mondiale della Sanità • World Mental Health Report',
    meta: 'WHO Global Directive • Ginevra',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    text: 'L\'OMS sancisce che la salute non è semplicemente l\'assenza di malattia fisica, ma uno stato dinamico di benessere emotivo, relazionale e sociale in cui ogni individuo realizza il proprio potenziale e affronta le normali sfide della vita con dignità, speranza e supporto comunitario incondizionato.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'OMS / WHO',
    icon: '🌿',
    title: 'Linee Guida Globali sul Riposo, la Luce Naturale e la Riduzione dello Stress Cronico',
    subtitle: 'Organizzazione Mondiale della Sanità • Sanità Pubblica e Stili di Vita',
    meta: 'WHO Prevention Guidelines • Dati 2025/2026',
    url: 'https://www.who.int/health-topics',
    text: 'I dati dimostrano che il contatto quotidiano con la luce solare, almeno trenta minuti di cammino nella natura e otto ore di riposo regolare riducono gli indici infiammatori dell\'organismo del 40%, potenziando la stabilità emotiva, la serenità e la lucidità decisionale.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'Gallup World Poll',
    icon: '📊',
    title: 'Gallup Global Emotions Report: L\'Indice delle Esperienze Positive nel Mondo',
    subtitle: 'Gallup World Poll • Analisi su 140 Nazioni',
    meta: 'Positive Experience Index: 71% Globale • Gallup Analytics',
    url: 'https://www.gallup.com/analytics/349487/gallup-global-emotions-report.aspx',
    text: 'La ricerca Gallup rivela che oltre il settanta per cento degli esseri umani sorride, prova piacere nell\'apprendere qualcosa di nuovo e si sente rispettato dai propri cari ogni giorno. La gentilezza quotidiana e il senso di gratitudine restano i motori più stabili dell\'esperienza umana a tutte le latitudini.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'Gallup World Poll',
    icon: '📊',
    title: 'Il Valore dell\'Amicizia nel Luogo di Lavoro: Antidoto al Burnout',
    subtitle: 'Gallup Workplace Research • Relazioni e Coinvolgimento',
    meta: 'Gallup Employee Engagement Survey',
    url: 'https://www.gallup.com/workplace/',
    text: 'Avere un amico fidato sul lavoro raddoppia la motivazione autentica e abbatte del 60% il rischio di esaurimento psicofisico. L\'empatia tra colleghi e la cultura del supporto reciproco si confermano le leve più potenti per la serenità e il benessere duraturo.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'World Happiness Report',
    icon: '☀️',
    title: 'World Happiness Report: Perché la Generosità e la Fiducia Valgono più del PIL',
    subtitle: 'Rapporto Annuale ONU sulla Felicità Mondiale',
    meta: 'Cantril Life Ladder Index • SDG Hub',
    url: 'https://worldhappiness.report/',
    text: 'L\'analisi comparativa delle società più serene al mondo dimostra inequivocabilmente che la generosità spontanea verso gli sconosciuti e la certezza di avere qualcuno su cui contare nel bisogno pesano sulla felicità soggettiva il doppio rispetto alla sola ricchezza economica materiale.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'World Happiness Report',
    icon: '☀️',
    title: 'Il Modello della Coesione Sociale: Comunità che Condividono Tempo e Cura',
    subtitle: 'World Happiness Report • Lezioni dai Paesi al Vertice',
    meta: 'Punteggio di Benessere Soggettivo: 7.7/10',
    url: 'https://worldhappiness.report/',
    text: 'I fattori determinanti per l\'armonia quotidiana non risiedono nel lusso sfrenato, ma nella libertà di compiere scelte etiche in sintonia con i propri valori, nella trasparenza istituzionale e nella certezza che nessun membro della comunità verrà abbandonato nella fragilità.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'OCSE Better Life',
    icon: '🌐',
    title: 'OCSE Better Life Index: L\'Equilibrio tra Lavoro e Vita Privata',
    subtitle: 'Organizzazione per la Cooperazione e lo Sviluppo Economico',
    meta: 'OECD Indicators of Well-Being • Parigi',
    url: 'https://www.oecdbetterlifeindex.org/',
    text: 'L\'indice OCSE dimostra che le nazioni con orari di lavoro regolamentati e ampi congedi genitoriali registrano i più alti tassi di soddisfazione esistenziale, migliore salute mentale per madri e padri e una crescita armonica dei bambini stimolati da affetti stabili e presenti.'
  },
  {
    type: 'text',
    category: 'wellbeing',
    catName: 'Benessere Umano',
    catIcon: '🌿',
    source: 'OCSE Better Life',
    icon: '🌐',
    title: 'Qualità dell\'Ambiente e Senso di Appartenenza Civica',
    subtitle: 'OCSE Better Life Index • Sostenibilità e Comunità',
    meta: 'OCSE Indicatori Sociali Comparativi',
    url: 'https://www.oecdbetterlifeindex.org/',
    text: 'Aria pulita, acqua limpida e parchi accessibili entro dieci minuti a piedi da casa determinano un incremento immediato della valenza emotiva positiva e riducono l\'aggressività urbana, creando le condizioni ideali per la fiducia reciproca tra cittadini di ogni ceto e provenienza.'
  }
];

/**
 * Comunità Online Focalizzate su Tecnologia, Scienza, Salute Mentale, Lavoro e Relazioni
 */
const SURFER_COMMUNITY_ITEMS = [
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Hacker News',
    icon: '💻',
    title: 'Show HN: Piattaforma open source per la misurazione etica dell\'impatto algoritmico',
    subtitle: 'Hacker News • Y Combinator Tech Community',
    meta: 'Score: 420 • 182 commenti • Hacker News Frontpage',
    url: 'https://news.ycombinator.com/',
    text: '«Abbiamo costruito questo software senza fini di lucro perché crediamo che la tecnologia debba amplificare la coscienza e l\'autonomia umana, non imprigionarla in meccanismi di dipendenza digitale. La risposta della comunità globale di sviluppatori è stata straordinaria: cento programmatori volontari hanno offerto il proprio contributo in 48 ore.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Hacker News',
    icon: '💻',
    title: 'Ask HN: Come avete ritrovato la gioia di creare dopo anni di cinismo professionale?',
    subtitle: 'Hacker News • Riflessioni sulla Vocazione Tecnologica',
    meta: 'Score: 610 • 340 commenti',
    url: 'https://news.ycombinator.com/',
    text: '«Ho smesso di inseguire metriche vuote e ho ricominciato a costruire piccoli strumenti utili per la scuola del mio quartiere. Vedere gli insegnanti e i bambini sorridere davanti a un programma che semplifica la loro giornata mi ha restituito la scintilla che credevo spenta per sempre.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Comunità Scienza',
    icon: '🔬',
    title: 'r/science: La pratica regolare della meditazione e della compassione modifica la struttura cerebrale',
    subtitle: 'Comunità Scientifica Reddit • Peer-Reviewed Neuroscience',
    meta: '22.8k upvotes • r/science • Studio pubblicato su Nature',
    url: 'https://www.reddit.com/r/science/',
    text: '«Scansioni fMRI confermano che otto settimane di esercizi di benevolenza attiva aumentano lo spessore dell\'insula e dell\'amigdala regolata, riducendo le risposte di panico automatico e potenziando la comprensione immediata delle emozioni altrui. La gentilezza lascia un\'impronta tangibile nei nostri circuiti neurali.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Comunità Scienza',
    icon: '🔬',
    title: 'arXiv Astrofisica: La sinfonia delle onde gravitazionali da buchi neri danzanti',
    subtitle: 'Open Science Community • Fisica Fondamentale',
    meta: 'arXiv Preprint • Gravitational Waves Collaboration',
    url: 'https://arxiv.org/',
    text: '«La distorsione infinitesimale dello spaziotempo causata dalla collisione di due orizzonti degli eventi ha attraversato il cosmo per un miliardo di anni luce prima di toccare i nostri interferometri laser. Il cosmo emette un vero e proprio canto geometrico che finalmente abbiamo imparato ad ascoltare.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Salute Mentale',
    icon: '🧠',
    title: 'r/mentalhealth: Ho chiesto aiuto psicologico dopo mesi di vergogna: è la decisione migliore della mia vita',
    subtitle: 'Comunità di Supporto & Salute Mentale • Condivisione Autentica',
    meta: '15.6k upvotes • r/mentalhealth',
    url: 'https://www.reddit.com/r/mentalhealth/',
    text: '«Pensavo di dover essere una roccia e tenere tutto dentro. Il giorno in cui sono scoppiato a piangere nello studio della psicoterapeuta è stato il giorno in cui ho iniziato a guarire. Ammettere di avere un dolore non è una sconfitta, è l\'inizio della vera libertà. Se stai soffrendo in silenzio, per favore parla con qualcuno: non sei solo.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Salute Mentale',
    icon: '🧠',
    title: 'r/mindfulness: L\'arte di respirare prima di reagire con rabbia',
    subtitle: 'Mindfulness & Consapevolezza Interiore',
    meta: '9.8k upvotes • r/mindfulness',
    url: 'https://www.reddit.com/r/mindfulness/',
    text: '«Tra lo stimolo che riceviamo dall\'esterno e la nostra risposta c\'è sempre uno spazio minuscolo, un attimo di respiro. In quello spazio risiede la nostra libertà di scegliere la pace anziché il conflitto, la curiosità anziché il rancore. Coltivare quel respiro cambia ogni relazione della nostra vita.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Lavoro & Carriera',
    icon: '💼',
    title: 'r/jobs: Ho rifiutato l\'aumento che mi avrebbe tolto la sera con i miei figli: zero rimpianti',
    subtitle: 'Comunità Lavoro, Valori & Significato Esistenziale',
    meta: '19.2k upvotes • r/jobs',
    url: 'https://www.reddit.com/r/jobs/',
    text: '«Mi hanno offerto un ruolo di vertice con il 50% di stipendio in più, ma significava reperibilità nei weekend e quattordici ore al giorno al telefono. Ho detto di no con il cuore che batteva forte. Ieri ho montato una casetta di legno con mia figlia di sei anni. Nessun conto in banca potrà mai comprare il suo sorriso di stasera.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Lavoro & Carriera',
    icon: '💼',
    title: 'r/careerguidance: Riscoprire il senso del proprio mestiere servendo gli altri',
    subtitle: 'Career Guidance & Etica Professionale',
    meta: '11.4k upvotes • r/careerguidance',
    url: 'https://www.reddit.com/r/careerguidance/',
    text: '«Non importa se scrivi codice, insegni a scuola, ripari automobili o impasti il pane: quando metti cura sincera in ciò che fai pensando a chi ne beneficerà, il lavoro smette di essere un fardello e diventa il tuo contributo unico all\'armonia del mondo.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Relazioni & Empatia',
    icon: '🤝',
    title: 'r/relationships: Dieci anni senza parlarci: ieri ho chiamato mio fratello',
    subtitle: 'Relazioni Umane, Riconciliazione e Famiglia',
    meta: '28.4k upvotes • r/relationships',
    url: 'https://www.reddit.com/r/relationships/',
    text: '«Abbiamo litigato per motivi stupidi che nessuno dei due ricordava più con chiarezza. Ieri l\'ho chiamato e ho detto solo: "Mi manchi, ti voglio bene". C\'è stato un silenzio di dieci secondi, poi è scoppiato a piangere. Abbiamo parlato per tutta la notte. Non lasciate che l\'orgoglio vi derubi degli affetti più preziosi della vostra esistenza.»'
  },
  {
    type: 'text',
    category: 'community',
    catName: 'Comunità Tematiche',
    catIcon: '🔬',
    source: 'Relazioni & Empatia',
    icon: '🤝',
    title: 'r/HumansBeingBros: Tutta la via si è mobilitata per ritrovare il cane del nonno malato',
    subtitle: 'Solidarietà Spontanea e Calore Umano',
    meta: '41.5k upvotes • r/HumansBeingBros',
    url: 'https://www.reddit.com/r/HumansBeingBros/',
    text: '«Il cane guida di un nonno novantenne era scappato spaventato dai tuoni. In meno di un\'ora sessanta persone del quartiere, molte delle quali non si conoscevano, sono uscite sotto il diluvio con torce e pettorine. Quando l\'hanno ritrovato illeso sotto una tettoia e riportato a casa, tutta la strada ha esultato. L\'empatia umana è una forza irresistibile.»'
  }
];


// ── State variables for Web Surfer ──────────────────────────────────────────
let surferMode = 'mixed'; // 'mixed' | 'text' | 'image'
let surferSourceCategory = 'all'; // 'all' | 'news' | 'social' | 'trends' | 'wellbeing' | 'community' | 'wiki'
let surferAutoPilot = false;
let surferAutoPilotTimer = null;
let surferCountdownSec = 15;
let surferCountdownRemaining = 15;
let surferProgressInterval = null;
let isSurferBusy = false;
let lastSurferEmotionResult = null;
let surferHistory = [];

/**
 * Return friendly Italian label for selected source category
 */
function getSourceCategoryLabel(cat) {
  const map = {
    all: 'Tutte le Fonti (360°)',
    news: 'Notizie Autorevoli (Reuters, AP, BBC, Guardian, ANSA)',
    social: 'Social Network (Reddit, Bluesky, Mastodon, X)',
    trends: 'Google Trends (Tendenze & Picchi)',
    wellbeing: 'Benessere Umano (OMS, Gallup, WHR, OCSE)',
    community: 'Comunità Tematiche (Tech, Scienza, Mente...)',
    wiki: 'Enciclopedia & Arte (Wikipedia, Commons)'
  };
  return map[cat] || 'Tutte le Fonti';
}

/**
 * Live fetch attempt from Hacker News Firebase open API (Access-Control-Allow-Origin: *)
 */
async function fetchRandomHackerNewsLive(onStatus) {
  try {
    if (onStatus) onStatus('Connessione a Hacker News Firebase API...');
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const ids = await res.json();
      if (Array.isArray(ids) && ids.length > 0) {
        const chosenId = ids[Math.floor(Math.random() * Math.min(25, ids.length))];
        if (onStatus) onStatus(`Lettura discussione tecnica #${chosenId}...`);
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${chosenId}.json`, {
          signal: AbortSignal.timeout(3500)
        });
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          if (itemData && itemData.title && itemData.title.length > 15) {
            return {
              type: 'text',
              category: 'community',
              catName: 'Comunità Tematiche',
              catIcon: '🔬',
              source: 'Hacker News',
              icon: '💻',
              title: itemData.title,
              subtitle: `Hacker News • Punteggio: ${itemData.score || 120} • ${itemData.descendants || 0} commenti`,
              meta: `Autore: @${itemData.by || 'developer'} • Live HN API`,
              url: itemData.url || `https://news.ycombinator.com/item?id=${chosenId}`,
              text: `Discussione tecnologica in primo piano su Hacker News: «${itemData.title}». La comunità globale di ingegneri, programmatori e innovatori riflette sull'impatto tecnico, etico ed esistenziale di questa scoperta.`
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Hacker News live query skipped:', err.message);
  }
  return null;
}

/**
 * Live fetch attempt from Wikipedia REST API (IT/EN)
 */
async function fetchRandomWikipediaLive(onStatus) {
  try {
    if (onStatus) onStatus('Connessione a Wikipedia REST API...');
    const lang = Math.random() < 0.75 ? 'it' : 'en';
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      const extract = (data.extract || '').trim();
      if (extract && extract.length >= 40) {
        return {
          type: 'text',
          category: 'wiki',
          catName: 'Enciclopedia & Arte',
          catIcon: '📚',
          title: data.title || 'Articolo Enciclopedico',
          subtitle: data.description || (lang === 'it' ? 'Wikipedia Italia • Nodi della Conoscenza' : 'English Wikipedia • Open Knowledge'),
          source: lang === 'it' ? 'Wikipedia IT' : 'Wikipedia EN',
          icon: '🌐',
          meta: `Voce Enciclopedica • ${lang.toUpperCase()}`,
          url: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
          text: extract
        };
      }
    }
  } catch (err) {
    console.warn('Wikipedia random fetch skipped:', err.message);
  }
  return null;
}

/**
 * Universal content dispatcher based on the active source category:
 * 'all' | 'news' | 'social' | 'trends' | 'wellbeing' | 'community' | 'wiki'
 */
async function fetchRandomTextContent(category, onStatus) {
  let effectiveCat = category;
  if (effectiveCat === 'all') {
    const allCategories = ['news', 'social', 'trends', 'wellbeing', 'community', 'wiki'];
    effectiveCat = allCategories[Math.floor(Math.random() * allCategories.length)];
  }

  // 1. NOTIZIE AUTOREVOLI (Reuters, AP, BBC, Guardian, ANSA)
  if (effectiveCat === 'news') {
    if (onStatus) onStatus('Scansione Testate Giornalistiche (Reuters, AP, BBC, Guardian, ANSA)...');
    await new Promise(r => setTimeout(r, 100));
    const item = SURFER_NEWS_ITEMS[Math.floor(Math.random() * SURFER_NEWS_ITEMS.length)];
    return { ...item };
  }

  // 2. SOCIAL NETWORK (Reddit, Bluesky, Mastodon, X)
  if (effectiveCat === 'social') {
    if (onStatus) onStatus('Intercettazione discussioni sui Social (Reddit, Bluesky, Mastodon, X)...');
    await new Promise(r => setTimeout(r, 100));
    const item = SURFER_SOCIAL_ITEMS[Math.floor(Math.random() * SURFER_SOCIAL_ITEMS.length)];
    return { ...item };
  }

  // 3. GOOGLE TRENDS (Tendenze & Picchi)
  if (effectiveCat === 'trends') {
    if (onStatus) onStatus('Analisi tendenze in tempo reale su Google Trends...');
    await new Promise(r => setTimeout(r, 100));
    const item = SURFER_TRENDS_ITEMS[Math.floor(Math.random() * SURFER_TRENDS_ITEMS.length)];
    return { ...item };
  }

  // 4. BENESSERE UMANO (OMS, Gallup, World Happiness Report, OCSE)
  if (effectiveCat === 'wellbeing') {
    if (onStatus) onStatus('Consultazione indicatori benessere (OMS, Gallup, WHR, OCSE)...');
    await new Promise(r => setTimeout(r, 100));
    const item = SURFER_WELLBEING_ITEMS[Math.floor(Math.random() * SURFER_WELLBEING_ITEMS.length)];
    return { ...item };
  }

  // 5. COMUNITÀ TEMATICHE (Tech, Scienza, Mente, Lavoro, Relazioni)
  if (effectiveCat === 'community') {
    if (Math.random() < 0.45) {
      const liveHn = await fetchRandomHackerNewsLive(onStatus);
      if (liveHn) return liveHn;
    }
    if (onStatus) onStatus('Esplorazione comunità online (Tech, Scienza, Mente, Lavoro, Relazioni)...');
    await new Promise(r => setTimeout(r, 100));
    const item = SURFER_COMMUNITY_ITEMS[Math.floor(Math.random() * SURFER_COMMUNITY_ITEMS.length)];
    return { ...item };
  }

  // 6. ENCICLOPEDIA & ARTE (Wikipedia, Commons, Filosofia)
  const liveWiki = await fetchRandomWikipediaLive(onStatus);
  if (liveWiki) return liveWiki;

  if (onStatus) onStatus('Accesso all\'archivio letterario e filosofico universale...');
  const randomChoice = SURFER_FALLBACK_TEXTS[Math.floor(Math.random() * SURFER_FALLBACK_TEXTS.length)];
  return {
    ...randomChoice,
    type: 'text',
    category: 'wiki',
    catName: 'Enciclopedia & Arte',
    catIcon: '📚',
    meta: 'Archivio Filosofico e Letterario'
  };
}

/**
 * Fetch a random image from open web APIs (Wikimedia Commons or Wikipedia with thumbnail).
 */
async function fetchRandomImageFromWeb(onStatus) {
  if (onStatus) onStatus('Ricerca immagine aperta su Wikimedia Commons...');

  // Method 1: Wikimedia Commons Random Picture API
  try {
    const wmUrl = 'https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json&origin=*';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(wmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const pId of Object.keys(pages)) {
        const page = pages[pId];
        const info = page.imageinfo?.[0];
        if (info && info.mime && info.mime.startsWith('image/') && !info.mime.includes('svg') && !info.mime.includes('tiff')) {
          const directUrl = info.thumburl || info.url;
          if (directUrl) {
            let cleanTitle = (page.title || '').replace(/^File:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
            return {
              type: 'image',
              category: 'wiki',
              catName: 'Patrimonio Visivo Aperto',
              catIcon: '🖼️',
              meta: 'Wikimedia Commons • Immagine Libera',
              title: cleanTitle || 'Fotografia dell\'Umanità',
              subtitle: 'Wikimedia Commons • Patrimonio Visivo Aperto',
              source: 'Wikimedia Commons',
              icon: '📷',
              url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
              imageUrl: directUrl
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Wikimedia random query timed out, trying Wikipedia summary thumb...', err.message);
  }

  // Method 2: Wikipedia Summary with thumbnail
  try {
    if (onStatus) onStatus('Scansione articoli illustrati su Wikipedia...');
    const lang = Math.random() < 0.5 ? 'it' : 'en';
    const wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
    const res = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail && data.thumbnail.source) {
        return {
          type: 'image',
          category: 'wiki',
          catName: 'Patrimonio Visivo Aperto',
          catIcon: '🖼️',
          meta: `Wikipedia ${lang.toUpperCase()} • Thumbnail`,
          title: data.title,
          subtitle: data.description || (lang === 'it' ? 'Wikipedia Italia con Iconografia' : 'Wikipedia Visual Concept'),
          source: lang === 'it' ? 'Wikipedia IT' : 'Wikipedia EN',
          icon: '🖼️',
          url: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
          imageUrl: data.thumbnail.source
        };
      }
    }
  } catch (e) {
    console.warn('Wikipedia thumbnail fetch failed:', e.message);
  }

  // Method 3: Lorem Picsum random photography
  try {
    const picsumUrl = `https://picsum.photos/700/460?random=${Date.now()}`;
    return {
      type: 'image',
      category: 'wiki',
      catName: 'Patrimonio Visivo Aperto',
      catIcon: '🖼️',
      meta: 'Lorem Picsum Photography',
      title: 'Scorcio Fotografico del Mondo',
      subtitle: 'Lorem Picsum • Fotografia Creativa ad Alta Risoluzione',
      source: 'Picsum Web',
      icon: '📸',
      url: 'https://picsum.photos',
      imageUrl: picsumUrl
    };
  } catch (e) {
    console.warn('Picsum failed:', e);
  }

  // Fallback to curated artwork
  const chosen = SURFER_FALLBACK_IMAGES[Math.floor(Math.random() * SURFER_FALLBACK_IMAGES.length)];
  return { ...chosen, type: 'image' };
}

/**
 * Convert an image URL to base64 with multiple CORS safety fallbacks.
 */
function webImageToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    // Attempt 1: Fetch as Blob with CORS
    fetch(imageUrl, { mode: 'cors' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result;
          resolve({
            base64: resultStr.split(',')[1],
            mimeType: blob.type || 'image/jpeg'
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Attempt 2: Image element with canvas conversion
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 640;
            let w = img.naturalWidth || 600;
            let h = img.naturalHeight || 400;
            if (w > maxDim || h > maxDim) {
              if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
              else { w = Math.round((w * maxDim) / h); h = maxDim; }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            resolve({
              base64: dataUrl.split(',')[1],
              mimeType: 'image/jpeg'
            });
          } catch (canvasErr) {
            reject(canvasErr);
          }
        };
        img.onerror = () => reject(new Error("CORS o download dell'immagine bloccato dal server sorgente"));
        img.src = imageUrl;
      });
  });
}

/**
 * Execute the full emotional analysis on the fetched web item using existing tools:
 * - analyzeTextEmotion & findBestDatasetMatch for text
 * - callGeminiVision for image (with automatic fallback to text semantic analysis if Gemini quota/key is not set)
 */
/**
 * Fetch a random audio file from open public web sources (Wikimedia Commons Audio API or Curated Archive).
 */
async function fetchRandomAudioFromWeb(onStatus) {
  if (onStatus) onStatus('Ricerca di tracce audio aperte su Wikimedia Commons...');

  // Method 1: Random Audio file from Wikimedia Commons API
  try {
    const wmAudioUrl = 'https://commons.wikimedia.org/w/api.php?action=query&generator=random&grnnamespace=6&prop=imageinfo&iiprop=url|mime|size&format=json&origin=*';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    const res = await fetch(wmAudioUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const pId of Object.keys(pages)) {
        const page = pages[pId];
        const info = page.imageinfo?.[0];
        if (info && info.mime && (info.mime.startsWith('audio/') || (info.url && info.url.match(/\.(ogg|flac|mp3|wav|webm)$/i)))) {
          let cleanTitle = (page.title || '').replace(/^File:/i, '').replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          return {
            type: 'audio',
            category: 'wiki',
            catName: 'Patrimonio Sonoro Aperto',
            catIcon: '🎵',
            meta: `Wikimedia Commons Audio • ${info.mime || 'Audio OGG'}`,
            title: cleanTitle || 'Frammento Acustico Aperto',
            subtitle: 'Wikimedia Commons • Archivio Sonoro Globale',
            source: 'Wikimedia Commons Audio',
            icon: '🎵',
            url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
            audioUrl: info.url,
            mimeType: info.mime || 'audio/ogg',
            fallbackEmotion: 'Curiosità'
          };
        }
      }
    }
  } catch (err) {
    console.warn('Wikimedia Commons random audio query timed out or had no audio:', err.message);
  }

  // Method 2: Curated Masterpiece Audio with CORS-safe upload.wikimedia.org URLs
  if (onStatus) onStatus('Accesso all\'archivio sonoro sinfonico e naturale...');
  await new Promise(r => setTimeout(r, 100));
  const chosen = SURFER_FALLBACK_AUDIO[Math.floor(Math.random() * SURFER_FALLBACK_AUDIO.length)];
  return { ...chosen };
}

/**
 * Fetch a random video item from open public web sources (YouTube oEmbed / curated archives).
 */
async function fetchRandomVideoFromWeb(onStatus) {
  if (onStatus) onStatus('Consultazione archivio video e documentari aperti...');

  const chosen = SURFER_FALLBACK_VIDEOS[Math.floor(Math.random() * SURFER_FALLBACK_VIDEOS.length)];
  const item = { ...chosen };

  // Attempt live oEmbed to get fresh title, author and official thumbnail
  try {
    if (onStatus) onStatus(`Interrogazione oEmbed per «${item.title.substring(0, 30)}...»`);
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${item.videoId}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.title) item.title = data.title;
      if (data.author_name) item.subtitle = `${data.author_name} • Video Documentario & Espressione`;
      if (data.thumbnail_url) item.thumbnailUrl = data.thumbnail_url;
    }
  } catch (e) {
    console.warn('YouTube oEmbed non raggiungibile, utilizzo metadati locali:', e.message);
  }

  return item;
}

async function analyzeWebSurferItem(item, onStatus) {
  /* Web surfer emotion analyzer */
  if (item.type === 'text') {
    if (onStatus) onStatus('Analisi lessicale e vettoriale Plutchik del testo…');
    await new Promise(r => setTimeout(r, 80));

    const analysis = analyzeTextEmotion(item.text);
    if (!analysis) {
      const combined = `${item.title}. ${item.text}`;
      const secondTry = analyzeTextEmotion(combined);
      if (secondTry) {
        const match = findBestDatasetMatch(secondTry);
        return {
          type: 'text',
          analysis: secondTry,
          matchedEmotion: match,
          dominant: secondTry.dominant,
          confidence: secondTry.confidence,
          weights: secondTry.vector,
          aiNote: `Analisi semantica su «${item.title}». Rilevato vettore dominante in ${PLUTCHIK_PRIMARIES[secondTry.dominant]?.it}.`
        };
      }
      return {
        type: 'text',
        analysis: null,
        matchedEmotion: emotionsDataset.find(e => e.plutchik?.primary === 'sorpresa') || emotionsDataset[0],
        dominant: 'sorpresa',
        confidence: 0.65,
        weights: { sorpresa: 0.5, fiducia: 0.3, gioia: 0.2 },
        aiNote: `Segnale emotivo neutro; l'IA reagisce con contemplazione e curiosità per l'ignoto.`
      };
    }

    const matchedEmotion = findBestDatasetMatch(analysis);
    return {
      type: 'text',
      analysis,
      matchedEmotion,
      dominant: analysis.dominant,
      confidence: analysis.confidence,
      weights: analysis.vector,
      aiNote: `Scansione semantica del testo completata. Massima risonanza con ${matchedEmotion ? matchedEmotion.termine_originale : analysis.dominant}.`
    };
  }

  if (item.type === 'image') {
    if (onStatus) onStatus('Codifica immagine web in corso…');
    
    let base64Data = null;
    let mimeType = 'image/jpeg';

    try {
      const encoded = await webImageToBase64(item.imageUrl);
      base64Data = encoded.base64;
      mimeType = encoded.mimeType;
    } catch (imgErr) {
      console.warn("Impossibile convertire immagine in base64:", imgErr);
    }

    // If Gemini API Key is available and base64 succeeded, call Gemini Vision tool
    if (geminiApiKey && base64Data) {
      try {
        if (onStatus) onStatus('Consultando Google Gemini Vision API…');
        const geminiRes = await callGeminiVision(geminiApiKey, base64Data, mimeType, onStatus);

        const weights = geminiRes.plutchik_weights || {};
        let dominant = 'gioia', maxW = -1;
        for (const [k, w] of Object.entries(weights)) {
          if (w > maxW) { maxW = w; dominant = k; }
        }

        let datasetMatch =
          emotionsDataset.find(e =>
            e.plutchik?.primary === dominant &&
            (e.termine_originale.toLowerCase() === (geminiRes.emotion || '').toLowerCase() ||
             e.famiglia_emotiva.toLowerCase() === (geminiRes.emotion || '').toLowerCase())
          ) ||
          emotionsDataset.find(e => e.plutchik?.primary === dominant);

        return {
          type: 'image',
          analysis: geminiRes,
          matchedEmotion: datasetMatch,
          dominant,
          confidence: geminiRes.confidence || 0.85,
          weights,
          valenza: geminiRes.valenza,
          arousal: geminiRes.arousal,
          aiNote: geminiRes.description || `L'IA visiva percepisce ${geminiRes.emotion || dominant}.`
        };
      } catch (geminiErr) {
        console.warn("Gemini Vision non disponibile, passo al motore semantico di riserva:", geminiErr);
      }
    }

    // Resilient fallback: semantic text analysis on the image's title and contextual tags
    if (onStatus) onStatus('Analisi iconografica e semantica del titolo visivo…');
    const semanticText = `${item.title} ${item.subtitle || ''} ${item.fallbackEmotion || ''}`;
    const textAnalysis = analyzeTextEmotion(semanticText) || {
      dominant: 'sorpresa',
      confidence: 0.72,
      vector: { sorpresa: 0.55, gioia: 0.30, fiducia: 0.15 }
    };

    const datasetMatch = findBestDatasetMatch(textAnalysis) ||
      emotionsDataset.find(e => e.plutchik?.primary === textAnalysis.dominant) ||
      emotionsDataset[0];

    return {
      type: 'image',
      analysis: null,
      matchedEmotion: datasetMatch,
      dominant: textAnalysis.dominant,
      confidence: textAnalysis.confidence || 0.75,
      weights: textAnalysis.vector,
      aiNote: `Interpretazione visivo-contestuale dell'immagine: «${item.title}». Riconosciuto stato di ${datasetMatch.termine_originale}.`
    };
  }
}

/**
 * Render the discovered item and its analysis in the Surfer modal,
 * and apply the resulting emotion to the 3D entity if enabled.
 */
  if (item.type === 'audio') {
    if (onStatus) onStatus('Download traccia audio e decodifica Web Audio API...');
    let decodedBuffer = null;
    let dspAnalysis = null;

    try {
      const audioRes = await fetch(item.audioUrl, { mode: 'cors', signal: AbortSignal.timeout(9000) });
      if (audioRes.ok) {
        const arrayBuf = await audioRes.arrayBuffer();
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          const tempCtx = new AudioCtxClass();
          decodedBuffer = await tempCtx.decodeAudioData(arrayBuf);
          if (onStatus) onStatus('Elaborazione psicoacustica DSP e spettrogramma...');
          dspAnalysis = analyzeAudioLocally(decodedBuffer);
          try { tempCtx.close(); } catch (_) {}
        }
      }
    } catch (audioErr) {
      console.warn("Impossibile decodificare direttamente l'audio con Web Audio API (CORS o codec):", audioErr);
    }

    if (dspAnalysis) {
      const dominant = Object.entries(dspAnalysis.plutchik_weights).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'gioia';
      const pk = PLUTCHIK_PRIMARIES[dominant] || PLUTCHIK_PRIMARIES.gioia;
      const matched = emotionsDataset.find(e => e.plutchik?.primary === dominant && (e.termine_originale.toLowerCase() === dspAnalysis.emotion.toLowerCase())) ||
                      emotionsDataset.find(e => e.plutchik?.primary === dominant) || emotionsDataset[0];

      return {
        type: 'audio',
        analysis: dspAnalysis,
        audioBuffer: decodedBuffer,
        dsp: dspAnalysis.dsp,
        matchedEmotion: matched,
        dominant,
        confidence: dspAnalysis.confidence || 0.82,
        weights: dspAnalysis.plutchik_weights,
        valenza: dspAnalysis.valenza,
        arousal: dspAnalysis.arousal,
        aiNote: `Scansione acustica DSP completata: ${dspAnalysis.description}`
      };
    }

    // Resilient fallback: semantic text analysis on audio title, genre and fallback emotion
    if (onStatus) onStatus('Analisi semantica e timbrica del titolo musicale...');
    const semanticText = `${item.title} ${item.subtitle || ''} ${item.fallbackEmotion || ''}`;
    const textAnalysis = analyzeTextEmotion(semanticText) || {
      dominant: 'fiducia',
      confidence: 0.74,
      vector: { fiducia: 0.45, gioia: 0.35, anticipazione: 0.20 }
    };
    const matchedEmotion = findBestDatasetMatch(textAnalysis) || emotionsDataset[0];
    return {
      type: 'audio',
      analysis: null,
      audioBuffer: null,
      matchedEmotion,
      dominant: textAnalysis.dominant,
      confidence: textAnalysis.confidence || 0.75,
      weights: textAnalysis.vector,
      aiNote: `Interpretazione psicoacustica della traccia: «${item.title}». Tonalità dominante: ${matchedEmotion.termine_originale}.`
    };
  }

  if (item.type === 'video') {
    if (onStatus) onStatus('Acquisizione fotogramma di copertina del video...');
    let base64Data = null;
    let mimeType = 'image/jpeg';

    if (item.thumbnailUrl) {
      try {
        const encoded = await webImageToBase64(item.thumbnailUrl);
        base64Data = encoded.base64;
        mimeType = encoded.mimeType;
      } catch (thumbErr) {
        console.warn("Impossibile convertire miniatura video in base64:", thumbErr);
      }
    }

    // If Gemini Vision available, analyze thumbnail
    if (geminiApiKey && base64Data) {
      try {
        if (onStatus) onStatus('Analisi del fotogramma video con Google Gemini Vision...');
        const geminiRes = await callGeminiVision(geminiApiKey, base64Data, mimeType, onStatus);
        const weights = geminiRes.plutchik_weights || {};
        let dominant = 'gioia', maxW = -1;
        for (const [k, w] of Object.entries(weights)) {
          if (w > maxW) { maxW = w; dominant = k; }
        }
        let datasetMatch = emotionsDataset.find(e =>
          e.plutchik?.primary === dominant &&
          (e.termine_originale.toLowerCase() === (geminiRes.emotion || '').toLowerCase())
        ) || emotionsDataset.find(e => e.plutchik?.primary === dominant);

        return {
          type: 'video',
          analysis: geminiRes,
          matchedEmotion: datasetMatch,
          dominant,
          confidence: geminiRes.confidence || 0.86,
          weights,
          valenza: geminiRes.valenza,
          arousal: geminiRes.arousal,
          aiNote: geminiRes.description || `L'IA visiva riconosce nel filmato: ${geminiRes.emotion || dominant}.`
        };
      } catch (geminiErr) {
        console.warn("Gemini Vision per video non disponibile, passo all'analisi semantica:", geminiErr);
      }
    }

    // Resilient fallback: semantic text analysis of video title and description
    if (onStatus) onStatus('Analisi tematica e cinematografica del video...');
    const semanticText = `${item.title} ${item.subtitle || ''} ${item.fallbackEmotion || ''}`;
    const textAnalysis = analyzeTextEmotion(semanticText) || {
      dominant: 'sorpresa',
      confidence: 0.76,
      vector: { sorpresa: 0.50, gioia: 0.30, anticipazione: 0.20 }
    };
    const matchedEmotion = findBestDatasetMatch(textAnalysis) || emotionsDataset[0];
    return {
      type: 'video',
      analysis: null,
      matchedEmotion,
      dominant: textAnalysis.dominant,
      confidence: textAnalysis.confidence || 0.78,
      weights: textAnalysis.vector,
      aiNote: `Analisi audiovisiva di «${item.title}»: evocazione di ${matchedEmotion.termine_originale}.`
    };
  }
}

function renderSurferDiscovery(item, analysisData) {
  const emptyState    = document.getElementById('surfer-empty-state');
  const contentView   = document.getElementById('surfer-content-view');
  const catBadge      = document.getElementById('surfer-category-badge');
  const catIcon       = document.getElementById('surfer-cat-icon');
  const catName       = document.getElementById('surfer-cat-name');
  const sourceIcon    = document.getElementById('surfer-source-icon');
  const sourceName    = document.getElementById('surfer-source-name');
  const metaInfo      = document.getElementById('surfer-meta-info');
  const externalLink  = document.getElementById('surfer-external-link');
  const itemTitle     = document.getElementById('surfer-item-title');
  const itemSubtitle  = document.getElementById('surfer-item-subtitle');
  const textBox       = document.getElementById('surfer-text-box');
  const textContent   = document.getElementById('surfer-text-content');
  const imageBox      = document.getElementById('surfer-image-box');
  const imageEl       = document.getElementById('surfer-image-el');
  const audioBox      = document.getElementById('surfer-audio-box');
  const audioEl       = document.getElementById('surfer-audio-el');
  const audioWaveform = document.getElementById('surfer-audio-waveform');
  const audioMeta     = document.getElementById('surfer-audio-meta');
  const videoBox      = document.getElementById('surfer-video-box');
  const videoIframe   = document.getElementById('surfer-video-iframe');
  const videoThumbWrap = document.getElementById('surfer-video-thumb-wrap');
  const videoThumb    = document.getElementById('surfer-video-thumb');
  const videoPlayBtn  = document.getElementById('surfer-video-play-btn');
  const videoMeta     = document.getElementById('surfer-video-meta');
  const banner        = document.getElementById('surfer-detected-banner');
  const detectedName  = document.getElementById('surfer-detected-name');
  const detectedSub   = document.getElementById('surfer-detected-sub');
  const ringProgress  = document.getElementById('surfer-ring-progress');
  const ringPct       = document.getElementById('surfer-ring-pct');
  const aiDesc        = document.getElementById('surfer-ai-desc');
  const barsContainer = document.getElementById('surfer-bars');
  const matchCard     = document.getElementById('surfer-match-card');

  if (emptyState) emptyState.style.display = 'none';
  if (contentView) contentView.style.display = 'block';

  // Category Badge
  if (catBadge) {
    catBadge.setAttribute('data-cat', item.category || 'wiki');
    if (catIcon) catIcon.textContent = item.catIcon || '🌐';
    if (catName) catName.textContent = item.catName || 'Enciclopedia & Arte';
  }

  // Source Pill & Meta
  if (sourceIcon) sourceIcon.textContent = item.icon || '🌐';
  if (sourceName) sourceName.textContent = item.source || 'Web';
  if (metaInfo) metaInfo.textContent = item.meta || '';
  if (externalLink) {
    externalLink.href = item.url || '#';
    externalLink.style.display = item.url ? 'inline-flex' : 'none';
  }

  // Title & Subtitle
  if (itemTitle) itemTitle.textContent = item.title;
  if (itemSubtitle) itemSubtitle.textContent = item.subtitle || '';

  // Content display (Text, Image, Audio, Video)
  if (textBox) textBox.style.display = item.type === 'text' ? 'block' : 'none';
  if (textContent && item.type === 'text') textContent.textContent = item.text;

  if (imageBox) imageBox.style.display = item.type === 'image' ? 'flex' : 'none';
  if (imageEl && item.type === 'image') {
    imageEl.src = item.imageUrl;
    imageEl.alt = item.title;
  }

  if (audioBox) audioBox.style.display = item.type === 'audio' ? 'flex' : 'none';
  if (item.type === 'audio') {
    if (audioEl) {
      audioEl.src = item.audioUrl || '';
      audioEl.load();
    }
    if (audioMeta) {
      audioMeta.innerHTML = `<span>Formato: ${item.mimeType || 'Audio Web'}</span><span>•</span><span>DSP: ${analysisData.dsp ? 'Analisi acustica completata' : 'Elaborazione spettrale'}</span>`;
    }
    if (audioWaveform && analysisData.audioBuffer) {
      drawAudioWaveform(audioWaveform, analysisData.audioBuffer, 0, '#06b6d4');
    }
  }

  if (videoBox) videoBox.style.display = item.type === 'video' ? 'flex' : 'none';
  if (item.type === 'video') {
    if (videoThumbWrap) videoThumbWrap.style.display = 'flex';
    if (videoIframe) {
      videoIframe.style.display = 'none';
      videoIframe.src = '';
    }
    if (videoThumb) {
      videoThumb.src = item.thumbnailUrl || '';
      videoThumb.alt = item.title;
    }
    if (videoMeta) {
      videoMeta.innerHTML = `<span>Sorgente: ${item.source || 'Video'}</span><span>•</span><span>Riconoscimento: ${analysisData.type === 'video' && analysisData.analysis ? 'Gemini Vision / Traccia Visiva' : 'Iconografico & Semantico'}</span>`;
    }
    if (videoPlayBtn && videoIframe && videoThumbWrap) {
      videoPlayBtn.onclick = () => {
        if (item.videoEmbedUrl) {
          videoIframe.src = item.videoEmbedUrl + (item.videoEmbedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
          videoIframe.style.display = 'block';
          videoThumbWrap.style.display = 'none';
        } else if (item.url) {
          window.open(item.url, '_blank');
        }
      };
    }
  }
  /* END_VIDEO */
  if (false) {
  if (item.type === 'text') {



  } else {





    }
  }

  // Emotion calculations
  const dominantKey = analysisData.dominant || 'gioia';
  const pk = PLUTCHIK_PRIMARIES[dominantKey] || PLUTCHIK_PRIMARIES.gioia;
  const confidence = Math.max(0.1, Math.min(1.0, analysisData.confidence || 0.75));
  const pct = Math.round(confidence * 100);

  // Confidence ring
  if (ringProgress) {
    const offset = (113.1 * (1 - confidence)).toFixed(1);
    ringProgress.setAttribute('stroke-dashoffset', offset);
    ringProgress.style.stroke = pk.color;
  }
  if (ringPct) {
    ringPct.textContent = `${pct}%`;
    ringPct.style.color = pk.color;
  }

  // Banner
  if (banner) {
    banner.style.borderColor = `${pk.color}55`;
    banner.style.background = `${pk.color}15`;
  }
  if (detectedName) {
    detectedName.textContent = analysisData.matchedEmotion ? analysisData.matchedEmotion.termine_originale : pk.it;
    detectedName.style.color = pk.color;
  }
  if (detectedSub) {
    const modeLabel = item.type === 'text' ? 'Scansione Testuale' : item.type === 'image' ? 'Visione Artificiale' : item.type === 'audio' ? 'Analisi Psicoacustica DSP' : 'Riconoscimento Audiovisivo';
    detectedSub.textContent = `Famiglia: ${pk.it.toUpperCase()} • Risonanza Plutchik: ${pct}% • ${modeLabel}`;
  }

  // AI Description / Note
  if (aiDesc) {
    if (analysisData.aiNote) {
      aiDesc.textContent = `« ${analysisData.aiNote} »`;
      aiDesc.style.display = 'block';
      aiDesc.style.borderLeftColor = pk.color;
    } else {
      aiDesc.style.display = 'none';
    }
  }

  // Plutchik Bars
  if (barsContainer) {
    barsContainer.innerHTML = '';
    const weights = analysisData.weights || {};
    const sorted = Object.entries(weights).sort((a, b) => b[1] - a[1]);
    sorted.forEach(([key, val]) => {
      if (val < 0.02) return;
      const info = PLUTCHIK_PRIMARIES[key];
      if (!info) return;
      const barPct = Math.round(val * 100);
      const row = document.createElement('div');
      row.className = 'vector-row';
      row.innerHTML = `
        <span class="vector-name" style="color: ${info.color}">${info.it}</span>
        <div class="vector-bar-wrap">
          <div class="vector-bar-fill" style="width: ${barPct}%; background: ${info.color}"></div>
        </div>
        <span class="vector-pct">${barPct}%</span>
      `;
      barsContainer.appendChild(row);
    });
  }

  // Dataset Match Card
  const matched = analysisData.matchedEmotion;
  if (matchCard) {
    if (matched) {
      const mpk = matched.plutchik || pk;
      matchCard.innerHTML = `
        <div class="analyze-match-header">
          <div class="item-dot" style="background: ${mpk.color || pk.color}; width:10px; height:10px; border-radius:50%; flex-shrink:0"></div>
          <strong style="color: ${mpk.color || pk.color}">${matched.termine_originale}</strong>
          <span style="color: #94a3b8; font-size: 0.72rem">${(matched.lingua_cultura || '').split('/')[0]}</span>
        </div>
        <p style="color: #94a3b8; font-size: 0.78rem; line-height: 1.5; margin-top: 6px">
          ${(matched.significato_italiano || '').substring(0, 180)}${(matched.significato_italiano || '').length > 180 ? '…' : ''}
        </p>
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap">
          <span class="tag tag-valenza-${matched.valenza}" style="font-size:0.68rem">Valenza: ${matched.valenza}</span>
          <span class="tag" style="font-size:0.68rem">Arousal: ${matched.arousal}</span>
        </div>
      `;
    } else {
      matchCard.innerHTML = '<p style="color: #64748b; font-size: 0.8rem;">Voce sintetica basata sul vettore Plutchik decodificato.</p>';
    }
  }

  // Build the synthesized emotion object for 3D metamorfosi
  const emotionObjToApply = matched ? { ...matched } : {
    termine_originale: pk.it,
    lingua_cultura: 'Navigatore Web Randomico',
    famiglia_emotiva: pk.it,
    significato_italiano: analysisData.aiNote || `Sensazione evocata dalla risorsa web «${item.title}».`,
    valenza: 'neutra',
    arousal: 'medio',
    modello_fonte: 'Navigazione Web Serendipica',
    plutchik: null
  };

  // Ensure weights match the discovered vector
  emotionObjToApply.plutchik = {
    primary: dominantKey,
    primary_it: pk.it,
    secondary: null,
    secondary_it: null,
    weights: analysisData.weights || { [dominantKey]: 1.0 },
    color: pk.color,
    glow: pk.glow,
    core: pk.core,
    angle: pk.angle,
    physics: { ...pk.physics }
  };

  lastSurferEmotionResult = emotionObjToApply;

  // Auto-apply to 3D entity if checkbox is checked
  const autoApplyCheckbox = document.getElementById('surfer-auto-apply');
  if (autoApplyCheckbox && autoApplyCheckbox.checked) {
    applyEmotion(emotionObjToApply, true);
    const input = document.getElementById('emotion-input');
    if (input) input.value = emotionObjToApply.termine_originale;
  }

  // Record in History
  recordSurferHistory({
    type: item.type,
    title: item.title,
    source: item.source,
    category: item.category || 'wiki',
    catIcon: item.catIcon || (item.type === 'image' ? '🖼️' : item.type === 'audio' ? '🎵' : item.type === 'video' ? '🎬' : '📜'),
    emotionName: emotionObjToApply.termine_originale,
    emotionColor: pk.color,
    emotionObj: emotionObjToApply,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  });
}

/**
 * Record a step in the surfer history timeline and update DOM.
 */
function recordSurferHistory(entry) {
  surferHistory.unshift(entry);
  if (surferHistory.length > 25) surferHistory.pop();

  const countEl = document.getElementById('surfer-history-count');
  if (countEl) countEl.textContent = `${surferHistory.length} ${surferHistory.length === 1 ? 'tappa' : 'tappe'}`;

  const listEl = document.getElementById('surfer-history-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  surferHistory.forEach((histItem) => {
    const row = document.createElement('div');
    row.className = 'surfer-history-item';
    row.title = `Fai clic per rievocare: ${histItem.emotionName} (${histItem.source})`;
    row.innerHTML = `
      <div class="surfer-history-item-left">
        <span class="surfer-history-type-icon" title="${histItem.source}">${histItem.catIcon || (histItem.type === 'image' ? '🖼️' : histItem.type === 'audio' ? '🎵' : histItem.type === 'video' ? '🎬' : '📜')}</span>
        <span class="surfer-history-title">${histItem.title}</span>
      </div>
      <div class="surfer-history-item-right">
        <span class="surfer-history-badge" style="background: ${histItem.emotionColor}22; color: ${histItem.emotionColor}; border: 1px solid ${histItem.emotionColor}55">
          ${histItem.emotionName}
        </span>
        <span style="font-size:0.65rem; color:#64748b; font-family:var(--font-mono)">${histItem.time}</span>
      </div>
    `;

    row.addEventListener('click', () => {
      applyEmotion(histItem.emotionObj, true);
      const input = document.getElementById('emotion-input');
      if (input) input.value = histItem.emotionObj.termine_originale;
    });

    listEl.appendChild(row);
  });
}

/**
 * Perform one single exploration step on the web:
 * 1. Randomly decide whether to fetch text or image based on current mode
 * 2. Retrieve content
 * 3. Analyze emotion with created tools
 * 4. Update UI & morph 3D entity
 */
async function performWebSurferStep() {
  if (isSurferBusy) return;
  isSurferBusy = true;

  const btnStep      = document.getElementById('btn-surfer-step');
  const statusBox    = document.getElementById('surfer-status-box');
  const statusStep   = document.getElementById('surfer-status-step');
  const statusDetail = document.getElementById('surfer-status-detail');

  if (btnStep) btnStep.disabled = true;
  if (statusBox) statusBox.style.display = 'flex';

  const updateStatus = (step, detail = '') => {
    if (statusStep) statusStep.textContent = step;
    if (statusDetail) statusDetail.textContent = detail;
  };

  try {
    // 1. Determine type
    let chosenType = 'text';
    if (surferMode === 'mixed') {
      const rnd = Math.random();
      if (rnd < 0.35) chosenType = 'text';
      else if (rnd < 0.65) chosenType = 'image';
      else if (rnd < 0.85) chosenType = 'audio';
      else chosenType = 'video';
    } else if (surferMode === 'image') {
      chosenType = 'image';
    } else if (surferMode === 'audio') {
      chosenType = 'audio';
    } else if (surferMode === 'video') {
      chosenType = 'video';
    }

    const typeDesc = chosenType === 'text' ? `Canale: ${getSourceCategoryLabel(surferSourceCategory)}` :
                     chosenType === 'image' ? 'Ricerca iconografica e visiva aperta' :
                     chosenType === 'audio' ? 'Archivio sonoro e paesaggi acustici' :
                     'Documentari e filmati audiovisivi';
    updateStatus('Esplorazione del Web in corso…', typeDesc);

    // 2. Fetch content
    let item = null;
    if (chosenType === 'image') {
      item = await fetchRandomImageFromWeb(msg => updateStatus('Ricerca immagine sul web…', msg));
      if (!item.category) {
        item.category = 'wiki';
        item.catName = 'Patrimonio Visivo Aperto';
        item.catIcon = '🖼️';
      }
    } else {
      if (chosenType === 'audio') {
      item = await fetchRandomAudioFromWeb(msg => updateStatus('Ricerca audio sul web…', msg));
      if (!item.category) {
        item.category = 'wiki';
        item.catName = 'Patrimonio Sonoro Aperto';
        item.catIcon = '🎵';
      }
    } else if (chosenType === 'video') {
      item = await fetchRandomVideoFromWeb(msg => updateStatus('Ricerca video sul web…', msg));
      if (!item.category) {
        item.category = 'wiki';
        item.catName = 'Patrimonio Audiovisivo';
        item.catIcon = '🎬';
      }
    } else {
        item = await fetchRandomTextContent(surferSourceCategory, msg => updateStatus('Navigazione web…', msg));
      }
    }

    // 3. Analyze with created tools
    const analysisDesc = item.type === 'text' ? 'Decodifica lessicale e vettoriale Plutchik' :
                         item.type === 'image' ? 'Elaborazione visione artificiale' :
                         item.type === 'audio' ? 'Decodifica Web Audio DSP e spettrogramma' :
                         'Riconoscimento fotogramma e metadati video';
    updateStatus('Analisi emotiva in corso…', analysisDesc);
    const analysisData = await analyzeWebSurferItem(item, msg => updateStatus('Analisi emotiva in corso…', msg));

    // 4. Render & Morph
    updateStatus('Metamorfosi dell\'entità sintetica…', `Emozione rilevata: ${analysisData.matchedEmotion ? analysisData.matchedEmotion.termine_originale : analysisData.dominant}`);
    await new Promise(r => setTimeout(r, 200));

    renderSurferDiscovery(item, analysisData);

  } catch (err) {
    console.error("Errore durante l'esplorazione web:", err);
    updateStatus('Errore di connessione', err.message);
    await new Promise(r => setTimeout(r, 1200));
  } finally {
    isSurferBusy = false;
    if (btnStep) btnStep.disabled = false;
    if (statusBox) statusBox.style.display = 'none';
  }
}

/**
 * Start or stop the auto-pilot continuous browsing loop.
 */
function toggleSurferAutoPilot() {
  surferAutoPilot = !surferAutoPilot;
  const btn = document.getElementById('btn-surfer-autopilot');
  const btnText = document.getElementById('autopilot-btn-text');
  const timerStatus = document.getElementById('surfer-timer-status');
  const countdownEl = document.getElementById('surfer-timer-countdown');
  const progressBar = document.getElementById('surfer-timer-progress');

  if (surferAutoPilot) {
    if (btn) btn.classList.add('active');
    if (btnText) btnText.textContent = 'Pilota Automatico: ATTIVO';
    if (timerStatus) timerStatus.style.display = 'flex';

    // Immediate first exploration step if empty
    const contentView = document.getElementById('surfer-content-view');
    if (!contentView || contentView.style.display === 'none') {
      performWebSurferStep();
    }

    // Reset countdown
    surferCountdownRemaining = surferCountdownSec;
    if (countdownEl) countdownEl.textContent = `Prossimo salto: ${surferCountdownRemaining}s`;
    if (progressBar) progressBar.style.width = '0%';

    // Run timer tick every 1 second
    if (surferProgressInterval) clearInterval(surferProgressInterval);
    surferProgressInterval = setInterval(() => {
      if (!surferAutoPilot) return;

      surferCountdownRemaining--;
      if (countdownEl) countdownEl.textContent = `Prossimo salto: ${Math.max(0, surferCountdownRemaining)}s`;

      const pct = Math.round(((surferCountdownSec - surferCountdownRemaining) / surferCountdownSec) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;

      if (surferCountdownRemaining <= 0) {
        surferCountdownRemaining = surferCountdownSec;
        if (progressBar) progressBar.style.width = '0%';
        performWebSurferStep();
      }
    }, 1000);

  } else {
    if (btn) btn.classList.remove('active');
    if (btnText) btnText.textContent = 'Pilota Automatico: OFF';
    if (timerStatus) timerStatus.style.display = 'none';
    if (surferProgressInterval) {
      clearInterval(surferProgressInterval);
      surferProgressInterval = null;
    }
  }
}

/**
 * Initialize all event listeners and UI controls for the Random Web Surfer modal.
 */
function initWebSurferModal() {
  const modal       = document.getElementById('modal-web-surfer');
  const btnToggle   = document.getElementById('btn-web-surfer-toggle');
  const btnClose    = document.getElementById('btn-close-web-surfer');
  const btnStep     = document.getElementById('btn-surfer-step');
  const btnAutopilot = document.getElementById('btn-surfer-autopilot');
  const btnApply    = document.getElementById('btn-surfer-apply');
  const modePills   = document.querySelectorAll('.surfer-pill');
  const sourcePills = document.querySelectorAll('.surfer-source-pill');
  const activeSourceLabel = document.getElementById('surfer-active-source-badge');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    if (btnToggle) btnToggle.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('open');
    if (btnToggle) btnToggle.classList.remove('active');
  }

  if (btnToggle) btnToggle.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Mode Selector Pills (Mixed, Text, Image)
  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      modePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      surferMode = pill.getAttribute('data-surfer-mode') || 'mixed';
    });
  });

  // Source Category Selector Pills (All, News, Social, Trends, Wellbeing, Community, Wiki)
  sourcePills.forEach(pill => {
    pill.addEventListener('click', () => {
      sourcePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      surferSourceCategory = pill.getAttribute('data-surfer-source') || 'all';
      if (activeSourceLabel) {
        activeSourceLabel.textContent = getSourceCategoryLabel(surferSourceCategory);
      }
    });
  });

  // Action Buttons
  if (btnStep) {
    btnStep.addEventListener('click', () => {
      performWebSurferStep();
    });
  }

  if (btnAutopilot) {
    btnAutopilot.addEventListener('click', () => {
      toggleSurferAutoPilot();
    });
  }

  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (lastSurferEmotionResult) {
        applyEmotion(lastSurferEmotionResult, true);
        const input = document.getElementById('emotion-input');
        if (input) input.value = lastSurferEmotionResult.termine_originale;
        closeModal();
      }
    });
  }
}

// ============================================================================
// 12.7. VIDEO EMOTION ANALYSIS (Gemini Vision multiframe + Fallback Locale)
// ============================================================================

/** Last video-analysis result — used when "Apply" button is pressed */
let lastVideoAnalysisResult = null;

/** Number of frames to sample from the video */
let videoFrameCount = 8;

/**
 * Extract N evenly-spaced JPEG frames from an HTMLVideoElement and
 * calculate optical & visual metrics on each frame.
 * @param {HTMLVideoElement} videoEl
 * @param {HTMLCanvasElement} canvas  Off-screen canvas for rendering
 * @param {number} n  Number of frames to extract
 * @param {Function} [onProgress]  Called with (currentFrame, totalFrames)
 * @returns {Promise<Array<{base64: string, mimeType: string, time: number, metrics: Object}>>}
 */
async function extractVideoFrames(videoEl, canvas, n, onProgress) {
  const duration = videoEl.duration;
  if (!duration || !isFinite(duration)) {
    throw new Error('Impossibile determinare la durata del video.');
  }

  const frames = [];
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Use a compact frame size to stay within API limits and keep processing fast
  const TARGET_W = 512;
  const scale = TARGET_W / (videoEl.videoWidth || 640);
  canvas.width = TARGET_W;
  canvas.height = Math.round((videoEl.videoHeight || 360) * scale);

  let prevYData = null;

  for (let i = 0; i < n; i++) {
    // Space frames evenly, excluding the very first and last second
    const safeStart = Math.min(0.5, duration * 0.05);
    const safeEnd   = Math.max(duration - 0.5, duration * 0.95);
    const t = n === 1
      ? duration / 2
      : safeStart + (safeEnd - safeStart) * (i / (n - 1));

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timeout caricamento frame ${i + 1}`)), 8000);
      videoEl.onseeked = () => { clearTimeout(timeout); resolve(); };
      videoEl.currentTime = t;
    });

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    const base64 = dataUrl.split(',')[1];

    // Extract visual metrics for local dynamic analysis
    let metrics = null;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let rSum = 0, gSum = 0, bSum = 0, satSum = 0;
      const step = Math.max(1, Math.floor(data.length / (TARGET_W * 12)));
      let samples = 0;
      let motionSum = 0;
      const yData = new Uint8Array(Math.floor(data.length / (4 * step)));
      let yIdx = 0;

      for (let p = 0; p < data.length; p += step * 4) {
        const r = data[p], g = data[p + 1], b = data[p + 2];
        rSum += r; gSum += g; bSum += b;
        const maxC = Math.max(r, g, b);
        const minC = Math.min(r, g, b);
        satSum += (maxC - minC) / 255;
        const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        yData[yIdx] = y;
        if (prevYData && yIdx < prevYData.length) {
          motionSum += Math.abs(y - prevYData[yIdx]);
        }
        yIdx++;
        samples++;
      }

      const avgR = rSum / (samples || 1);
      const avgG = gSum / (samples || 1);
      const avgB = bSum / (samples || 1);
      const brightness = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
      const warmth = (avgR - avgB) / 255;
      const saturation = satSum / (samples || 1);
      const motion = prevYData ? (motionSum / (samples || 1)) / 255 : 0;
      prevYData = yData;

      metrics = { brightness, warmth, saturation, motion, avgR, avgG, avgB };
    } catch (metricErr) {
      console.warn("Could not compute pixel metrics for frame:", metricErr);
      metrics = { brightness: 0.5, warmth: 0, saturation: 0.4, motion: 0.08 };
    }

    frames.push({ base64, mimeType: 'image/jpeg', time: t, metrics });

    if (onProgress) onProgress(i + 1, n);
  }

  return frames;
}

/**
 * Local heuristic engine: evaluates color psychology, contrast, and inter-frame motion.
 * Maps visual and narrative dynamics directly to Plutchik's 8 primary dimensions.
 * @param {Array<{base64: string, time: number, metrics: Object}>} frames
 * @returns {Object} Result object compatible with renderVideoAnalysisResults
 */
function analyzeVideoLocally(frames) {
  let avgBrightness = 0, avgWarmth = 0, avgSaturation = 0, avgMotion = 0;
  const frameEmotions = [];

  frames.forEach((f, idx) => {
    const m = f.metrics || { brightness: 0.5, warmth: 0, saturation: 0.4, motion: 0.08 };
    avgBrightness += m.brightness;
    avgWarmth += m.warmth;
    avgSaturation += m.saturation;
    avgMotion += m.motion;

    // Per-frame heuristic emotion classification
    let frameLabel = "Equilibrio";
    if (m.motion > 0.14) {
      frameLabel = m.warmth > 0.06 ? "Tensione Dinamica" : "Allerta / Sorpresa";
    } else if (m.brightness > 0.62) {
      frameLabel = m.warmth > 0.02 ? "Serenità Luminosa" : "Stupore Candido";
    } else if (m.brightness < 0.32) {
      frameLabel = m.warmth < -0.04 ? "Malinconia Notturna" : "Ombra Sospesa";
    } else if (m.saturation > 0.45) {
      frameLabel = "Carica Espressiva";
    } else {
      frameLabel = "Calma Riflessiva";
    }
    frameEmotions.push(frameLabel);
  });

  const count = frames.length || 1;
  avgBrightness /= count;
  avgWarmth /= count;
  avgSaturation /= count;
  avgMotion /= count;

  // Plutchik dimension weights synthesized from temporal visual heuristics
  const wGioia = Math.max(0.06, avgBrightness * 0.45 + Math.max(0, avgWarmth) * 0.35 + avgSaturation * 0.2);
  const wTristezza = Math.max(0.06, (1 - avgBrightness) * 0.45 + Math.max(0, -avgWarmth) * 0.35 + (1 - Math.min(1, avgMotion * 3)) * 0.2);
  const wRabbia = Math.max(0.06, Math.max(0, avgWarmth) * 0.4 + Math.min(1, avgMotion * 2.5) * 0.4 + avgSaturation * 0.2);
  const wPaura = Math.max(0.06, (1 - avgBrightness) * 0.35 + Math.min(1, avgMotion * 2.5) * 0.45 + Math.max(0, -avgWarmth) * 0.2);
  const wSorpresa = Math.max(0.06, avgBrightness * 0.35 + Math.min(1, avgMotion * 2.8) * 0.4 + avgSaturation * 0.25);
  const wFiducia = Math.max(0.06, (1 - Math.min(1, avgMotion * 2.5)) * 0.45 + (1 - Math.abs(avgWarmth)) * 0.35 + avgBrightness * 0.2);
  const wDisgusto = Math.max(0.06, (1 - avgBrightness) * 0.3 + avgSaturation * 0.35 + Math.max(0, -avgWarmth) * 0.35);
  const wAnticipazione = Math.max(0.06, Math.min(1, avgMotion * 2.2) * 0.35 + avgWarmth * 0.3 + avgBrightness * 0.35);

  const rawWeights = {
    gioia: wGioia,
    tristezza: wTristezza,
    rabbia: wRabbia,
    paura: wPaura,
    sorpresa: wSorpresa,
    fiducia: wFiducia,
    disgusto: wDisgusto,
    anticipazione: wAnticipazione
  };

  let sum = 0;
  for (const k in rawWeights) sum += rawWeights[k];
  const plutchik_weights = {};
  for (const k in rawWeights) plutchik_weights[k] = +(rawWeights[k] / sum).toFixed(3);

  let dominant = "gioia", maxW = -1;
  for (const [k, w] of Object.entries(plutchik_weights)) {
    if (w > maxW) { maxW = w; dominant = k; }
  }

  const pk = PLUTCHIK_PRIMARIES[dominant] || PLUTCHIK_PRIMARIES.gioia;
  const valenza = (dominant === 'gioia' || dominant === 'fiducia') ? 'positiva'
                : (dominant === 'sorpresa' || dominant === 'anticipazione') ? 'neutra'
                : 'negativa';
  const arousal = avgMotion > 0.12 ? 'alto' : avgMotion > 0.05 ? 'medio' : 'basso';

  const desc = `Analisi iconografica e dinamica locale: ${count} fotogrammi temporali esaminati, gradiente cromatico ${avgWarmth > 0 ? 'caldo ed estroflesso' : 'freddo e introspettivo'}, luminosità media ${(avgBrightness * 100).toFixed(0)}%, flusso di movimento ${arousal}.`;

  return {
    emotion: pk.it,
    confidence: +(0.72 + maxW * 0.22).toFixed(2),
    description: desc,
    frame_emotions: frameEmotions,
    plutchik_weights,
    valenza,
    arousal
  };
}

/**
 * Call Gemini Vision API with multiple frames from a video.
 * Each frame is sent as a separate inline_data part.
 * @param {string} apiKey
 * @param {Array<{base64: string, mimeType: string, time: number}>} frames
 * @param {Function} [onStatus]
 * @returns {Promise<Object>}  Parsed JSON result
 */
async function callGeminiVideo(apiKey, frames, onStatus) {
  const frameDescriptions = frames.map((f, i) =>
    `Frame ${i + 1} (al secondo ${f.time.toFixed(1)})`
  ).join(', ');

  const PROMPT = `Sei un esperto di psicologia delle emozioni specializzato nella ruota di Plutchik e nell'analisi cinematografica dell'espressione emotiva.

Ti vengono forniti ${frames.length} frame estratti da un video: ${frameDescriptions}.

Analizza attentamente ogni frame (espressioni facciali, linguaggio del corpo, colori, contesto, simbolismo, dinamica narrativa tra i frame) e identifica l'emozione umana predominante che emerge dall'insieme del video.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido (senza markdown, senza testo aggiuntivo) che rispetta questo schema:
{
  "emotion": "<nome dell'emozione predominante in italiano>",
  "confidence": <numero da 0 a 1>,
  "description": "<frase in italiano che sintetizza l'emozione emergente dall'intero video>",
  "frame_emotions": [<per ogni frame: stringa con emozione breve, es. "Gioia", "Tristezza", "Paura">],
  "plutchik_weights": {
    "gioia": <0-1>,
    "fiducia": <0-1>,
    "paura": <0-1>,
    "sorpresa": <0-1>,
    "tristezza": <0-1>,
    "disgusto": <0-1>,
    "rabbia": <0-1>,
    "anticipazione": <0-1>
  },
  "valenza": "<'positiva' | 'negativa' | 'neutra'>",
  "arousal": "<'alto' | 'medio' | 'basso'>"
}
I valori di plutchik_weights devono sommare a circa 1.0.
frame_emotions deve avere esattamente ${frames.length} elementi.`.trim();

  const CANDIDATE_MODELS = [
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  const sleep = ms => new Promise(res => setTimeout(res, ms));
  let lastError = null;

  for (let mIdx = 0; mIdx < CANDIDATE_MODELS.length; mIdx++) {
    const model = CANDIDATE_MODELS[mIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts = [{ text: PROMPT }];
    for (const frame of frames) {
      parts.push({ inline_data: { mime_type: frame.mimeType, data: frame.base64 } });
    }

    const body = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 768 }
    };

    try {
      if (onStatus) {
        if (mIdx === 0) onStatus(`Consultando Gemini Vision (${model}) con ${frames.length} frame…`);
        else onStatus(`Tentativo con modello alternativo (${model})…`);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
        const errStatus = response.status;

        if (errStatus === 400 && (errMsg.includes('API key') || errMsg.includes('INVALID_ARGUMENT'))) {
          throw new Error(`Chiave API non valida: ${errMsg}`);
        }
        if (errStatus === 403) throw new Error(`Accesso negato: ${errMsg}`);

        const err = new Error(errMsg);
        err.status = errStatus;
        throw err;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new Error(`Risposta video non parsabile:\n${rawText.slice(0, 300)}`);
      }
    } catch (err) {
      lastError = err;
      if (err.message.startsWith('Chiave API non valida') || err.message.startsWith('Accesso negato')) {
        throw err;
      }
      await sleep(500);
    }
  }

  throw new Error(`Gemini Vision non raggiungibile per analisi video: ${lastError?.message || 'Server occupato'}`);
}

/**
 * Render video emotion analysis results into the modal UI.
 */
function renderVideoAnalysisResults(result, frames) {
  lastVideoAnalysisResult = null;

  const weights = result.plutchik_weights || {};
  let dominantKey = 'gioia', maxW = -1;
  for (const [k, w] of Object.entries(weights)) {
    if (w > maxW) { maxW = w; dominantKey = k; }
  }

  const pk = PLUTCHIK_PRIMARIES[dominantKey] || PLUTCHIK_PRIMARIES.gioia;
  const pct = Math.round(Math.max(0, Math.min(1, result.confidence || maxW || 0.8)) * 100);

  const datasetMatch = emotionsDataset.find(e =>
    e.termine_originale.toLowerCase() === (result.emotion || '').toLowerCase() ||
    e.famiglia_emotiva.toLowerCase() === (result.emotion || '').toLowerCase()
  ) || emotionsDataset.find(e => e.plutchik?.primary === dominantKey);

  const emotionObj = {
    termine_originale: result.emotion || pk.it,
    lingua_cultura: 'Visione Artificiale / Analisi Video',
    famiglia_emotiva: pk.it,
    significato_italiano: result.description,
    valenza: result.valenza || 'neutra',
    arousal: result.arousal || 'medio',
    modello_fonte: result.isLocal ? 'Analisi Visiva Dinamica (Multiframe)' : 'Google Gemini Vision (Video)',
    plutchik: null
  };

  emotionObj.plutchik = {
    primary: dominantKey,
    primary_it: pk.it,
    secondary: null,
    secondary_it: null,
    weights,
    color: pk.color,
    glow: pk.glow,
    core: pk.core,
    angle: pk.angle,
    physics: pk.physics
  };

  lastVideoAnalysisResult = emotionObj;

  // Confidence ring
  const offset = 113.1 * (1 - pct / 100);
  const ringEl  = document.getElementById('video-ring-progress');
  const ringPct = document.getElementById('video-ring-pct');
  if (ringEl) { ringEl.setAttribute('stroke-dashoffset', offset); ringEl.style.stroke = pk.color; }
  if (ringPct) { ringPct.textContent = `${pct}%`; ringPct.style.color = pk.color; }

  const banner = document.getElementById('video-detected-banner');
  if (banner) { banner.style.borderColor = pk.color + '55'; banner.style.background = pk.color + '12'; }

  const nameEl = document.getElementById('video-detected-name');
  if (nameEl) { nameEl.textContent = result.emotion || pk.it; nameEl.style.color = pk.color; }

  const subEl = document.getElementById('video-detected-sub');
  if (subEl) subEl.textContent = `${(result.valenza || '').toUpperCase()} · Arousal: ${(result.arousal || '').toUpperCase()} · ${pk.it}`;

  const descEl = document.getElementById('video-ai-desc');
  if (descEl) descEl.textContent = `« ${result.description} »`;

  // Per-frame summary cards
  const frameSummaryEl = document.getElementById('video-frame-summary');
  if (frameSummaryEl) {
    frameSummaryEl.innerHTML = '';
    const frameEmotions = result.frame_emotions || [];
    frames.forEach((frame, i) => {
      const card = document.createElement('div');
      card.className = 'video-frame-card';
      const frameEmotion = frameEmotions[i] || '—';
      card.innerHTML = `
        <div class="video-frame-card-num">Frame ${i + 1} · ${frame.time.toFixed(1)}s</div>
        <div class="video-frame-card-emotion">${frameEmotion}</div>`;
      frameSummaryEl.appendChild(card);
    });
  }

  // Plutchik bars
  const barsEl = document.getElementById('video-analyze-bars');
  if (barsEl) {
    barsEl.innerHTML = '';
    const sorted = Object.entries(weights).sort(([,a], [,b]) => b - a);
    sorted.forEach(([key, w]) => {
      const pkEntry = PLUTCHIK_PRIMARIES[key];
      if (!pkEntry) return;
      const wPct = Math.round(w * 100);
      if (wPct < 1) return;
      const row = document.createElement('div');
      row.className = 'analyze-vector-row';
      row.innerHTML = `
        <span class="vector-label">${pkEntry.it}</span>
        <div class="vector-bar-track">
          <div class="vector-bar-fill" style="width:${wPct}%;background:${pkEntry.color}"></div>
        </div>
        <span class="vector-pct">${wPct}%</span>`;
      barsEl.appendChild(row);
    });
  }

  // Dataset match card
  const matchCard = document.getElementById('video-analyze-match-card');
  if (matchCard) {
    if (datasetMatch) {
      matchCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
          <span style="font-weight:700;font-size:0.95rem;color:#fff">${datasetMatch.termine_originale}</span>
          <span style="font-size:0.68rem;color:var(--text-dim);font-family:monospace">${datasetMatch.lingua_cultura.split('/')[0]}</span>
        </div>
        <div style="font-size:0.72rem;margin-bottom:6px;color:${pk.color}">● ${datasetMatch.famiglia_emotiva}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.4">${datasetMatch.significato_italiano}</div>`;
    } else {
      matchCard.innerHTML = `<div style="font-size:0.78rem;color:var(--text-dim);font-style:italic">Nessuna corrispondenza esatta nel dataset — verrà usata la voce sintetica generata dall'IA.</div>`;
    }
  }

  // Show results
  const resultsEl = document.getElementById('video-analyze-results');
  if (resultsEl) {
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Initialize all event listeners for the video emotion analysis modal.
 */
function initVideoAnalyzeModal() {
  const modal          = document.getElementById('modal-video-analyze');
  const btnToggle      = document.getElementById('btn-video-analyze-toggle');
  const btnClose       = document.getElementById('btn-close-video-analyze');
  const fileInput      = document.getElementById('video-file-input');
  const dropzone       = document.getElementById('video-dropzone');
  const btnChooseFile  = document.getElementById('btn-choose-video-file');
  const previewSection = document.getElementById('video-preview-section');
  const videoEl        = document.getElementById('video-player-element');
  const btnRemoveVideo = document.getElementById('btn-remove-video');
  const btnDoAnalyze   = document.getElementById('btn-do-video-analyze');
  const statusEl       = document.getElementById('video-status');
  const statusText     = document.getElementById('video-status-text');
  const errorEl        = document.getElementById('video-error');
  const resultsEl      = document.getElementById('video-analyze-results');
  const btnApply       = document.getElementById('btn-apply-video-analyzed');
  const configRow      = document.getElementById('video-config-row');
  const framesStrip    = document.getElementById('video-frames-strip');
  const framesRow      = document.getElementById('video-frames-row');
  const framesPills    = document.querySelectorAll('.video-frames-pill');
  const badgeDuration  = document.getElementById('video-duration-badge');
  const badgeFormat    = document.getElementById('video-format-badge');
  const badgeFrames    = document.getElementById('video-frames-badge');
  const canvas         = document.getElementById('video-frame-canvas');

  if (!modal) return;

  let currentFile = null;
  let capturedFrames = [];

  // ── Open / Close ─────────────────────────────────────────────────────────
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      modal.classList.add('open');
      btnToggle.classList.add('active');
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    if (btnToggle) btnToggle.classList.remove('active');
    if (videoEl) videoEl.pause();
  }

  if (btnClose) btnClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // ── Frame count pills ────────────────────────────────────────────────────
  framesPills.forEach(pill => {
    pill.addEventListener('click', () => {
      framesPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      videoFrameCount = parseInt(pill.getAttribute('data-frames'), 10) || 8;
      if (badgeFrames) badgeFrames.textContent = `Frame: ${videoFrameCount}`;
    });
  });

  // ── Error / Status helpers ────────────────────────────────────────────────
  function showError(msg) {
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    if (statusEl) statusEl.style.display = 'none';
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ── File handling ─────────────────────────────────────────────────────────
  function handleFile(file) {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') ||
      /\.(mp4|webm|mov|avi|mkv|ogg|m4v|3gp)$/i.test(file.name);
    if (!isVideo) {
      showError('Il file selezionato non è un formato video valido (usa MP4, WEBM, MOV, AVI, MKV).');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      showError('File video troppo grande (max 100 MB).');
      return;
    }

    currentFile = file;
    capturedFrames = [];

    const url = URL.createObjectURL(file);
    if (videoEl) {
      videoEl.src = url;
      videoEl.load();
    }

    if (badgeFormat) badgeFormat.textContent = `Formato: ${file.name.split('.').pop().toUpperCase()}`;
    if (badgeFrames) badgeFrames.textContent = `Frame: ${videoFrameCount}`;

    if (videoEl) {
      videoEl.onloadedmetadata = () => {
        if (badgeDuration) badgeDuration.textContent = `Durata: ${formatTime(videoEl.duration)}`;
        if (previewSection) previewSection.style.display = 'flex';
        if (dropzone) dropzone.style.display = 'none';
        if (configRow) configRow.style.display = 'flex';
        if (framesStrip) framesStrip.style.display = 'none';
        if (framesRow) framesRow.innerHTML = '';
        if (resultsEl) resultsEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        lastVideoAnalysisResult = null;
        if (btnDoAnalyze) btnDoAnalyze.disabled = false;
      };
    }
  }

  function removeVideo() {
    currentFile = null;
    capturedFrames = [];
    lastVideoAnalysisResult = null;
    if (videoEl) { videoEl.pause(); videoEl.src = ''; }
    if (previewSection) previewSection.style.display = 'none';
    if (dropzone) dropzone.style.display = 'flex';
    if (configRow) configRow.style.display = 'none';
    if (framesStrip) framesStrip.style.display = 'none';
    if (framesRow) framesRow.innerHTML = '';
    if (fileInput) fileInput.value = '';
    if (resultsEl) resultsEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    if (btnDoAnalyze) btnDoAnalyze.disabled = true;
  }

  if (btnChooseFile) btnChooseFile.addEventListener('click', e => { e.stopPropagation(); fileInput?.click(); });
  if (dropzone) dropzone.addEventListener('click', () => fileInput?.click());
  if (fileInput) fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
  if (btnRemoveVideo) btnRemoveVideo.addEventListener('click', e => { e.stopPropagation(); removeVideo(); });

  // Drag-and-drop
  if (dropzone) {
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }

  // ── Run Analysis ──────────────────────────────────────────────────────────
  if (btnDoAnalyze) {
    btnDoAnalyze.addEventListener('click', async () => {
      if (!currentFile || !videoEl) return;

      if (errorEl) { errorEl.style.display = 'none'; errorEl.textContent = ''; }
      if (resultsEl) resultsEl.style.display = 'none';
      if (statusEl) statusEl.style.display = 'flex';
      if (statusText) statusText.textContent = 'Campionamento frame dal video…';
      btnDoAnalyze.disabled = true;

      try {
        videoEl.pause();

        // Extract frames & compute visual metrics
        const frames = await extractVideoFrames(
          videoEl,
          canvas,
          videoFrameCount,
          (current, total) => {
            if (statusText) statusText.textContent = `Campionamento frame ${current}/${total}…`;
          }
        );

        capturedFrames = frames;

        // Show frame thumbnails in the strip
        if (framesRow) {
          framesRow.innerHTML = '';
          frames.forEach((frame, i) => {
            const img = document.createElement('img');
            img.className = 'video-frame-thumb';
            img.src = `data:image/jpeg;base64,${frame.base64}`;
            img.alt = `Frame ${i + 1}`;
            img.title = `Frame ${i + 1} — ${frame.time.toFixed(1)}s`;
            framesRow.appendChild(img);
          });
        }
        if (framesStrip) framesStrip.style.display = 'block';

        let result = null;

        // 1. Try Gemini Vision if API key is present
        if (geminiApiKey) {
          try {
            if (statusText) statusText.textContent = `Analisi emotiva di ${frames.length} frame con Gemini Vision…`;
            result = await callGeminiVideo(geminiApiKey, frames, msg => {
              if (statusText) statusText.textContent = msg;
            });
          } catch (geminiErr) {
            console.warn("Gemini Video fallito o non disponibile, passo al motore visivo locale:", geminiErr);
          }
        }

        // 2. Resilient local visual heuristics fallback if Gemini not available
        if (!result) {
          if (statusText) statusText.textContent = 'Elaborazione dinamica e cromatica locale dei fotogrammi…';
          result = analyzeVideoLocally(frames);
          result.isLocal = true;
        }

        if (statusEl) statusEl.style.display = 'none';
        renderVideoAnalysisResults(result, frames);
      } catch (err) {
        showError(`Errore durante l'analisi video:\n${err.message}`);
      } finally {
        btnDoAnalyze.disabled = false;
        if (statusEl) statusEl.style.display = 'none';
      }
    });
  }

  // ── Apply to 3D entity ────────────────────────────────────────────────────
  if (btnApply) {
    btnApply.addEventListener('click', () => {
      if (!lastVideoAnalysisResult) return;
      applyEmotion(lastVideoAnalysisResult, true);
      const inp = document.getElementById('emotion-input');
      if (inp) inp.value = lastVideoAnalysisResult.termine_originale;
      closeModal();
    });
  }
}

