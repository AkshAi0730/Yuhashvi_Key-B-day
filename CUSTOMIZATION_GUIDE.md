# 🎨 Complete Customization & Replacement Guide

This guide explains how to easily replace and customize **every single text, audio track, photo, character sprite, and visual asset** in this project without breaking animations or gameplay physics.

---

## 📑 Table of Contents
1. [The Golden Rule](#1-the-golden-rule)
2. [Rearranged Scene Flow Overview](#2-rearranged-scene-flow-overview)
3. [Text & Message Customization (`config.js`)](#3-text--message-customization-configjs)
4. [Audio Track Replacement (`assets/audio/`)](#4-audio-track-replacement-assetsaudio)
5. [Memory Quick-Jump Dropdown & Revisit HUD](#5-memory-quick-jump-dropdown--revisit-hud)
6. [Polaroid Photo Replacement (`assets/images/photo_*.jpg`)](#6-polaroid-photo-replacement-assetsimagesphoto_jpg)
7. [Character Sprites (`assets/characters/`)](#7-character-sprites-assetscharacters)
8. [Baroque Golden Gate & Padlock Graphics](#8-baroque-golden-gate--padlock-graphics)
9. [Final Night Scene Images](#9-final-night-scene-images)
10. [Typography & Fonts (`style.css`)](#10-typography--fonts-stylecss)
11. [Keeping the Preloader Accurate (`js/preloader.js`)](#11-keeping-the-preloader-accurate-jspreloaderjs)
12. [Local Testing Checklist](#12-local-testing-checklist)

---

## 1. The Golden Rule

> [!TIP]
> **You do NOT need to edit scene animation mathematics or physics to change words, photos, music, or names.**
> All content is centralized in **`config.js`** and the **`assets/`** folder. Simply edit `config.js` or replace the asset files with the same filenames.

---

## 2. Rearranged Scene Flow Overview

The experience follows this seamless cinematic sequence:

1. **Scene 1 (Opening)** & **Scene 2 (Exit Flow with Proximity Smiles)**
2. **Scene 3 (The Fairytale Piñata Quest)**
3. **Scene 4 (The Scalloped Envelope & Love Letter)**
   - *Envelope opens → Words reveal word-by-word → Chibi Nobita starts running ONLY after all words are revealed.*
   - *Catching Nobita unlocks the Golden Heart Key and reveals the "Approach the Baroque Gate" button.*
4. **Scene 5 (The Baroque Golden Gate)**
   - *Unlocks with the Golden Heart Key; doors swing open in 3D perspective.*
   - *Through the open gate, reveals the Polaroid Keepsake Gallery.*
5. **Scene 6 (The Polaroid Keepsake Gallery)**
   - *Displays the 4 polaroids of Yuhashvi with romantic captions.*
   - *Button advances to the birthday cake.*
6. **Scene 7 (The Midnight Wish & Cake Ceremony)**
   - *Candle blow, starfield crossfade, celebratory message, replay button, and chapter quick-jump dropdown.*

---

## 3. Text & Message Customization (`config.js`)

All texts, names, dates, button labels, and dialogue lines live in `config.js`. Open `config.js` in any text editor to modify them:

### 3.1. Basic Recipient Info
```javascript
name: "Yuhashvi",             // Recipient's name displayed throughout
birthdayDate: "September 11", // Birthday date
age: 21,                      // Age
```

### 3.2. Scene 1: Opening Question & Buttons
```javascript
page1: {
  question: "How are you doing in your Favorite and special day of your life ?",
  btnWishAccepted: "Wish Accepted",
  btnExit: "Exit"
}
```

### 3.3. Scene 2: Exit Flow
```javascript
exitScene: {
  title: "Are you truly ready to leave this behind?",
  btnReconsider: "Let's consider" // Button that smiles on proximity (returns to story)
}
```
> [!TIP]
> Navigating to the exit page automatically freezes and tears down any ongoing animations (girl walking, bat swing, typewriter effect, or audio) from previous scenes. Hovering or moving closer to `[ 🥺 Let's consider ]` makes Doraemon and Nobita smile, and clicking it smoothly returns to Scene 1 to continue the magical journey.

### 3.4. Scene 3: Piñata Adventure
```javascript
pinataScene: {
  helpSpeech: "Help me! 🥺",                    // Girl's speech bubble when missing
  instructionDesktop: "Help her reach it!",    // Helper hint on desktop
  instructionMobile: "Move your finger up and down to help her!",
  mobileTapPrompt: "Tap when she can reach it!",
  tapPrompt: "Tap to hit piñata",              // Floating pill shown next to mouse pointer when in striking range
  hit1Text: "THUMP!",                          // Comic sound text on hit 1
  hit2Text: "BAM!",                            // Comic sound text on hit 2
  hit3Text: "WHACK!",                          // Comic sound text on hit 3
  hit4Text: "CRACK!",                          // Comic sound text on hit 4
  revealLine1: "Happy Birthday",               // Scroll banner top line
  revealLine2: "Yuhashvi ♡",                   // Scroll banner name
  btnContinueToPage2: "something for you"      // Continue button label
}
```
> [!TIP]
> The `tapPrompt` tooltip automatically tracks the user's mouse cursor across the screen. It stays hidden whenever the piñata is out of reach or while the girl is mid-jump, and only displays when the piñata is pulled into striking distance. Clicking anywhere on the screen while this prompt is visible immediately strikes the piñata.

### 3.5. Scene 4: Luxury Envelope & Personal Letter
```javascript
page2: {
  introHeader: "Since today is your special day...",
  littleSomethingMessage: "To the one who turned second chances into something sacred",
  envelopeLabel: "For Yuhashvi ♡",
  btnOpenEnvelope: "Open Your Envelope",

  // The complete letter typed out with typewriter animation and scrollbar
  envelopeText: `Happy 21st Birthday! ✨🎂

First time naan unna paaththa antha moment still en memory la perfect ah irrukku 🥹...`,

  btnContinueToPhotos: "Continue"
}
```
> [!NOTE]
> `envelopeText` supports line breaks (`\n`), emojis (🎂, 🌸, 🤍, ✨), and multiline text. The letter paper has a custom Word document-style vertical scrollbar that enables the recipient to scroll smoothly up and down.

### 3.6. Scene 6: Photo Gallery & Captions
```javascript
photoGallery: {
  heading: "A few pictures of someone who deserves a beautiful day ♡",
  photos: [
    {
      id: "photo-01",
      src: "assets/images/photo_01.jpg",
      caption: "There was always an unspoken wonder there...",
      rotation: -4 // Tilt angle in degrees (-5 to +5 recommended)
    },
    // ... add or edit items 02, 03, 04
  ]
}
```

### 3.7. Scene 7: Final Screen Messages & Replay
```javascript
finalScreen: {
  titleLine1: "Happy Birthday",
  titleLine2: "Yuhashvi ♡",
  finalMessage: "The world needs a doctor with a heart like yours. Go get it.",
  btnOneLastThing: "One Last Thing",
  keepSmilingText: "Keep smiling. ♡",
  btnExperienceAgain: "↻ Experience Again"
}
```

---

## 4. Audio Track Replacement (`assets/audio/`)

The soundtrack is divided into **4 portions**, configured to play continuously at a mild volume level (**`0.20`** / 20%):

```javascript
audio: {
  openingMusic: "assets/audio/opening.mp3",       // Portion 1: Scene 1 + Exit
  pinataMusic: "assets/audio/pinata.mp3",         // Portion 2: Piñata Game (entire scene)
  letterMusic: "assets/audio/letter_gallery.mp3", // Portion 3: The Letter & Envelope
  finalMusic: "assets/audio/final.mp3",           // Portion 4: Gate, Gallery & Cake scene (ONE continuous track!)
  defaultVolume: 0.20                             // Mild background sound level
}
```

### Continuity Behavior:
- **Gate, Gallery & Cake Continuity**: When the user unlocks the Baroque Gate, `final.mp3` begins playing and continues playing seamlessly through the Polaroid Gallery and into the Final Cake scene with **zero restart or interruption**!
- **Opening & Exit Continuity**: Moving back and forth between Page 1 and the Exit scene does not restart the music.
- **Built-in Fallback**: If an audio file is missing, the site automatically falls back to its procedural Web Audio chime/kalimba synthesizer, ensuring zero errors.

---

## 5. Memory Quick-Jump Dropdown & Revisit HUD

### 5.1. Changing Dropdown Options
In `index.html` (inside `#final-message-card`), the dropdown options can be customized:

```html
<select id="scene-jump-select" class="scene-jump-select">
  <option value="" disabled selected>Choose a chapter to revisit...</option>
  <option value="pinata">🎮 The Fairytale Piñata Quest</option>
  <option value="exit">🥺 Doraemon & Nobita's Heartfelt Realm</option>
  <option value="page2">💌 The Scalloped Envelope & Love Letter</option>
  <option value="gallery">🌸 The Polaroid Keepsake Gallery</option>
  <option value="final">🎂 The Midnight Wish & Candle Ceremony</option>
</select>
```

And in `js/app.js`, the corresponding display title dictionary:

```javascript
this.sceneTitles = {
  'pinata': '🎮 The Fairytale Piñata Quest',
  'exit': "🥺 Doraemon & Nobita's Heartfelt Realm",
  'page2': '💌 The Scalloped Envelope & Love Letter',
  'gate': '🗝️ The Sacred Baroque Gate',
  'gallery': '🌸 The Polaroid Keepsake Gallery',
  'final': '🎂 The Midnight Wish & Candle Ceremony'
};
```

### 5.2. Two-Option Revisit HUD
When the user jumps to a specific memory, the floating HUD at the top displays two buttons:
1. `[ ⏩ Return to Final Page ]`: Instantly returns to the midnight cake scene with the celebration card and stars intact.
2. `[ ▶️ Continue Natural Flow ]`: Dismisses the HUD and allows the recipient to play through the story forward from that point.

---

## 6. Polaroid Photo Replacement (`assets/images/photo_*.jpg`)

| File Name | Placement | Recommended Dimensions | Format |
| :--- | :--- | :--- | :--- |
| `assets/images/photo_01.jpg` | First Polaroid card | 800 × 1000 px (4:5 aspect ratio) | JPG / PNG / WebP |
| `assets/images/photo_02.jpg` | Second Polaroid card | 800 × 1000 px (4:5 aspect ratio) | JPG / PNG / WebP |
| `assets/images/photo_03.jpg` | Third Polaroid card | 800 × 1000 px (4:5 aspect ratio) | JPG / PNG / WebP |
| `assets/images/photo_04.jpg` | Fourth Polaroid card | 800 × 1000 px (4:5 aspect ratio) | JPG / PNG / WebP |

### How to Replace:
1. Save your photos as `photo_01.jpg`, `photo_02.jpg`, `photo_03.jpg`, `photo_04.jpg`.
2. Overwrite the files inside `assets/images/`.
3. Update the matching captions in `config.js` under `photoGallery.photos`.

---

## 7. Character Sprites (`assets/characters/`)

All character sprites use **100% transparent PNGs**:

| File Name | Role | Aspect / Resolution | Notes |
| :--- | :--- | :--- | :--- |
| `girl_standing.png` | Main girl puppet (standing, walking, bat swing) | 600 × 1000 px PNG | Transparent cut-out |
| `boy_peeking.png` | Boy character peeking from left | 500 × 900 px PNG | Transparent cut-out |
| `boy_throwing_bat.png` | Boy mid-throw pose | 600 × 900 px PNG | Transparent cut-out |
| `wooden_baseball_bat.png` | Flying bat prop | 200 × 100 px PNG | Horizontal angle |
| `nobita_runner.png` | Chibi Nobita holding key in Letter chase | 400 × 500 px PNG | Transparent cut-out |
| `exit_doraemon_sad.jpg` | Exit screen initial sad expressions | 800 × 500 px JPG | High-contrast glass container |
| `exit_doraemon_happy.jpg` | Exit screen proximity happy expressions | 800 × 500 px JPG | Aligns with sad image |

---

## 8. Baroque Golden Gate & Padlock Graphics

The Baroque Golden Gate consists of clean transparent PNG slices positioned dynamically in CSS with 3D perspective hinges:

| File Name | Description | Dimensions | CSS Positioning |
| :--- | :--- | :--- | :--- |
| `gate_pillar_left_v2.png` | Left marble pillar + glass lantern | 153 × 776 px | Left: `0`, Width: `16.38%` |
| `gate_pillar_right_v2.png` | Right marble pillar + glass lantern | 153 × 776 px | Right: `0`, Width: `16.38%` |
| `gate_leaf_full_left.png` | Left golden door leaf | 314 × 825 px | `transform-origin: left center` |
| `gate_leaf_full_right.png` | Right golden door leaf | 314 × 825 px | `transform-origin: right center` |
| `heart_padlock.png` | Centered heart padlock | 400 × 400 px | Centered over center door seam |
| `golden_heart_key.png` | Golden key | 200 × 200 px | Drops into padlock keyhole |

---

## 9. Final Night Scene Images

Scene 7 uses a dual-layer photographic crossfade engine:

1. `assets/images/final_night_lit.jpg`:
   - Night garden with lit candles on the cake, soft fairy lights, and glowing lanterns.
2. `assets/images/final_night_stars.jpg`:
   - The same angle and lighting with extinguished candles, curling smoke, and vibrant shooting stars / nebulae across midnight sky.
3. **Candle Hotspot Coordinate**:
   - The candle flame position in `style.css` is located at:
     ```css
     .final-candle-hotspot {
       position: absolute;
       top: 48%;   /* Adjust vertical position of flame */
       left: 36%;  /* Adjust horizontal position of flame */
     }
     ```

---

## 10. Typography & Fonts (`style.css`)

Fonts are declared at the top of `style.css`:

```css
:root {
  --font-cursive: 'Great Vibes', cursive, 'Brush Script MT';
  --font-letter: 'Harlow Solid Italic', 'Harlow Solid', 'Alex Brush', cursive, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-sans: 'Quicksand', 'Inter', system-ui, sans-serif;
}
```

The letter in Scene 4 uses `--font-letter` (default: **Harlow Solid Italic**):
```css
.letter-text-content {
  font-family: var(--font-letter);
  font-size: 20px;
  line-height: 1.75;
}
```

---

## 11. Keeping the Preloader Accurate (`js/preloader.js`)

Whenever you replace photos or audio files, run this one-line PowerShell command in the project folder to print the exact sizes of your files:

```powershell
Get-ChildItem -Recurse assets/ | Select-Object FullName, Length | Format-Table -AutoSize
```

Copy the updated `Length` values into the corresponding `size:` numbers in `js/preloader.js`.

---

## 12. Local Testing Checklist

Before sharing the experience with the recipient, verify the following:

- [ ] **Preloader**: Reaches 100% and displays the `Let's Begin ♡` button.
- [ ] **Audio Portions**:
  - `opening.mp3` plays during Scene 1 & Exit scene.
  - `pinata.mp3` plays during Piñata.
  - `letter.mp3` plays during the Letter.
  - `final.mp3` starts at the Gate, and continues through the Polaroid Gallery and Cake scene without stopping.
- [ ] **Letter & Nobita**: Letter renders in **Harlow Solid Italic** with Word-doc scrollbar; Chibi Nobita runs in the lower track and hands over the Golden Heart Key.
- [ ] **Baroque Gate**: Heart Padlock unlocks, doors swing open in 3D, and transition leads directly into the Polaroid Gallery.
- [ ] **Gallery**: 4 polaroids render; continue button advances to the final cake.
- [ ] **Candle Blow**: Blowing the candle extinguishes flames, crossfades to stars, and shows the birthday message.
- [ ] **Revisit Dropdown**: Selecting any memory navigates to that scene and displays the 2-option HUD ("Return to Final Page" and "Continue Natural Flow").
