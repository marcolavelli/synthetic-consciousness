# Stato Emotivo IA • Ruota delle Emozioni di Plutchik

[![GitHub Pages Deployment](https://img.shields.io/badge/GitHub%20Pages-Active-success?style=flat&logo=github)](https://github.com/)
[![WebGL / Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-90%20Emozioni-purple)](emotions.jsonl)

Una web application interattiva e immersiva in cui la coscienza emotiva sintetica di un'intelligenza artificiale è incarnata da un'entità organica tridimensionale al centro di uno spazio cosmico profondo.

L'entità si modella, vibra e si trasfigura in tempo reale in risposta agli stimoli emotivi immessi dall'utente, seguendo le geometrie, le polarità e le intensità della **Ruota delle Emozioni di Robert Plutchik**.

---

## 🌐 Live Demo su GitHub Pages

Una volta caricato il repository su GitHub, l'applicazione sarà accessibile all'indirizzo:
```
https://<tuo-username>.github.io/<nome-repository>/
```

---

## 🌟 Caratteristiche

1. **Entità 3D Reattiva (Three.js & GLSL Shaders)**:
   - **Simplex Noise 3D multi-ottava con Domain Warping**: calcolato direttamente sulla GPU per produrre volute fluide e correnti organiche continue.
   - **Dispersione Cromatica Ottica (Prismatic Fresnel)**: separazione spettrale dei canali cromatici (RGB) sui bordi della silhouette dell'entità.
   - **Vene Bioluminescenti & Riflessi Speculari**: plasma energetico interno che pulsa al ritmo dell'arousal emotivo attraverso la crosta d'ossidiana profonda.
   - **Sciame Orbitale**: oltre 1.600 micro-particelle che danzano in orbite calcolate in funzione dell'energia e della valenza dell'emozione attiva.
   - **Interazione Diretta**: inclinazione cinetica con il cursore del mouse / touch e generazione di onde d'urto radiali al clic.

2. **Dataset Integrato di 90 Emozioni ([`emotions.jsonl`](emotions.jsonl))**:
   - Emozioni primarie di **Paul Ekman** (*Joy*, *Sadness*, *Fear*, *Anger*, *Disgust*, *Surprise*) e disprezzo (*Contempt*).
   - Emozioni primarie e diadi di **Robert Plutchik** (*Love*, *Submission*, *Awe*, *Disappointment*, *Remorse*, *Aggressiveness*, *Optimism*).
   - Le 20 dimensioni affettive di **Cowen & Keltner** (*Amusement*, *Anxiety*, *Craving*, *Nostalgia*, *Calmness*, *Entrancement*, *Horror*, ecc.).
   - 55 concetti emotivi interculturali (*Saudade*, *Ikigai*, *Weltschmerz*, *Mono no aware*, *Duende*, *Sisu*, *Tarab*, *Kummerspeck*, *Meraki*, *Ubuntu*, *Toska*, ecc.).

3. **Interfaccia Intelligente & Ruota di Plutchik**:
   - **Ricerca Predittiva & Autocompletamento**: supporta sia i termini originali che in lingua italiana, con correzione automatica dei refusi tramite distanza di Levenshtein e mappatura dei sinonimi.
   - **Pannello Cognitivo**: dettagli su lingua d'origine, modello teorico, valenza, arousal e citazione poetico-psicologica.
   - **Mini-Radar delle Polarità**: bussola a 8 assi che indica la componente primaria attiva e l'opposto diametrale secondo Plutchik.
   - **Ruota di Plutchik Vettoriale (SVG)**: diagramma completo a 8 petali interattivi con selezione rapida al clic.
   - **Catalogo Esplorabile**: archivio filtrabile per famiglia, modello teorico e valenza.

4. **Sintetizzatore Audio Generativo (Web Audio API)**:
   - Drone binaurale che intona frequenze e filtri risonanti associati alla frequenza emozionale (attivabile tramite il pulsante *Audio*).

---

## 🚀 Pubblicazione su GitHub & GitHub Pages

### 1. Inizializza il repository Git locale (se non già fatto)
Nel terminale della cartella del progetto:
```bash
git init
git add .
git commit -m "feat: Stato Emotivo IA basato su Ruota di Plutchik"
```

### 2. Collega il repository remoto su GitHub
Crea un nuovo repository pubblico o privato su GitHub (es. `stato-emotivo-ia`), quindi esegui:
```bash
git branch -M main
git remote add origin https://github.com/<tuo-username>/<nome-repository>.git
git push -u origin main
```

### 3. Attiva GitHub Pages
Nel repository su GitHub:
1. Vai su **Settings** > **Pages** (nel menu laterale sinistro).
2. Nella sezione **Build and deployment**:
   - **Opzione A (GitHub Actions - Consigliata)**: seleziona **GitHub Actions** nel menu a tendina *Source*. Il workflow incluso [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compilerà e pubblicherà automaticamente il sito ad ogni push.
   - **Opzione B (Deploy from branch)**: seleziona *Deploy from a branch*, scegli il branch `main` (cartella `/ (root)`) e fai clic su **Save**.
3. In meno di un minuto l'applicazione sarà live all'indirizzo indicato in cima alla pagina delle impostazioni.

---

## 💻 Esecuzione Locale

### Con il launcher Windows:
Fai doppio clic sul file [`start.bat`](start.bat).

### Da terminale con Python:
```bash
python -m http.server 8000
```
Quindi apri nel browser: [http://localhost:8000/index.html](http://localhost:8000/index.html).

---

## 📁 Struttura del Progetto

```
├── .github/workflows/
│   └── deploy.yml        # Automazione di deploy su GitHub Pages
├── libs/
│   └── three.min.js      # Three.js r128 offline
├── .gitignore            # File e cartelle ignorate da Git
├── .nojekyll             # Bypassa Jekyll su GitHub Pages per servire file statici puri
├── LICENSE               # Licenza MIT open source
├── README.md             # Documentazione del progetto
├── app.js                # Three.js 3D shaders, audio synth, Plutchik wheel & UI logic
├── emotions-data.js      # Dataset arricchito con coordinate e fisica di Plutchik
├── emotions.jsonl        # Dataset originale di 90 emozioni universali e interculturali
├── index.html            # Entry point dell'applicazione web
├── process_dataset.py    # Script Python per generare e arricchire emotions-data.js
├── start.bat             # Launcher rapido per Windows
└── style.css             # Foglio di stile futuristico e design system
```

---

## 📄 Licenza

Distribuito sotto licenza **MIT**. Consulta il file [`LICENSE`](LICENSE) per ulteriori dettagli.
