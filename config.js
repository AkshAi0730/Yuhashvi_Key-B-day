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
    question: "How are you doing in your Favorite and special day of your life",
    btnWishAccepted: "Wish Accepted",
    btnExit: "Exit"
  },

  // ==========================================
  // EXIT SCENE: DORAEMON & NOBITA
  // ==========================================
  exitScene: {
    title: "Are you sure wanna leave?",
    btnReconsider: "Let's reconsider"
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
    btnContinueToPage2: "I have something for you"
  },

  // ==========================================
  // PAGE 2: A LITTLE SOMETHING FOR YOU
  // ==========================================
  page2: {
    introHeader: "Since today is your special day...",
    
    // [ADD LITTLE SOMETHING FOR YOU MESSAGE]
    littleSomethingMessage: "[ADD LITTLE SOMETHING FOR YOU MESSAGE]",

    envelopeLabel: "For Yuhashvi ♡",
    btnOpenEnvelope: "Open Your Envelope",

    // [ADD ENVELOPE TEXT]
    envelopeText: "[ADD ENVELOPE TEXT]",

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
        caption: "[ADD PHOTO CAPTION]",
        rotation: -4
      },
      {
        id: "photo-02",
        src: "assets/images/photo_02.jpg",
        caption: "[ADD PHOTO CAPTION]",
        rotation: 3
      },
      {
        id: "photo-03",
        src: "assets/images/photo_03.jpg",
        caption: "[ADD PHOTO CAPTION]",
        rotation: -2
      },
      {
        id: "photo-04",
        src: "assets/images/photo_04.jpg",
        caption: "[ADD PHOTO CAPTION]",
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
    finalMessage: "[ADD FINAL MESSAGE]",

    btnOneLastThing: "One Last Thing",
    keepSmilingText: "Keep smiling. ♡",
    btnExperienceAgain: "↻ Experience Again"
  },

  // ==========================================
  // AUDIO CONFIGURATION
  // Placeholders for user audio files:
  // opening.mp3, exit.mp3, pinata.mp3, final.mp3
  // If empty, the built-in procedural Web Audio synthesizer plays smoothly.
  // ==========================================
  audio: {
    openingMusic: "", // [ADD OPENING MUSIC]
    exitMusic: "",    // [ADD EXIT MUSIC]
    pinataMusic: "",  // [ADD PINATA MUSIC]
    finalMusic: "",   // [ADD FINAL MUSIC]
    defaultVolume: 0.48 // 40-50% volume target
  }
};
