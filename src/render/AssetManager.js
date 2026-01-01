/**
 * Asset Manager
 * Verwaltet das Laden aller Spiel-Assets (Bilder)
 */

// Spieler-Assets
let spaceshipImage = null;
let spaceshipImageLoaded = false;

// Gegner-Assets
let droneImage = null;
let droneImageLoaded = false;
let strikerImage = null;
let strikerImageLoaded = false;
let tankImage = null;
let tankImageLoaded = false;
let hunterImage = null;
let hunterImageLoaded = false;
let crusherImage = null;
let crusherImageLoaded = false;
let guardianImage = null;
let guardianImageLoaded = false;
let destroyerImage = null;
let destroyerImageLoaded = false;
let reaperImage = null;
let reaperImageLoaded = false;
let titanImage = null;
let titanImageLoaded = false;
let voidImage = null;
let voidImageLoaded = false;
let apocalypseImage = null;
let apocalypseImageLoaded = false;

// Boss-Assets
let bossCore1Image = null;
let bossCore1ImageLoaded = false;
let bossCore2Image = null;
let bossCore2ImageLoaded = false;
let bossCore2RingImage = null;
let bossCore2RingImageLoaded = false;
let bossCore3Image = null;
let bossCore3ImageLoaded = false;
let bossCore3RingElementImage = null;
let bossCore3RingElementImageLoaded = false;

// Hilfsfunktion zum Laden eines Bildes
function loadImage(src, onLoad, onError) {
  const img = new Image();
  img.onload = onLoad;
  img.onerror = onError;
  img.src = src;
  return img;
}

// Spieler-Assets laden
const spaceshipImg = loadImage(
  '/spaceship.png',
  () => { spaceshipImage = spaceshipImg; spaceshipImageLoaded = true; },
  () => { console.warn('Spaceship image could not be loaded, falling back to default rendering'); spaceshipImageLoaded = false; }
);

// Gegner-Assets laden
const droneImg = loadImage(
  '/drone.png',
  () => { droneImage = droneImg; droneImageLoaded = true; },
  () => { console.warn('Drone image could not be loaded, falling back to default rendering'); droneImageLoaded = false; }
);

const strikerImg = loadImage(
  '/striker.png',
  () => { strikerImage = strikerImg; strikerImageLoaded = true; },
  () => { console.warn('Striker image could not be loaded, falling back to default rendering'); strikerImageLoaded = false; }
);

const tankImg = loadImage(
  '/tank.png',
  () => { tankImage = tankImg; tankImageLoaded = true; },
  () => { console.warn('Tank image could not be loaded, falling back to default rendering'); tankImageLoaded = false; }
);

const hunterImg = loadImage(
  '/hunter.png',
  () => { hunterImage = hunterImg; hunterImageLoaded = true; },
  () => { console.warn('Hunter image could not be loaded, falling back to default rendering'); hunterImageLoaded = false; }
);

const crusherImg = loadImage(
  '/crusher.png',
  () => { crusherImage = crusherImg; crusherImageLoaded = true; },
  () => { console.warn('Crusher image could not be loaded, falling back to default rendering'); crusherImageLoaded = false; }
);

const guardianImg = loadImage(
  '/guardian.png',
  () => { guardianImage = guardianImg; guardianImageLoaded = true; },
  () => { console.warn('Guardian image could not be loaded, falling back to default rendering'); guardianImageLoaded = false; }
);

const destroyerImg = loadImage(
  '/destroyer.png',
  () => { destroyerImage = destroyerImg; destroyerImageLoaded = true; },
  () => { console.warn('Destroyer image could not be loaded, falling back to default rendering'); destroyerImageLoaded = false; }
);

const reaperImg = loadImage(
  '/reaper.png',
  () => { reaperImage = reaperImg; reaperImageLoaded = true; },
  () => { console.warn('Reaper image could not be loaded, falling back to default rendering'); reaperImageLoaded = false; }
);

