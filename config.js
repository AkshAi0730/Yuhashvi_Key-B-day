/**
 * ============================================================================
 * INTERACTIVE 21ST BIRTHDAY EXPERIENCE - CONFIGURATION
 * Dedicated to: Yuhashvi (September 11)
 * ============================================================================
 * All placeholders mentioned in the project specification are centralized here.
 * You can replace any placeholder below with your own text, photos, or audio
 * without modifying any scene animation or game logic.
 */

window.BIRTHDAY_CONFIG = {
  // Recipient details
  name: "Yuhashvi",
  birthdayDate: "September 11",
  age: 21,

  // ==========================================
  // PAGE 1: OPENING SCENE
  // ==========================================
  page1: {
    question: "How are you doing in your Favorite and special day of your life ?",
    btnWishAccepted: "Wish Accepted",
    btnExit: "Exit"
  },

  // ==========================================
  // EXIT SCENE: DORAEMON & NOBITA
  // ==========================================
  exitScene: {
    title: "Are you truly ready to leave this behind?",
    btnReconsider: "Let's See where things go",
    btnLeave: "Yes, go to final page"
  },

  // ==========================================
  // PIÑATA SCENE
  // ==========================================
  pinataScene: {
    helpSpeech: "Help me! 🥺",
    instructionDesktop: "Help her reach it!",
    instructionMobile: "Move your finger up and down to help her!",
    mobileTapPrompt: "Tap when she can reach it!",
    hit1Text: "THUMP!",
    hit2Text: "BAM!",
    hit3Text: "WHACK!",
    hit4Text: "CRACK!",
    revealLine1: "Happy Birthday",
    revealLine2: "Yuhashvi ♡",
    btnContinueToPage2: "something for you"
  },

  // ==========================================
  // PAGE 2: A LITTLE SOMETHING FOR YOU
  // ==========================================
  page2: {
    introHeader: "Since today is your special day...",
    
    // [ADD LITTLE SOMETHING FOR YOU MESSAGE]
    littleSomethingMessage: "To the one who turned second chances into something sacred",

    envelopeLabel: "For Yuhashvi ♡",
    btnOpenEnvelope: "Open Your Envelope",

    // [ADD ENVELOPE TEXT]
// [ADD ENVELOPE TEXT]
  envelopeText: `Happy 21st Birthday! ✨🎂

First time naan unna paaththa antha moment still unforgerttable 🥹. Antha cute nosepin, athooda antha angry look... a pure magic, enna straight ah moon kke kuutti pona maari oru feel create pannichchu 🌙✨. Naan ninaikkave illa naama ipdi oru nalla vibe kku set aavom endu 🤍.

Honest ah solla pona, en life la eppayum eh nee romba special thaan. Thanks a lot for simply being you 🌸.

Nee oru thadava sonna, contrast taste iruntha life kku set aahaathu nnu. But life la eppavum perfect ah irukkurathu mattum love illa. Nammaloda insecurities, imperfections, downfalls appayum "enakku nee thaan" nnu oruthar pakkathula nikkirathu than true love 💫. Same shade ah vida, eppayum contrast colour combo thaan best ah match aahum.

Sari however, from today onwards you are officially 21! 🎉 So ini un perspectives rombave change aahalaam. Un aasa padi unakku KDU la admission kidaikkum, will pray for you 🩺✨. The way nee ovvoru person ayum care pandrathu, un character and all are genuinely top notch 👏.

Chumma oru small note thaan ithu 💌. Intha lines un face la oru chinna spark ah create panni irrukkum endu namburan... but atha paakka thaan enakku kidaikkala 🙃.

Wish you a very happy, peaceful life ahead. Have an amazing day! 🤍✨`,

  btnContinueToPhotos: "Continue"
  },

  // ==========================================
  // PHOTO SECTION: SCRAPBOOK / POLAROIDS
  // Note: These are NOT shared memories.
  // ==========================================
  photoGallery: {
    heading: "A few pictures of someone who deserves a beautiful day ♡",
    
    // [ADD PHOTO 01..04] & [ADD PHOTO CAPTION]
    photos: [
      {
        id: "photo-01",
        src: "assets/images/photo_01.jpg",
        caption: "There was always an unspoken wonder there—one look, and I was entirely undone",
        rotation: -4
      },
      {
        id: "photo-02",
        src: "assets/images/photo_02.jpg",
        caption: "My first sight at sunrise, my last thought under the stars",
        rotation: 3
      },
      {
        id: "photo-03",
        src: "assets/images/photo_03.jpg",
        caption: "Two quiet wonders face to face—one sewn of cotton, the other made of pure grace",
        rotation: -2
      },
      {
        id: "photo-04",
        src: "assets/images/photo_04.jpg",
        caption: "Tied with ribbon and sweet nostalgia, blooming in the very shade of your softness",
        rotation: 4
      }
    ],

    btnOneMoreSurprise: "One More Surprise"
  },

  // ==========================================
  // SECRET DORAEMON SURPRISE
  // ==========================================
  secretSurprise: {
    doraemonHint: "Psst... I have one more thing for you! 👀",
    btnOpenGift: "Open",
    foundSecretText: "You found the secret! ♡",
    oneLastThingPrompt: "But there's one last thing...",
    btnContinueToFinal: "Continue"
  },

  // ==========================================
  // FINAL SCREEN: NIGHTTIME BIRTHDAY SCENE
  // ==========================================
  finalScreen: {
    titleLine1: "Happy Birthday",
    titleLine2: "Yuhashvi ♡",

    // [ADD FINAL MESSAGE]
    finalMessage: "The world needs a doctor with a heart like yours. Go get it.",

    btnOneLastThing: "One Last Thing",
    keepSmilingText: "Keep smiling. ♡",
    btnExperienceAgain: "↻ Experience Again"
  },

  // ==========================================
  // AUDIO CONFIGURATION
  // 4 Divided Portions (Mild sound ~20% volume):
  // 1. Opening: From "Let's Begin" until Piñata Game appears
  // 2. Piñata Game: Separate energetic track throughout piñata game
  // 3. The Letter: Peaceful soundtrack for envelope & letter reading
  // 4. Gate, Gallery & Cake: ONE shared soundtrack continuing across Gate, Gallery & Final scene!
  // ==========================================
  audio: {
    openingMusic: "assets/audio/opening.mp3",              // Portion 1: Opening & Exit
    pinataMusic: "assets/audio/pinata.mp3",                // Portion 2: Piñata Game
    letterMusic: "assets/audio/letter_gallery.mp3",        // Portion 3: The Letter & Envelope
    letterGalleryMusic: "assets/audio/letter_gallery.mp3", // Backward compatibility alias
    finalMusic: "assets/audio/final.mp3",                  // Portion 4: Gate, Gallery & Cake scene
    defaultVolume: 0.20                                    // Mild volume level (~20%)
  }
};
