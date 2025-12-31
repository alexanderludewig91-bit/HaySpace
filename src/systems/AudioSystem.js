let audioCtx = null;
let introMusic = null;
let levelMusic = null;
let currentLevelMusic = null; // Aktuell laufende Level-Musik

// Lautstärke-Einstellungen (0-1, werden von Settings überschrieben)
let musicVolume = 0.5; // 50% Standard
let sfxVolume = 1.0;   // 100% Standard

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur = 0.08, type = 'sine', gain = 0.05, startOffset = 0) {
  const ac = ensureAudio();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0.0001;
  o.connect(g);
  g.connect(ac.destination);

  const t0 = ac.currentTime + startOffset;
  // SFX-Lautstärke anwenden
  const adjustedGain = gain * sfxVolume;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(adjustedGain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.01);
}

export function sfx(kind) {
  if (kind === 'shoot') { tone(780, 0.04, 'triangle', 0.028); tone(1040, 0.025, 'triangle', 0.018); return; }
  if (kind === 'overheat') { tone(220, 0.10, 'sawtooth', 0.055); tone(160, 0.12, 'sawtooth', 0.045); return; }
  if (kind === 'shield') { tone(620, 0.07, 'sine', 0.05); tone(920, 0.08, 'sine', 0.04); return; }
  if (kind === 'upgrade') { tone(660, 0.06, 'triangle', 0.055); tone(900, 0.06, 'triangle', 0.055); tone(1240, 0.09, 'triangle', 0.055); return; }
  if (kind === 'hit') { tone(260, 0.06, 'square', 0.045); tone(180, 0.08, 'square', 0.040); return; }
  if (kind === 'bossExplosion') {
    // Mächtiger Explosionssound: Tiefer, bassiger Boom
    const ac = ensureAudio();
    if (!ac) return;
    const t0 = ac.currentTime;
    
    // Sehr tiefer, langer Bass-Boom (wie eine echte Explosion)
    tone(40, 0.6, 'sine', 0.20, 0); // Sehr tiefer, langer Bass
    tone(55, 0.5, 'sine', 0.18, 0); // Tiefer Bass
    tone(70, 0.45, 'sine', 0.15, 0); // Mittlerer Bass
    
    // Kurzer, tiefer Knall (nicht schrill)
    tone(80, 0.15, 'square', 0.12, 0.02);
    tone(100, 0.12, 'square', 0.10, 0.02);
    
    // Tiefer Nachhall der ausklingt
    tone(35, 0.8, 'sine', 0.12, 0.1);
    tone(50, 0.7, 'sine', 0.10, 0.1);
    tone(65, 0.6, 'sine', 0.08, 0.1);
  }
}

// Intro-Musik initialisieren
function initIntroMusic() {
  if (!introMusic) {
    introMusic = new Audio('/backround-music/Intro.mp3');
    introMusic.loop = true;
    introMusic.volume = musicVolume;
    introMusic.preload = 'auto';
    
    // Fehlerbehandlung
    introMusic.addEventListener('error', (e) => {
      console.error('Fehler beim Laden der Intro-Musik:', e);
    });
  }
  return introMusic;
}

export function startBackgroundMusic() {
  ensureAudio();
  const music = initIntroMusic();
  
  // Aktuelle Lautstärke setzen
  if (music) {
    music.volume = musicVolume;
    
    // Funktion zum Abspielen der Musik
    const tryPlay = () => {
      if (music.paused) {
        const playPromise = music.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            // Fehler ignorieren, wenn es ein Autoplay-Policy-Fehler ist
            // Die Musik wird dann beim ersten Benutzerinteraktion gestartet
            if (err.name !== 'NotAllowedError') {
              console.error('Fehler beim Abspielen der Intro-Musik:', err);
            }
          });
        }
      }
    };
    
    // Wenn die Musik bereits genug Daten hat, sofort abspielen
    if (music.readyState >= 2) { // HAVE_CURRENT_DATA oder höher
      tryPlay();
    } else {
      // Warten, bis die Musik geladen ist
      music.addEventListener('canplay', tryPlay, { once: true });
      // Auch versuchen, sofort abzuspielen (für den Fall, dass es bereits geladen ist)
      tryPlay();
    }
  }
}

export function stopBackgroundMusic() {
  if (introMusic && !introMusic.paused) {
    introMusic.pause();
    introMusic.currentTime = 0; // Zurück zum Anfang
  }
}

// Level-Musik initialisieren
function initLevelMusic(level) {
  // Wenn bereits die richtige Level-Musik läuft, nichts tun
  if (currentLevelMusic && currentLevelMusic.src.endsWith(`Level${level}.mp3`)) {
    return currentLevelMusic;
  }
  
  // Alte Level-Musik stoppen, falls vorhanden
  if (levelMusic && !levelMusic.paused) {
    levelMusic.pause();
    levelMusic.currentTime = 0;
  }
  
  // Neue Level-Musik erstellen
  levelMusic = new Audio(`/backround-music/Level${level}.mp3`);
  levelMusic.loop = true;
  levelMusic.volume = musicVolume;
  levelMusic.preload = 'auto';
  
  // Fehlerbehandlung
  levelMusic.addEventListener('error', (e) => {
    console.error(`Fehler beim Laden der Level ${level} Musik:`, e);
  });
  
  currentLevelMusic = levelMusic;
  return levelMusic;
}

// Level-Musik starten
export function startLevelMusic(level) {
  ensureAudio();
  
  // Intro-Musik stoppen
  stopBackgroundMusic();
  
  // Level-Musik initialisieren und starten
  const music = initLevelMusic(level);
  
  if (music) {
    music.volume = musicVolume;
    
    // Musik abspielen, wenn sie pausiert ist
    if (music.paused) {
      const playPromise = music.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'NotAllowedError') {
            console.error(`Fehler beim Abspielen der Level ${level} Musik:`, err);
          }
        });
      }
    }
  }
}

// Level-Musik stoppen
export function stopLevelMusic() {
  if (levelMusic && !levelMusic.paused) {
    levelMusic.pause();
    levelMusic.currentTime = 0; // Zurück zum Anfang
  }
  currentLevelMusic = null;
}

// Lautstärke-Einstellungen setzen
export function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(1, volume)); // Clamp zwischen 0 und 1
  if (introMusic) {
    introMusic.volume = musicVolume;
  }
  if (levelMusic) {
    levelMusic.volume = musicVolume;
  }
}

export function setSFXVolume(volume) {
  sfxVolume = Math.max(0, Math.min(1, volume)); // Clamp zwischen 0 und 1
}

export function getMusicVolume() {
  return musicVolume;
}

export function getSFXVolume() {
  return sfxVolume;
}

export { ensureAudio };


