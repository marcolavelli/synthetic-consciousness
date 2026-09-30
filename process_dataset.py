"""
Processor script to parse emotions.jsonl and generate enriched emotions-data.js
with full Plutchik wheel vectors, colorimetry, and 3D dark matter physics.
"""
import json
import math

# Canonical Plutchik 8 Primary Emotions definitions
PLUTCHIK_PRIMARIES = {
    "gioia": {
        "it": "Gioia",
        "en": "Joy",
        "angle": 90, # North
        "color": "#FACC15", # Bright Yellow
        "glow": "#FEF08A",
        "core": "#713F12",
        "opposite": "tristezza",
        "physics": {"speed": 1.5, "density": 1.2, "displacement": 0.42, "spikiness": 1.0, "droop": -0.15, "scale": 1.15, "particleSpeed": 1.4, "particleSpread": 1.3, "audioFreq": 396, "audioMod": 4.0}
    },
    "fiducia": {
        "it": "Fiducia",
        "en": "Trust",
        "angle": 45, # North-East
        "color": "#22C55E", # Emerald / Jade Green
        "glow": "#86EFAC",
        "core": "#14532D",
        "opposite": "disgusto",
        "physics": {"speed": 0.85, "density": 1.0, "displacement": 0.28, "spikiness": 1.0, "droop": 0.0, "scale": 1.05, "particleSpeed": 0.8, "particleSpread": 1.0, "audioFreq": 528, "audioMod": 2.0}
    },
    "paura": {
        "it": "Paura",
        "en": "Fear",
        "angle": 0, # East
        "color": "#8B5CF6", # Cold Violet / Ethereal Purple
        "glow": "#C4B5FD",
        "core": "#2E1065",
        "opposite": "rabbia",
        "physics": {"speed": 2.5, "density": 3.2, "displacement": 0.38, "spikiness": 1.8, "droop": 0.0, "scale": 0.85, "particleSpeed": 2.2, "particleSpread": 0.8, "audioFreq": 174, "audioMod": 8.5}
    },
    "sorpresa": {
        "it": "Sorpresa",
        "en": "Surprise",
        "angle": 315, # South-East
        "color": "#06B6D4", # Electric Cyan / Sky
        "glow": "#67E8F9",
        "core": "#164E63",
        "opposite": "anticipazione",
        "physics": {"speed": 2.0, "density": 1.6, "displacement": 0.58, "spikiness": 1.2, "droop": 0.0, "scale": 1.28, "particleSpeed": 1.8, "particleSpread": 1.6, "audioFreq": 639, "audioMod": 6.0}
    },
    "tristezza": {
        "it": "Tristezza",
        "en": "Sadness",
        "angle": 270, # South
        "color": "#2563EB", # Deep Midnight Indigo
        "glow": "#60A5FA",
        "core": "#0F172A",
        "opposite": "gioia",
        "physics": {"speed": 0.45, "density": 0.85, "displacement": 0.25, "spikiness": 1.0, "droop": 0.65, "scale": 0.90, "particleSpeed": 0.4, "particleSpread": 0.7, "audioFreq": 147, "audioMod": 1.0}
    },
    "disgusto": {
        "it": "Disgusto",
        "en": "Disgust",
        "angle": 225, # South-West
        "color": "#A855F7", # Acid Violet / Toxic Olive Purple
        "glow": "#D8B4FE",
        "core": "#3B0764",
        "opposite": "fiducia",
        "physics": {"speed": 1.2, "density": 2.5, "displacement": 0.50, "spikiness": 2.4, "droop": 0.15, "scale": 0.96, "particleSpeed": 1.1, "particleSpread": 0.9, "audioFreq": 210, "audioMod": 3.2}
    },
    "rabbia": {
        "it": "Rabbia",
        "en": "Anger",
        "angle": 180, # West
        "color": "#EF4444", # Magma Crimson
        "glow": "#FCA5A5",
        "core": "#450A0A",
        "opposite": "paura",
        "physics": {"speed": 2.8, "density": 2.2, "displacement": 0.68, "spikiness": 3.2, "droop": 0.0, "scale": 1.20, "particleSpeed": 2.6, "particleSpread": 1.8, "audioFreq": 110, "audioMod": 9.0}
    },
    "anticipazione": {
        "it": "Anticipazione",
        "en": "Anticipation",
        "angle": 135, # North-West
        "color": "#F97316", # Solar Amber Orange
        "glow": "#FDBA74",
        "core": "#7C2D12",
        "opposite": "sorpresa",
        "physics": {"speed": 1.6, "density": 1.9, "displacement": 0.40, "spikiness": 1.1, "droop": -0.05, "scale": 1.08, "particleSpeed": 1.5, "particleSpread": 1.2, "audioFreq": 432, "audioMod": 5.0}
    }
}