const titanImg = loadImage(
  '/titan.png',
  () => { titanImage = titanImg; titanImageLoaded = true; },
  () => { console.warn('Titan image could not be loaded, falling back to default rendering'); titanImageLoaded = false; }
);

const voidImg = loadImage(
  '/void.png',
  () => { voidImage = voidImg; voidImageLoaded = true; },
  () => { console.warn('Void image could not be loaded, falling back to default rendering'); voidImageLoaded = false; }
);

const apocalypseImg = loadImage(
  '/apocalypse.png',
  () => { apocalypseImage = apocalypseImg; apocalypseImageLoaded = true; },
  () => { console.warn('Apocalypse image could not be loaded, falling back to default rendering'); apocalypseImageLoaded = false; }
);

// Boss-Assets laden
const bossCore1Img = loadImage(
  '/boss_core1.png',
  () => { bossCore1Image = bossCore1Img; bossCore1ImageLoaded = true; },
  () => { console.warn('Boss Core 1 image could not be loaded, falling back to default rendering'); bossCore1ImageLoaded = false; }
);

const bossCore2Img = loadImage(
  '/boss_core2.png',
  () => { bossCore2Image = bossCore2Img; bossCore2ImageLoaded = true; },
  () => { console.warn('Boss Core 2 image could not be loaded, falling back to default rendering'); bossCore2ImageLoaded = false; }
);

const bossCore2RingImg = loadImage(
  '/boss_core2_ring.png',
  () => { bossCore2RingImage = bossCore2RingImg; bossCore2RingImageLoaded = true; },
  () => { console.warn('Boss Core 2 Ring image could not be loaded'); bossCore2RingImageLoaded = false; }
);

const bossCore3Img = loadImage(
  '/boss_core3.png',
  () => { bossCore3Image = bossCore3Img; bossCore3ImageLoaded = true; },
  () => { console.warn('Boss Core 3 image could not be loaded, falling back to default rendering'); bossCore3ImageLoaded = false; }
);

const bossCore3RingElementImg = loadImage(
  '/boss_core3_ring_element.png',
  () => { bossCore3RingElementImage = bossCore3RingElementImg; bossCore3RingElementImageLoaded = true; },
  () => { console.warn('Boss Core 3 Ring Element image could not be loaded'); bossCore3RingElementImageLoaded = false; }
);

// Export aller Assets und Status-Flags
export const Assets = {
  // Spieler
  spaceship: { image: () => spaceshipImage, loaded: () => spaceshipImageLoaded },
  
  // Gegner
  drone: { image: () => droneImage, loaded: () => droneImageLoaded },
  striker: { image: () => strikerImage, loaded: () => strikerImageLoaded },
  tank: { image: () => tankImage, loaded: () => tankImageLoaded },
  hunter: { image: () => hunterImage, loaded: () => hunterImageLoaded },
  crusher: { image: () => crusherImage, loaded: () => crusherImageLoaded },
  guardian: { image: () => guardianImage, loaded: () => guardianImageLoaded },
  destroyer: { image: () => destroyerImage, loaded: () => destroyerImageLoaded },
  reaper: { image: () => reaperImage, loaded: () => reaperImageLoaded },
  titan: { image: () => titanImage, loaded: () => titanImageLoaded },
  void: { image: () => voidImage, loaded: () => voidImageLoaded },
  apocalypse: { image: () => apocalypseImage, loaded: () => apocalypseImageLoaded },
  
  // Boss
  bossCore1: { image: () => bossCore1Image, loaded: () => bossCore1ImageLoaded },
  bossCore2: { image: () => bossCore2Image, loaded: () => bossCore2ImageLoaded },
  bossCore2Ring: { image: () => bossCore2RingImage, loaded: () => bossCore2RingImageLoaded },
  bossCore3: { image: () => bossCore3Image, loaded: () => bossCore3ImageLoaded },
  bossCore3RingElement: { image: () => bossCore3RingElementImage, loaded: () => bossCore3RingElementImageLoaded },
};

