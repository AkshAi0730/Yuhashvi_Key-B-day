# Interactive 21st Birthday Experience for Yuhashvi ♡

A beautiful, cinematic, and responsive interactive story-game website created specifically for **Yuhashvi** celebrating her **21st birthday on September 11**.

---

## 🌟 Story & Experience Flow

1. **Opening Scene (Page 1)**:
   - Preserves the warm, dreamy miniature atmosphere with the cute smooth brown bear vinyl figure in a pink polka-dot swimsuit and pink hibiscus flower by the miniature deck chairs.
   - Clean left area with the question: *"How are you doing in your Favorite and special day of your life"*.
   - Buttons: `[ 💖 Wish Accepted ]` and `[ 🚪 Exit ]`.

2. **Exit Flow**:
   - Clicking `[ Exit ]` transitions into a cinematic dark glassmorphism space with floating stars.
   - Doraemon & Nobita sit side by side looking sad.
   - **Proximity Interaction**: As your cursor approaches the `[ 🥺 Let's reconsider ]` button, their expressions smoothly transform into happy smiles with sparkling eyes and tiny floating hearts!
   - On mobile, touching the button triggers the happy reaction.
   - Clicking `[ Let's reconsider ]` returns smoothly to Page 1 without reloading.

3. **Piñata Interactive Scene**:
   - Cute animated fairytale outdoor environment.
   - The girl walks naturally into the center from the left.
   - The boy character peeks from the left and throws a baseball bat with a comic-style **"BAM!"** sound and pop effect.
   - The girl picks up the bat and tries to hit the piñata 3 times, missing because it's too high.
   - Her speech bubble asks: *"Help me! 🥺"*.
   - A bright shooting star streaks across the upper sky, leaving glowing sparkles and unlocking the rope control handle on the right.
   - **Core Gameplay Mechanic**:
     - Moving mouse **UP** lowers the piñata.
     - Moving mouse **DOWN** raises the piñata.
     - Smooth elastic spring physics with safe vertical boundaries.
     - Mobile: swipe finger vertically up and down to adjust height, then tap the prompt to strike!
   - **Hit Sequence**:
     - Hit 1: *THUMP!* (shaking)
     - Hit 2: *BAM!* (cracks)
     - Hit 3: *WHACK!* (more cracks)
     - Hit 4: *CRACK!* (breaks!)
   - **100 Doraemon Shower**:
     - 100 miniature Doraemon dolls cascade down in waves with realistic bounce and rotation physics, piling up over the girl.
     - Short comedic pause, then the dolls shift and the girl peeks out from the pile with a warm smile!
   - **Birthday Reveal**:
     - Upward animation of *"Happy Birthday"* and *"Yuhashvi ♡"* close to the girl.
     - Button `[ 💌 I have something for you ]` appears to continue to Page 2.

4. **Page 2: A Little Something For You & Interactive Envelope**:
   - Soft pastel gradient card with floating hearts.
   - Interactive envelope labeled *"For Yuhashvi ♡"*.
   - Clicking `[ Open Your Envelope ]` shakes the envelope, releases floating hearts, flips the flap open, rises the letter paper, and reveals the personal message with a gradual typewriter effect.
   - Button `[ 🌸 Continue ]` advances to the photo gallery.

5. **Photo Section & Secret Doraemon Surprise**:
   - Tasteful scrapbook/polaroid gallery with gentle tilts, hover straighten, scaling, and glow.
   - Heading: *"A few pictures of someone who deserves a beautiful day ♡"*.
   - **Secret Discovery**: A hidden Doraemon figure is tucked on one of the polaroids. Clicking it pops out Doraemon with: *"Psst... I have one more thing for you! 👀"* and displays a gift box.
   - Clicking `[ 🎁 Open ]` triggers a confetti celebration burst with sound, displaying *"You found the secret! ♡"*, followed by *"But there's one last thing..."*.

6. **Final Screen & Candle Blow**:
   - Peaceful nighttime birthday scene with deep blue/purple sky, moon, stars, and soft bokeh.
   - The girl sits beside an elegant cake with a glowing **"21"** candle with a gently flickering flame.
   - Emotional final birthday message and `[ ✨ One Last Thing ]` button.
   - When clicked, the girl gently blows toward the candle, extinguishing the flame with a curl of smoke.
   - The scene darkens momentarily, and hundreds of magical twinkling starlight sparkles ignite across the sky!
   - Displays: *"Keep smiling. ♡"* with the `[ ↻ Experience Again ]` button, which seamlessly loops back to Page 1 without a full browser reload.

---

## 🎵 Global Music System

- **Zero Missing Audio Errors**: Features a built-in procedural Web Audio synthesizer that generates dreamy ambient kalimba/piano melodies and playful sound effects out of the box.
- **Custom Audio Support**: To use your own MP3 files, simply drop them into `assets/audio/` and specify the file path in `config.js`:
  ```javascript
  audio: {
    openingMusic: "assets/audio/opening.mp3",
    pinataMusic: "assets/audio/pinata.mp3",
    finalMusic: "assets/audio/final.mp3",
  }
  ```
- **Persistent Controls**: Small floating button in top-right corner (`♪ / 🔇`) allows instant muting/unmuting anytime.
- **Browser Autoplay Compliant**: A gentle "Tap to begin ♡" welcome screen ensures audio context unlocks smoothly on modern browsers.

---

## ✏️ How to Edit Content & Placeholders

All customizable placeholders are cleanly centralized in `config.js`:

1. **Messages**:
   - `page2.littleSomethingMessage`: Text shown on Page 2 card.
   - `page2.envelopeText`: Letter text inside the interactive envelope.
   - `finalScreen.finalMessage`: Final message displayed on the nighttime cake screen.

2. **Photos & Captions**:
   - `photoGallery.photos`: Array of polaroid images (`src`), captions, and subtle tilt angles (`rotation`). Replace `assets/images/photo_01.jpg` through `photo_04.jpg` with any portrait images.

---

## 🚀 How to Run

1. Simply double-click `index.html` to open it in Chrome, Edge, Brave, or any modern web browser.
2. Alternatively, serve via any local static web server or host on GitHub Pages / Firebase Hosting / Netlify.