# Explicit mapping dictionary for the 90 items in dataset
# Mapping each emotion to weights across the 8 Plutchik primaries
CUSTOM_MAPPINGS = {
    # Ekman primary
    "Joy": {"gioia": 1.0},
    "Sadness": {"tristezza": 1.0},
    "Fear": {"paura": 1.0},
    "Anger": {"rabbia": 1.0},
    "Disgust": {"disgusto": 1.0},
    "Surprise": {"sorpresa": 1.0},
    "Contempt": {"disgusto": 0.6, "rabbia": 0.4},
    # Plutchik primary & dyads
    "Trust / Acceptance": {"fiducia": 1.0},
    "Anticipation": {"anticipazione": 1.0},
    "Love": {"gioia": 0.5, "fiducia": 0.5},
    "Submission": {"fiducia": 0.5, "paura": 0.5},
    "Awe": {"paura": 0.5, "sorpresa": 0.5},
    "Disappointment": {"sorpresa": 0.4, "tristezza": 0.6},
    "Remorse": {"tristezza": 0.5, "disgusto": 0.5},
    "Aggressiveness": {"rabbia": 0.6, "anticipazione": 0.4},
    "Optimism": {"anticipazione": 0.5, "gioia": 0.5},
    # Cowen & Keltner 27 emotions
    "Admiration": {"fiducia": 0.7, "gioia": 0.3},
    "Adoration": {"fiducia": 0.5, "gioia": 0.5},
    "Aesthetic Appreciation": {"gioia": 0.4, "sorpresa": 0.3, "fiducia": 0.3},
    "Amusement": {"gioia": 0.8, "sorpresa": 0.2},
    "Anxiety": {"paura": 0.7, "anticipazione": 0.3},
    "Awkwardness": {"paura": 0.4, "disgusto": 0.3, "tristezza": 0.3},
    "Boredom": {"tristezza": 0.5, "disgusto": 0.5},
    "Calmness": {"fiducia": 0.6, "gioia": 0.4},
    "Confusion": {"sorpresa": 0.6, "paura": 0.4},
    "Craving": {"anticipazione": 0.7, "gioia": 0.3},
    "Empathetic Pain": {"tristezza": 0.6, "fiducia": 0.4},
    "Entrancement": {"sorpresa": 0.5, "gioia": 0.5},
    "Excitement": {"gioia": 0.6, "anticipazione": 0.4},
    "Horror": {"paura": 0.7, "disgusto": 0.3},
    "Interest": {"anticipazione": 0.7, "fiducia": 0.3},
    "Nostalgia": {"tristezza": 0.5, "gioia": 0.5},
    "Relief": {"gioia": 0.6, "fiducia": 0.4},
    "Romance": {"gioia": 0.5, "fiducia": 0.3, "anticipazione": 0.2},
    "Satisfaction": {"gioia": 0.6, "fiducia": 0.4},
    "Sexual Desire": {"gioia": 0.5, "anticipazione": 0.5},
    # Cultural & untranslatable
    "Saudade": {"tristezza": 0.6, "gioia": 0.4},
    "Cafuné": {"fiducia": 0.6, "gioia": 0.4},
    "Schadenfreude": {"gioia": 0.6, "rabbia": 0.2, "disgusto": 0.2},
    "Waldeinsamkeit": {"fiducia": 0.7, "tristezza": 0.3},
    "Fernweh": {"anticipazione": 0.6, "tristezza": 0.4},
    "Sehnsucht": {"tristezza": 0.5, "anticipazione": 0.5},
    "Weltschmerz": {"tristezza": 0.7, "disgusto": 0.3},
    "Kummerspeck": {"tristezza": 0.6, "disgusto": 0.4},
    "Fremdschämen": {"paura": 0.4, "disgusto": 0.4, "tristezza": 0.2},
    "Ikigai (生きがい)": {"gioia": 0.5, "anticipazione": 0.3, "fiducia": 0.2},
    "Mono no aware (物の哀れ)": {"tristezza": 0.5, "fiducia": 0.3, "gioia": 0.2},
    "Natsukashii (懐かしい)": {"gioia": 0.6, "tristezza": 0.4},
    "Yūgen (幽玄)": {"sorpresa": 0.5, "fiducia": 0.3, "paura": 0.2},
    "Wabi-sabi (侘寂)": {"fiducia": 0.6, "tristezza": 0.2, "gioia": 0.2},
    "Amae (甘え)": {"fiducia": 0.8, "gioia": 0.2},
    "Hygge": {"fiducia": 0.6, "gioia": 0.4},
    "Forelsket": {"gioia": 0.7, "anticipazione": 0.3},
    "Gezelligheid": {"gioia": 0.6, "fiducia": 0.4},
    "Uitwaaien": {"fiducia": 0.5, "gioia": 0.5},
    "Lagom": {"fiducia": 0.8, "gioia": 0.2},
    "Sisu": {"rabbia": 0.4, "anticipazione": 0.3, "fiducia": 0.3},
    "Gigil": {"gioia": 0.6, "rabbia": 0.4},
    "Kilig": {"gioia": 0.6, "anticipazione": 0.4},
    "Lítost": {"tristezza": 0.5, "rabbia": 0.3, "disgusto": 0.2},
    "Fago": {"fiducia": 0.5, "tristezza": 0.3, "gioia": 0.2},
    "Song": {"rabbia": 0.7, "disgusto": 0.3},
    "Iktsuarpok": {"anticipazione": 0.7, "paura": 0.3},
    "Toska (Тоска)": {"tristezza": 0.7, "disgusto": 0.3},
    "Razliubit (Разлюбить)": {"tristezza": 0.5, "fiducia": 0.3, "gioia": 0.2},
    "Tarab (طرب)": {"gioia": 0.7, "sorpresa": 0.3},
    "Duende": {"sorpresa": 0.4, "rabbia": 0.3, "gioia": 0.3},
    "Sobremesa": {"fiducia": 0.6, "gioia": 0.4},
    "Vergüenza ajena": {"paura": 0.4, "disgusto": 0.4, "tristezza": 0.2},
    "Tiam (تیام)": {"gioia": 0.5, "anticipazione": 0.3, "sorpresa": 0.2},
    "Mbuki-mvuki": {"gioia": 0.8, "sorpresa": 0.2},
    "Ubuntu": {"fiducia": 0.7, "gioia": 0.3},
    "Dor": {"tristezza": 0.6, "gioia": 0.4},
    "Hiraeth": {"tristezza": 0.6, "fiducia": 0.4},
    "Meraki (Μεράκι)": {"gioia": 0.6, "anticipazione": 0.4},
    "Philotimo (Φιλότιμο)": {"fiducia": 0.7, "rabbia": 0.3},
    "Kefi (Κέφι)": {"gioia": 0.8, "anticipazione": 0.2},
    "Mamihlapinatapai": {"anticipazione": 0.5, "paura": 0.5},
    "Goya (گویا)": {"sorpresa": 0.5, "gioia": 0.5},
    "Sukha (सुख)": {"gioia": 0.6, "fiducia": 0.4},
    "Mudita (मुदिता)": {"gioia": 0.7, "fiducia": 0.3},
    "Upekkha (उपेक्खा)": {"fiducia": 0.8, "gioia": 0.2},
    "Awumbuk": {"tristezza": 0.7, "disgusto": 0.3},
    "Han (한 / 恨)": {"tristezza": 0.5, "rabbia": 0.5},
    "Jeong (정 / 情)": {"fiducia": 0.7, "tristezza": 0.3},
    "Nunchi (눈치)": {"anticipazione": 0.6, "fiducia": 0.4},
    "Yuanfen (缘分)": {"fiducia": 0.6, "gioia": 0.4},
    "Magone": {"tristezza": 0.7, "paura": 0.3},
    "Dépaysement": {"sorpresa": 0.6, "paura": 0.2, "gioia": 0.2},
    "Joie de vivre": {"gioia": 0.9, "anticipazione": 0.1}
}

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(int(max(0, min(255, rgb[0]))),
                                        int(max(0, min(255, rgb[1]))),
                                        int(max(0, min(255, rgb[2]))))

