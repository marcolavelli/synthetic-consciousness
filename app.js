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
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
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

function updateCameraFraming() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= 768;
  const aspect = width / height;
  camera.aspect = aspect;

  if (isMobile) {
    camera.fov = aspect < 0.6 ? 50 : 45;
    camera.position.z = aspect < 0.6 ? 6.8 : 6.4;
    camera.position.y = 0.25;
  } else {
    camera.fov = 42;
    camera.position.z = 6.4;
    camera.position.y = 0.0;
  }
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

/** Gemini API key preconfigurata */
let geminiApiKey = 'AQ.Ab8RN6JlUM9X5yP8kZsfY2WH7kG4-PO2Jhpx3oRkU05fmLV60g';

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
 * Call Gemini 2.0 Flash (multimodal) to analyse an image for emotional content.
 * @param {string} apiKey  Gemini API key
 * @param {string} base64Image  Base64-encoded image data (no data-URI prefix)
 * @param {string} mimeType  MIME type of the image (e.g. "image/jpeg")
 * @returns {Promise<Object>} Parsed JSON result from the model
 */
async function callGeminiVision(apiKey, base64Image, mimeType) {
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [
        { text: PROMPT },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${errBody?.error?.message || 'HTTP ' + response.status}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Strip optional markdown code fences
  const cleaned = rawText.replace(/```(?:json)?\n?/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Risposta non parsabile:\n${rawText.slice(0, 300)}`);
  }
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
      if (!key) return;
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
        const result = await callGeminiVision(geminiApiKey, b64, currentFile.type || 'image/jpeg');
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
