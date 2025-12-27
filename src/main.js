/**
 * Main Entry Point
 * Initialisiert das Spiel und verbindet alle Module
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { ensureAudio, startBackgroundMusic, stopLevelMusic, setMusicVolume, setSFXVolume } from './systems/AudioSystem.js';
import { Game } from './game/Game.js';
import { GamepadSystem } from './systems/GamepadSystem.js';
import { initGamepadMenuNavigation } from './ui/GamepadMenuNavigation.js';
import { UpgradeSystem } from './systems/UpgradeSystem.js';
import { Shop } from './ui/Shop.js';
import { initDevMode } from './ui/DevMode.js';

// DOM References
import { DOM, initDOMReferences } from './ui/DOMReferences.js';

// Utilities
import { resetLocalStorage, loadFromLocalStorage, loadSettings } from './utils/LocalStorageManager.js';

// UI Components
import { showScreen } from './ui/ScreenManager.js';
import { showGameMenu, showShop, transitionToLevelSelect, showPauseMenu, hidePauseMenu, restart } from './ui/MenuManager.js';
import { initTitleStarfield, setTitleStarfieldVisible, updateTitleStarfield } from './ui/TitleStarfield.js';
import { renderLevelSelect } from './ui/LevelSelectRenderer.js';

// Game Systems
import { startLevel } from './game/LevelManager.js';
import { initGameLoop, resetGameLoop } from './game/GameLoop.js';

// Initialize DOM References
initDOMReferences();

const W = CANVAS_WIDTH;
const H = CANVAS_HEIGHT;

// Input
const keys = new Set();
let hardMode = false;

// State Management
let levelCompleteDelayStarted = false;
let levelCompleteTime = 0;

// State Setters/Getters (für GameLoop)
function setLevelCompleteDelayStarted(value) {
  levelCompleteDelayStarted = value;
}

function setLevelCompleteTime(value) {
  levelCompleteTime = value;
}

function getLevelCompleteDelayStarted() {
  return levelCompleteDelayStarted;
}

function getLevelCompleteTime() {
  return levelCompleteTime;
}

// Gamepad System
const gamepad = new GamepadSystem();

// Upgrade System
const upgradeSystem = new UpgradeSystem();

// Shop System
const shop = new Shop(upgradeSystem, (upgradeType, level) => {
  console.log(`Upgrade gekauft: ${upgradeType} Stufe ${level}`);
});

// Game instance
const game = new Game(upgradeSystem);

// Gamepad Menu Navigation initialisieren
const menuNavigationElements = {
  titleScreen: DOM.titleScreen,
  startJourneySection: DOM.startJourneySection,
  mainMenuSection: DOM.mainMenuSection,
  levelSelectContent: DOM.levelSelectContent,
  settingsContent: DOM.settingsContent,
  gameMenuContent: DOM.gameMenuContent,
  shopContent: DOM.shopContent,
  levelList: DOM.levelList,
  levelComplete: DOM.levelComplete,
  gameComplete: DOM.gameComplete,
  pauseMenu: DOM.pauseMenu,
  startJourneyBtn: DOM.startJourneyBtn,
  newGameBtn: DOM.newGameBtn,
  continueBtn: DOM.continueBtn,
  settingsBtn: DOM.settingsBtn,
  backToTitleFromMainBtn: DOM.backToTitleFromMainBtn,
  resumeBtn: DOM.resumeBtn,
  pauseToLevelSelectBtn: DOM.pauseToLevelSelectBtn,
  backToTitleBtn: DOM.backToTitleBtn,
  nextLevelBtn: DOM.nextLevelBtn,
  backToLevelSelectBtn: DOM.backToLevelSelectBtn,
  backToLevelSelectFromCompleteBtn: DOM.backToLevelSelectFromCompleteBtn,
  confirmNewGameBtn: DOM.confirmNewGameBtn,
  cancelNewGameBtn: DOM.cancelNewGameBtn,
  settingsBackBtn: DOM.settingsBackBtn,
  levelSelectMenuBtn: DOM.levelSelectMenuBtn,
  shopBtn: DOM.shopBtn,
  gameMenuBackBtn: DOM.gameMenuBackBtn,
  shopBackBtn: DOM.shopBackBtn
};

const { setupGamepadNavigation, handleGamepadBack } = initGamepadMenuNavigation(
  menuNavigationElements,
  gamepad,
  ensureAudio
);

// Title Starfield initialisieren
initTitleStarfield(DOM.titleStarfieldCanvas, DOM.titleStarfieldCtx);

// Dependencies Object für alle Module
const dependencies = {
  DOM,
  game,
  keys,
  gamepad,
  upgradeSystem,
  shop,
  hardMode,
  setupGamepadNavigation,
  handleGamepadBack,
  showScreen,
  showGameMenu,
  showShop,
  transitionToLevelSelect,
  showPauseMenu,
  hidePauseMenu,
  restart,
  startLevel,
  setLevelCompleteDelayStarted,
  setLevelCompleteTime,
  getLevelCompleteDelayStarted,
  getLevelCompleteTime,
  onLevelClick: (level) => {
    startLevel(level, {
      game,
      upgradeSystem,
      gamepad,
      DOM,
      hardMode,
      setLevelCompleteDelayStarted,
      setLevelCompleteTime
    });
  }
};

// Keyboard Input
window.addEventListener('keydown', (e) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys.add(e.code);

  if (e.code === 'KeyR') restart(dependencies);
  if (e.code === 'KeyP' || (e.code === 'Enter' && game.state === 'play')) {
    if (game.state === 'play') {
      e.preventDefault();
      if (game.paused) {
        hidePauseMenu(dependencies);
      } else {
        showPauseMenu(dependencies);
      }
    }
  }
  
  // Dev Mode Button Toggle (Taste 9)
  if (e.code === 'Digit9') {
    const devModeBtn = document.getElementById('devModeBtn');
    if (devModeBtn) {
      devModeBtn.classList.toggle('hidden');
    }
  }
}, {passive:false});

window.addEventListener('keyup', (e) => keys.delete(e.code));

// Button Event Listeners
// Start Journey Button
DOM.startJourneyBtn?.addEventListener('click', () => {
  ensureAudio();
  
  // Sterne ausblenden
  setTitleStarfieldVisible(false);
  if (DOM.titleStarfieldCanvas) {
    DOM.titleStarfieldCanvas.style.opacity = '0';
    DOM.titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-out';
  }
  
  // Start Journey Button ausblenden mit Animation
  DOM.startJourneyBtn?.classList.add('start-journey-exit');
  
  setTimeout(() => {
    DOM.startJourneySection?.classList.add('hidden');
    DOM.startJourneyBtn?.classList.remove('start-journey-exit');
    
    DOM.mainMenuSection?.classList.remove('hidden');
    
    const mainMenuCard = DOM.mainMenuSection?.querySelector('.card');
    if (mainMenuCard) {
      mainMenuCard.style.opacity = '0';
      mainMenuCard.style.transform = 'scale(0.85) translateY(15px)';
      mainMenuCard.classList.add('level-select-enter');
      
      setTimeout(() => {
        mainMenuCard.classList.add('level-select-enter');
        setTimeout(() => {
          mainMenuCard.classList.remove('level-select-enter');
          mainMenuCard.style.opacity = '';
          mainMenuCard.style.transform = '';
        }, 600);
      }, 50);
    }
    
    const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
    menuButtons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.9) translateY(10px)';
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 1) btn.classList.add('level-button-enter-delay-1');
        if (index === 2) btn.classList.add('level-button-enter-delay-2');
        if (index === 3) btn.classList.add('level-button-enter-delay-2');
        
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 500);
      }, 200 + (index * 100));
    });
    
    setTimeout(() => {
      setupGamepadNavigation('title');
    }, 1000);
  }, 600);
});

// New Game Button
DOM.newGameBtn?.addEventListener('click', () => {
  ensureAudio();
  
  const existingSave = localStorage.getItem('unlockedLevels');
  const unlockedLevels = existingSave ? JSON.parse(existingSave) : [1];
  
  if (unlockedLevels.length > 1 || (unlockedLevels.length === 1 && unlockedLevels[0] > 1)) {
    showScreen('newGameWarning', dependencies);
  } else {
    resetLocalStorage();
    upgradeSystem.reset();
    game.unlockedLevels = [1];
    showGameMenu(dependencies);
  }
});

// Continue Button
DOM.continueBtn?.addEventListener('click', () => {
  ensureAudio();
  game.unlockedLevels = game.getUnlockedLevels();
  showGameMenu(dependencies);
});

// Settings Button
DOM.settingsBtn?.addEventListener('click', () => {
  ensureAudio();
  
  if (DOM.mainMenuButtons && DOM.mainMenuButtons.style.display !== 'none') {
    const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
    menuButtons.forEach((btn) => {
      btn.classList.add('start-journey-exit');
    });
    
    setTimeout(() => {
      DOM.mainMenuButtons.style.display = 'none';
      menuButtons.forEach(btn => {
        btn.classList.remove('start-journey-exit');
      });
      
      DOM.titleScreen?.classList.remove('hidden');
      DOM.startJourneySection?.classList.add('hidden');
      DOM.mainMenuSection?.classList.remove('hidden');
      
      if (DOM.levelSelectContent) {
        DOM.levelSelectContent.style.display = 'none';
      }
      
      if (DOM.settingsContent) {
        DOM.settingsContent.style.opacity = '0';
        DOM.settingsContent.style.transform = 'scale(0.95)';
        DOM.settingsContent.style.display = 'block';
        
        setTimeout(() => {
          DOM.settingsContent.classList.add('level-button-enter');
          setTimeout(() => {
            DOM.settingsContent.classList.remove('level-button-enter');
            DOM.settingsContent.style.opacity = '';
            DOM.settingsContent.style.transform = '';
          }, 500);
        }, 200);
      }
      
      setTimeout(() => {
        setupGamepadNavigation('settings');
      }, 1000);
    }, 300);
  } else {
    showScreen('settings', dependencies);
  }
});

// Settings Back Button
DOM.settingsBackBtn?.addEventListener('click', () => {
  ensureAudio();
  
  if (DOM.settingsContent) {
    DOM.settingsContent.classList.add('start-journey-exit');
    
    setTimeout(() => {
      DOM.settingsContent.style.display = 'none';
      DOM.settingsContent.classList.remove('start-journey-exit');
      
      if (DOM.levelSelectContent) {
        DOM.levelSelectContent.style.display = 'none';
      }
      
      if (DOM.mainMenuCard) {
        DOM.mainMenuCard.classList.remove('card-expanding');
        requestAnimationFrame(() => {
          DOM.mainMenuCard.style.width = 'min(500px, 92vw)';
          setTimeout(() => {
            DOM.mainMenuCard.style.width = '';
          }, 600);
        });
      }
      
      if (DOM.mainMenuButtons) {
        DOM.mainMenuButtons.style.display = 'flex';
        DOM.mainMenuButtons.style.flexDirection = 'column';
        DOM.mainMenuButtons.style.gap = '16px';
        
        const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
        menuButtons.forEach((btn, index) => {
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.9) translateY(10px)';
          
          setTimeout(() => {
            btn.classList.add('level-button-enter');
            if (index === 1) btn.classList.add('level-button-enter-delay-1');
            if (index === 2) btn.classList.add('level-button-enter-delay-2');
            if (index === 3) btn.classList.add('level-button-enter-delay-2');
            
            setTimeout(() => {
              btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
              btn.style.opacity = '';
              btn.style.transform = '';
            }, 500);
          }, 200 + (index * 100));
        });
        
        setTimeout(() => {
          setupGamepadNavigation('title');
          setTimeout(() => {
            setupGamepadNavigation('title');
          }, 300);
        }, 1200);
      }
    }, 300);
  }
});

// Music Volume Slider
DOM.musicVolumeSlider?.addEventListener('input', (e) => {
  const volume = parseFloat(e.target.value) / 100;
  setMusicVolume(volume);
  if (DOM.musicVolumeValue) {
    DOM.musicVolumeValue.textContent = Math.round(volume * 100) + '%';
  }
  localStorage.setItem('musicVolume', volume.toString());
});

// SFX Volume Slider
DOM.sfxVolumeSlider?.addEventListener('input', (e) => {
  const volume = parseFloat(e.target.value) / 100;
  setSFXVolume(volume);
  if (DOM.sfxVolumeValue) {
    DOM.sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
  }
  localStorage.setItem('sfxVolume', volume.toString());
});

// Back to Title Button (vom Hauptmenü)
DOM.backToTitleFromMainBtn?.addEventListener('click', () => {
  ensureAudio();
  
  const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
  menuButtons.forEach((btn) => {
    btn.classList.add('start-journey-exit');
  });
  
  setTimeout(() => {
    gamepad.disableMenuNavigation();
    
    DOM.mainMenuSection?.classList.add('hidden');
    menuButtons.forEach(btn => {
      btn.classList.remove('start-journey-exit');
    });
    
    DOM.startJourneySection?.classList.remove('hidden');
    if (DOM.startJourneyBtn) {
      DOM.startJourneyBtn.style.opacity = '0';
      DOM.startJourneyBtn.style.transform = 'scale(0.3) translateY(40px)';
      
      setTimeout(() => {
        DOM.startJourneyBtn.classList.add('main-menu-enter');
        setTimeout(() => {
          DOM.startJourneyBtn.classList.remove('main-menu-enter');
          DOM.startJourneyBtn.style.opacity = '';
          DOM.startJourneyBtn.style.transform = '';
        }, 600);
      }, 50);
    }
    
    setTitleStarfieldVisible(true);
    if (DOM.titleStarfieldCanvas) {
      DOM.titleStarfieldCanvas.style.opacity = '1';
      DOM.titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-in';
    }
    stopLevelMusic();
    ensureAudio();
    startBackgroundMusic();
    
    setTimeout(() => {
      setupGamepadNavigation('title');
      setTimeout(() => {
        setupGamepadNavigation('title');
      }, 300);
    }, 700);
  }, 600);
});

// Back to Title Button (von Level Select)
DOM.backToTitleBtn?.addEventListener('click', () => {
  ensureAudio();
  
  const wasGameMenuVisible = DOM.mainMenuButtons && DOM.mainMenuButtons.style.display === 'none';
  
  const buttons = DOM.levelList?.querySelectorAll('.btn') || [];
  buttons.forEach((btn) => {
    btn.classList.add('start-journey-exit');
  });
  
  DOM.backToTitleBtn?.classList.add('start-journey-exit');
  
  setTimeout(() => {
    if (DOM.levelSelectContent) {
      DOM.levelSelectContent.style.display = 'none';
    }
    
    DOM.backToTitleBtn?.classList.remove('start-journey-exit');
    
    if (wasGameMenuVisible) {
      showGameMenu(dependencies);
    } else {
      if (DOM.mainMenuCard) {
        DOM.mainMenuCard.classList.remove('card-expanding');
        requestAnimationFrame(() => {
          DOM.mainMenuCard.style.width = 'min(500px, 92vw)';
          setTimeout(() => {
            DOM.mainMenuCard.style.width = '';
          }, 600);
        });
      }
      
      if (DOM.mainMenuButtons) {
        DOM.mainMenuButtons.style.display = 'flex';
        DOM.mainMenuButtons.style.flexDirection = 'column';
        DOM.mainMenuButtons.style.gap = '16px';
        
        const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
        menuButtons.forEach((btn, index) => {
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.9) translateY(10px)';
          btn.classList.remove('start-journey-exit');
          
          setTimeout(() => {
            btn.classList.add('level-button-enter');
            if (index === 1) btn.classList.add('level-button-enter-delay-1');
            if (index === 2) btn.classList.add('level-button-enter-delay-2');
            if (index === 3) btn.classList.add('level-button-enter-delay-2');
            
            setTimeout(() => {
              btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
              btn.style.opacity = '';
              btn.style.transform = '';
            }, 500);
          }, 50 + (index * 100));
        });
      }
      
      setTimeout(() => {
        setupGamepadNavigation('title');
      }, 1000);
    }
  }, 600);
});

// Level Select Menu Button
DOM.levelSelectMenuBtn?.addEventListener('click', () => {
  ensureAudio();
  transitionToLevelSelect(dependencies);
});

// Shop Button
DOM.shopBtn?.addEventListener('click', () => {
  ensureAudio();
  showShop(dependencies);
});

// Game Menu Back Button
DOM.gameMenuBackBtn?.addEventListener('click', () => {
  ensureAudio();
  
  if (DOM.gameMenuContent) {
    const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
    gameMenuButtons.forEach((btn) => {
      btn.classList.add('start-journey-exit');
    });
    
    setTimeout(() => {
      DOM.gameMenuContent.style.display = 'none';
      gameMenuButtons.forEach(btn => {
        btn.classList.remove('start-journey-exit');
      });
      
      if (DOM.mainMenuButtons) {
        DOM.mainMenuButtons.style.display = 'flex';
        DOM.mainMenuButtons.style.flexDirection = 'column';
        DOM.mainMenuButtons.style.gap = '16px';
        
        const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
        menuButtons.forEach((btn, index) => {
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.9) translateY(10px)';
          btn.classList.remove('start-journey-exit');
          
          setTimeout(() => {
            btn.classList.add('level-button-enter');
            if (index === 1) btn.classList.add('level-button-enter-delay-1');
            if (index === 2) btn.classList.add('level-button-enter-delay-2');
            if (index === 3) btn.classList.add('level-button-enter-delay-2');
            
            setTimeout(() => {
              btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
              btn.style.opacity = '';
              btn.style.transform = '';
            }, 500);
          }, 200 + (index * 100));
        });
      }
      
      setTimeout(() => {
        setupGamepadNavigation('title');
      }, 1000);
    }, 300);
  }
});

// Shop Back Button
DOM.shopBackBtn?.addEventListener('click', () => {
  ensureAudio();
  
  if (DOM.shopContent) {
    DOM.shopContent.classList.add('start-journey-exit');
    setTimeout(() => {
      DOM.shopContent.style.display = 'none';
      DOM.shopContent.classList.remove('start-journey-exit');
      
      if (DOM.gameMenuContent) {
        const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
        gameMenuButtons.forEach((btn) => {
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.9) translateY(10px)';
        });
        
        DOM.gameMenuContent.style.display = 'block';
        
        gameMenuButtons.forEach((btn, index) => {
          setTimeout(() => {
            btn.classList.add('level-button-enter');
            if (index === 1) btn.classList.add('level-button-enter-delay-1');
            if (index === 2) btn.classList.add('level-button-enter-delay-2');
            
            setTimeout(() => {
              btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
              btn.style.opacity = '';
              btn.style.transform = '';
            }, 500);
          }, 200 + (index * 100));
        });
      }
      
      if (DOM.levelSelectContent) DOM.levelSelectContent.style.display = 'none';
      if (DOM.settingsContent) DOM.settingsContent.style.display = 'none';
      
      setTimeout(() => {
        setupGamepadNavigation('gameMenu');
      }, 1000);
    }, 300);
  }
});

// Confirm New Game Button
DOM.confirmNewGameBtn?.addEventListener('click', () => {
  ensureAudio();
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  resetLocalStorage();
  upgradeSystem.reset();
  game.unlockedLevels = [1];
  showGameMenu(dependencies);
});

// Cancel New Game Button
DOM.cancelNewGameBtn?.addEventListener('click', () => {
  ensureAudio();
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  setTimeout(() => {
    setupGamepadNavigation('title');
  }, 100);
});

// Next Level Button
DOM.nextLevelBtn?.addEventListener('click', () => {
  if (game.currentLevel < 5) {
    startLevel(game.currentLevel + 1, {
      game,
      upgradeSystem,
      gamepad,
      DOM,
      hardMode,
      setLevelCompleteDelayStarted,
      setLevelCompleteTime
    });
  } else {
    showScreen('gameComplete', dependencies);
  }
});

// Back to Level Select Buttons
DOM.backToLevelSelectBtn?.addEventListener('click', () => {
  showScreen('levelSelect', dependencies);
});

DOM.backToLevelSelectFromCompleteBtn?.addEventListener('click', () => {
  showScreen('levelSelect', dependencies);
});

// Pause Menu Buttons
DOM.resumeBtn?.addEventListener('click', () => {
  hidePauseMenu(dependencies);
});

DOM.pauseToLevelSelectBtn?.addEventListener('click', () => {
  game.state = 'menu';
  game.paused = false;
  DOM.overlay?.classList.add('hidden');
  DOM.pauseMenu?.classList.add('hidden');
  transitionToLevelSelect(dependencies);
});

// Enter key handling for title screen
document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && game.state === 'title' && !DOM.overlay?.classList.contains('hidden')) {
    if (DOM.startJourneySection?.classList.contains('hidden')) {
      return;
    } else {
      e.preventDefault();
      DOM.startJourneyBtn?.click();
    }
  }
}, {passive:false});

// Initialize Game
game.state = 'title';
showScreen('title', dependencies);

setTimeout(() => {
  setupGamepadNavigation('title');
}, 200);

loadSettings(DOM);

ensureAudio();
startBackgroundMusic();

// Autoplay-Policy Workaround
let musicStartedByUser = false;
function startMusicOnFirstInteraction() {
  if (!musicStartedByUser) {
    musicStartedByUser = true;
    ensureAudio();
    startBackgroundMusic();
    document.removeEventListener('click', startMusicOnFirstInteraction);
    document.removeEventListener('keydown', startMusicOnFirstInteraction);
  }
}

document.addEventListener('click', startMusicOnFirstInteraction, { once: true });
document.addEventListener('keydown', startMusicOnFirstInteraction, { once: true });

// Shop initialisieren
shop.init();

// Dev Mode initialisieren
initDevMode(game, () => {
  resetLocalStorage();
  upgradeSystem.reset();
  game.unlockedLevels = [1];
}, upgradeSystem);

// Game Loop starten
const gameLoop = initGameLoop(dependencies);
requestAnimationFrame(gameLoop);
