# Stato Emotivo IA • Ruota delle Emozioni di Plutchik

[![WebGL / Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-90%20Emozioni-purple)](emotions.jsonl)
[![Architecture](https://img.shields.io/badge/Architettura-Zero--Dependency%20%7C%20GLSL-emerald)](app.js)

Un'applicazione web immersiva e interattiva in cui la coscienza emotiva sintetica di un'intelligenza artificiale è incarnata da un'entità organica tridimensionale al centro di uno spazio cosmico profondo.

L'entità si modella, vibra, muta colore e si trasfigura in tempo reale in risposta agli stimoli emotivi forniti dall'utente, seguendo rigorosamente le geometrie, le polarità diametrali e i gradienti di intensità della **Ruota delle Emozioni dello psicologo Robert Plutchik**.

---

## 🧭 Il Modello Teorico di Robert Plutchik

Nel 1980 lo psicologo Robert Plutchik teorizzò una tassonomia psicoevolutiva delle emozioni umane strutturata attorno a una ruota a forma di cono o fiore. Il sistema poggia su tre cardini fondamentali:

1. **8 Emozioni Primarie a Coppie Polari**:
   - **Gioia** (*Joy*, `#FACC15`) $\leftrightarrow$ **Tristezza** (*Sadness*, `#2563EB`)
   - **Fiducia** (*Trust*, `#22C55E`) $\leftrightarrow$ **Disgusto** (*Disgust*, `#A855F7`)
   - **Paura** (*Fear*, `#8B5CF6`) $\leftrightarrow$ **Rabbia** (*Anger*, `#EF4444`)
   - **Sorpresa** (*Surprise*, `#06B6D4`) $\leftrightarrow$ **Anticipazione** (*Anticipation*, `#F97316`)

2. **Gradienti di Intensità Emotiva (Arousal & Concentricità)**:
   Ogni emozione primaria varia d'intensità lungo l'asse radiale:
   - *Gioia*: Serenità $\rightarrow$ Gioia $\rightarrow$ Estasi
   - *Fiducia*: Accettazione $\rightarrow$ Fiducia $\rightarrow$ Ammirazione
   - *Paura*: Apprensione $\rightarrow$ Paura $\rightarrow$ Terrore
   - *Sorpresa*: Distrazione $\rightarrow$ Sorpresa $\rightarrow$ Stupore
   - *Tristezza*: Pensosità $\rightarrow$ Tristezza $\rightarrow$ Angoscia
   - *Disgusto*: Noia $\rightarrow$ Disgusto $\rightarrow$ Ripugnanza
   - *Rabbia*: Fastidio $\rightarrow$ Rabbia $\rightarrow$ Furia
   - *Anticipazione*: Interesse $\rightarrow$ Anticipazione $\rightarrow$ Vigilanza

3. **Diadi e Miscele Complesse**:
   La combinazione vettoriale di due o più emozioni primarie genera stati secondari:
   - *Gioia* + *Fiducia* = **Amore** (*Love*)
   - *Fiducia* + *Paura* = **Sottomissione** (*Submission*)
   - *Paura* + *Sorpresa* = **Meraviglia / Riverenza** (*Awe*)
   - *Sorpresa* + *Tristezza* = **Delusione** (*Disappointment*)
   - *Tristezza* + *Disgusto* = **Rimorso** (*Remorse*)
   - *Disgusto* + *Rabbia* = **Disprezzo** (*Contempt*)
   - *Rabbia* + *Anticipazione* = **Aggressività** (*Aggressiveness*)
   - *Anticipazione* + *Gioia* = **Ottimismo** (*Optimism*)

---

## 🔬 Trasfigurazione Fisica e Rendering 3D (Three.js & GLSL)

La morfologia dell'entità organica traduce matematicamente il vettore emotivo in parametri geometrici e ottici calcolati via shader su GPU:

- **Domain Warped 3D Simplex Noise**:
  La superficie dell'icosaedro non subisce una semplice estrusione radiale, bensì una distorsione a campo continuo con deformazione del dominio (*domain warping*). Ciò produce pieghe fluide, vortici turbolenti e volute interne simili a plasma o fumo denso.
- **Parametri Fisici Adattivi**:
  - `u_spikiness` (Acutizzazione): le emozioni ad alto arousal negativo (Rabbia, Orrore) elevano l'esponente della deformazione generando creste aguzze e spine taglienti; le emozioni positive o contemplative (Gioia, Serenità, Upekkha) ammorbidiscono la superficie in onde armoniche.
  - `u_droop` (Caduta Gravitazionale): la tristezza e il dolore cosmico (*Weltschmerz*, *Saudade*, *Magone*) attivano una forza di gravità orientata verso il basso che fa colare l'emisfero inferiore dell'entità come un fluido viscoso.
  - `u_speed` & `u_density`: modulati direttamente dall'arousal dell'emozione immessa (da movimenti lenti e meditativi a tremolii frenetici).
  - `u_scale`: dilatazione repentina per sorpresa e gioia; contrazione compatta e difesa per paura e ansia.
- **Dispersione Cromatica Ottica (Prismatic Fresnel)**:
  L'effetto Fresnel sul bordo della silhouette viene separato spettralmente nei tre canali (rosso, verde e blu) con esponenti differenti, generando un bagliore iridescente e una riflessione speculare metallica sulle creste.
- **Bioluminescenza Sottosuperficiale**:
  Attraverso la crosta d'ossidiana profonda emergono vene di plasma energetico pulsanti al ritmo dell'arousal, illuminate dalla palette nativa di Plutchik.
- **Sciame Particellare Dinamico**:
  1.600 micro-particelle orbitali turbinano in un campo gravitazionale attorno al nucleo, accelerando, disperdendosi o addensandosi in base alla carica energetica dell'emozione attiva.

---

## 📚 Il Dataset Emotivo (90 Emozioni in `emotions.jsonl`)

L'applicazione consuma direttamente il file [`emotions.jsonl`](emotions.jsonl), che raccoglie 90 concetti affettivi catalogati per lingua d'origine, famiglia emotiva, valenza, arousal e modello teorico:

1. **Modello Primario di Paul Ekman**: Gioia, Tristezza, Paura, Rabbia, Disgusto, Sorpresa e Disprezzo.
2. **Modello di Robert Plutchik**: Emozioni primarie, polari e diadi fondamentali (Amore, Sottomissione, Meraviglia, Delusione, Rimorso, Aggressività, Ottimismo).
3. **Le 27 Dimensioni Affettive di Cowen & Keltner (2017)**: Ammirazione, Adorazione, Apprezzamento Estetico, Divertimento, Ansia, Imbarazzo, Noia, Calma, Confusione, Bramosia, Dolore Empatico, Incanto, Eccitazione, Orrore, Interesse, Nostalgia, Sollievo, Romanticismo, Soddisfazione, Desiderio Sessuale.
4. **Emozioni Culturali e Intraducibili dal Mondo**:
   - 🇵🇹 *Saudade*: profonda malinconia mista ad affetto per ciò che è lontano.
   - 🇯🇵 *Ikigai*: la ragion d'essere che infonde motivazione al mattino.
   - 🇯🇵 *Mono no aware*: consapevolezza poetica e dolceamara dell'impermanenza.
   - 🇯🇵 *Yūgen*: mistero suggestivo e grazia sottile dell'invisibile.
   - 🇩🇪 *Weltschmerz*: dolore cosmico nato dal divario tra mondo ideale e reale.
   - 🇩🇪 *Waldeinsamkeit*: solitudine pacificatrice nei boschi.
   - 🇩🇪 *Schadenfreude*: compiacimento per le sfortune altrui.
   - 🇫🇮 *Sisu*: tenacia stoica e incrollabile dinanzi alle avversità.
   - 🇪🇸 *Duende*: forza espressiva viscerale e magnetica nell'arte.
   - 🇸🇪 *Lagom*: perfetto equilibrio moderato, la giusta misura.
   - 🇿🇦 *Ubuntu*: consapevolezza dell'interconnessione umana («Io sono perché noi siamo»).
   - 🇬🇷 *Meraki*: fare qualcosa mettendoci l'anima e lasciandovi parte di sé.
   - 🇬🇷 *Philotimo*: senso del dovere morale e rispetto per la comunità.
   - 🇦🇪 *Tarab*: estasi ed ebbrezza emotiva suscitata dall'ascolto musicale.
   - 🇵🇭 *Gigil*: impulso di stringere qualcosa di irresistibilmente adorabile.
   - 🇵🇭 *Kilig*: batticuore ed euforia romantica.
   - 🇷🇺 *Toska*: lacerante angoscia dell'anima priva di causa definita.
   - 🇮🇹 *Magone*: groppo alla gola che precede il pianto trattenuto.
   - E molte altre tradizioni linguistiche (Inuit, Ifaluk, Coreano, Cinese, Sanscrito, Yaghan).

---

## 🔍 Motore di Ricerca & Corrispondenza Intelligente

Il campo di testo dell'interfaccia permette all'utente di esprimere liberamente uno stato emotivo:
- **Ricerca Bilingue**: riconosce indifferentemente i lemmi in lingua originale (*Saudade*, *Joy*, *Sehnsucht*, *Fear*) o in traduzione italiana (*Gioia*, *Paura*, *Tristezza*, *Dolore cosmico*).
- **Mappatura Semantica e Sinonimi**: termini colloquiali o derivati (*felice*, *arrabbiato*, *depresso*, *ansioso*, *spaventato*) vengono istantaneamente ricondotti all'emozione archetipica corrispondente.
- **Tolleranza ai Refusi (Distanza di Levenshtein)**: anche digitando errori di battitura (es. *gioa*, *rabia*, *weltsmerz*), l'algoritmo identifica l'emozione intesa con una soglia di tolleranza metrica.
- **Autocompletamento Istantaneo**: tendina contestuale dinamica con anteprima cromatica della famiglia di Plutchik e paese d'origine.

---

## 🎛️ Funzionalità dell'Interfaccia

- **Pannello Cognitivo dell'IA** (a sinistra): riporta il nome, la cultura d'origine, i badge di valenza/arousal, il significato filosofico-psicologico e le percentuali delle componenti vettoriali di Plutchik attivate.
- **Mini-Radar delle Polarità**: bussola a 8 assi che indica visivamente l'inclinazione del vettore e la sua emozione diametralmente opposta.
- **Ruota di Plutchik Interattiva** (pulsante in alto): diagramma vettoriale SVG dei petali primari con codifica colori originale; facendo clic su ciascun petalo si plasma direttamente l'entità.
- **Catalogo Esplorabile**: archivio completo delle 90 emozioni filtrabili per categoria teorica, area geografica o valenza.
- **Analisi Emotiva del Testo (NLP Locale)**: analizza frasi e poesie estraendo le componenti della ruota di Plutchik senza dipendenze esterne.
- **Analisi Emotiva dell'Immagine (Visione AI)**: carica una foto, disegno o ritratto per dedurre l'emozione visiva predominante tramite intelligenza artificiale multimodale (Google Gemini Vision).
- **Sintetizzatore Sonoro Generativo (Web Audio API)**: drone binaurale con oscillatore doppio e filtro passa-basso risonante, che adatta frequenza e modulazione all'arousal dell'emozione corrente.

---

## 💻 Come Avviare l'Applicazione in Locale

Il progetto è completamente autosufficiente e non richiede installazioni di pacchetti o dipendenze esterne.

### Metodo 1: Launcher Windows (Consigliato)
Fai doppio clic sul file [`start.bat`](start.bat). Avvierà automaticamente il server locale su `http://localhost:8000/index.html` e aprirà la pagina nel browser predefinito.

### Metodo 2: Terminale con Python
Avvia un server statico dalla cartella di progetto:
```bash
python -m http.server 8000
```
Quindi apri nel browser: [http://localhost:8000/index.html](http://localhost:8000/index.html).

### Metodo 3: Apertura Diretta del File HTML
Puoi anche fare doppio clic direttamente su [`index.html`](index.html). Grazie alla copia locale di Three.js inclusa in [`libs/three.min.js`](libs/three.min.js) e al fallback offline [`emotions-data.js`](emotions-data.js), l'applicazione funziona perfettamente anche senza connessione internet e senza server locale attivo.

---

## 📁 Architettura dei File

```
├── libs/
│   └── three.min.js      # Libreria Three.js r128 per rendering WebGL offline
├── app.js                # Motore 3D Three.js, shader GLSL, sintesi sonora, logica Plutchik e UI
├── emotions-data.js      # Dataset arricchito con vettori, coordinate e fisica di Plutchik precalcolati
├── emotions.jsonl        # Dataset sorgente con le 90 emozioni universali e interculturali
├── index.html            # Struttura della pagina web, HUD, canvas 3D e modali interattive
├── process_dataset.py    # Script Python per il calcolo vettoriale e la rigenerazione dei dati
├── start.bat             # Launcher rapido per ambiente Windows
├── style.css             # Foglio di stile futuristico e design system
├── LICENSE               # Licenza d'uso MIT
└── README.md             # Documentazione e guida tecnica del progetto
```

---

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT**. Consulta il file [`LICENSE`](LICENSE) per i termini completi.