def blend_colors(color_weight_pairs):
    r, g, b = 0.0, 0.0, 0.0
    total_w = sum(w for _, w in color_weight_pairs)
    if total_w == 0:
        return "#7F7F7F"
    for hex_col, w in color_weight_pairs:
        rgb = hex_to_rgb(hex_col)
        norm_w = w / total_w
        r += (rgb[0] ** 2) * norm_w
        g += (rgb[1] ** 2) * norm_w
        b += (rgb[2] ** 2) * norm_w
    return rgb_to_hex((math.sqrt(r), math.sqrt(g), math.sqrt(b)))

def main():
    with open('emotions.jsonl', 'r', encoding='utf-8-sig') as f:
        raw_items = [json.loads(line) for line in f if line.strip()]

    enriched_items = []
    
    for item in raw_items:
        t_orig = item.get("termine_originale", "").strip()
        fam = item.get("famiglia_emotiva", "").strip()
        valenza = item.get("valenza", "neutra").strip()
        arousal = item.get("arousal", "medio").strip()
        
        # Get Plutchik weights
        weights = CUSTOM_MAPPINGS.get(t_orig)
        if not weights:
            # Fallback deduction based on famiglia
            f_lower = fam.lower()
            if "gioia" in f_lower or "felicit" in f_lower:
                weights = {"gioia": 0.8, "anticipazione": 0.2}
            elif "tristezza" in f_lower or "dolore" in f_lower:
                weights = {"tristezza": 0.8, "disgusto": 0.2}
            elif "rabbia" in f_lower:
                weights = {"rabbia": 0.8, "disgusto": 0.2}
            elif "paura" in f_lower:
                weights = {"paura": 0.8, "sorpresa": 0.2}
            elif "fiducia" in f_lower:
                weights = {"fiducia": 0.8, "gioia": 0.2}
            elif "disgusto" in f_lower:
                weights = {"disgusto": 0.8, "rabbia": 0.2}
            elif "sorpresa" in f_lower:
                weights = {"sorpresa": 0.8, "gioia": 0.2}
            elif "nostalgia" in f_lower:
                weights = {"tristezza": 0.5, "gioia": 0.5}
            else:
                weights = {"fiducia": 0.5, "anticipazione": 0.5}

        # Normalize weights
        sum_w = sum(weights.values())
        norm_weights = {k: v / sum_w for k, v in weights.items()}
        
        # Determine primary & secondary
        sorted_primaries = sorted(norm_weights.items(), key=lambda x: -x[1])
        primary_key = sorted_primaries[0][0]
        secondary_key = sorted_primaries[1][0] if len(sorted_primaries) > 1 and sorted_primaries[1][1] >= 0.2 else None
        
        # Colors blending
        color_pairs = [(PLUTCHIK_PRIMARIES[k]["color"], w) for k, w in norm_weights.items()]
        glow_pairs = [(PLUTCHIK_PRIMARIES[k]["glow"], w) for k, w in norm_weights.items()]
        core_pairs = [(PLUTCHIK_PRIMARIES[k]["core"], w) for k, w in norm_weights.items()]
        
        blended_color = blend_colors(color_pairs)
        blended_glow = blend_colors(glow_pairs)
        blended_core = blend_colors(core_pairs)
        
        # Base physics blend
        base_phys = {
            "speed": 0.0, "density": 0.0, "displacement": 0.0, "spikiness": 0.0,
            "droop": 0.0, "scale": 0.0, "particleSpeed": 0.0, "particleSpread": 0.0,
            "audioFreq": 0.0, "audioMod": 0.0
        }
        for k, w in norm_weights.items():
            pk = PLUTCHIK_PRIMARIES[k]["physics"]
            for field in base_phys:
                base_phys[field] += pk[field] * w
                
        # Arousal modifiers
        if arousal == "alto":
            base_phys["speed"] = base_phys["speed"] * 1.35 + 0.3
            base_phys["displacement"] = min(0.85, base_phys["displacement"] * 1.25)
            base_phys["particleSpeed"] *= 1.45
            base_phys["audioMod"] *= 1.5
        elif arousal == "basso":
            base_phys["speed"] = max(0.3, base_phys["speed"] * 0.7)
            base_phys["displacement"] = max(0.18, base_phys["displacement"] * 0.8)
            base_phys["particleSpeed"] *= 0.65
            base_phys["audioMod"] *= 0.6
            
        # Valence modifiers
        if valenza == "negativa":
            base_phys["spikiness"] = max(1.6, base_phys["spikiness"] * 1.3)
        elif valenza == "positiva":
            base_phys["spikiness"] = min(1.1, base_phys["spikiness"] * 0.85)
            
        # Round physics floats
        physics = {k: round(v, 3) for k, v in base_phys.items()}
        
        # Build enriched object
        enriched = {
            **item,
            "plutchik": {
                "primary": primary_key,
                "primary_it": PLUTCHIK_PRIMARIES[primary_key]["it"],
                "secondary": secondary_key,
                "secondary_it": PLUTCHIK_PRIMARIES[secondary_key]["it"] if secondary_key else None,
                "weights": {k: round(v, 2) for k, v in norm_weights.items()},
                "color": blended_color,
                "glow": blended_glow,
                "core": blended_core,
                "angle": PLUTCHIK_PRIMARIES[primary_key]["angle"],
                "physics": physics
            }
        }
        enriched_items.append(enriched)

    # Output to emotions-data.js
    js_content = "window.EMOTIONS_DATA = " + json.dumps(enriched_items, ensure_ascii=False, indent=2) + ";\n"
    js_content += "window.PLUTCHIK_PRIMARIES = " + json.dumps(PLUTCHIK_PRIMARIES, ensure_ascii=False, indent=2) + ";\n"
    
    with open("emotions-data.js", "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Successfully generated emotions-data.js with {len(enriched_items)} enriched items.")

if __name__ == "__main__":
    main()
