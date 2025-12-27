/**
 * Menu Manager
 * Verwaltet Menü-Funktionen (showGameMenu, showShop, transitionToLevelSelect, etc.)
 */

import { animateButtonsExit, animateButtonsEnter, animateContentEnter, animateContentExit } from './MenuAnimations.js';
import { renderLevelSelect } from './LevelSelectRenderer.js';
import { showScreen } from './ScreenManager.js';

/**
 * Berechnet und setzt die maximale Breite des Hangar-Layouts basierend auf der tatsächlichen Bildgröße
 */
export function updateHangarLayoutWidth() {
  const titleScreenBg = document.querySelector('.title-screen-bg');
  const shopContent = document.getElementById('shopContent');
  const hangarLayout = document.getElementById('hangarLayout');
  
  // Nur aktualisieren, wenn der Shop sichtbar ist
  if (!shopContent || shopContent.style.display === 'none' || !hangarLayout || !titleScreenBg) {
    return;
  }
  
  const bgImage = window.getComputedStyle(titleScreenBg).backgroundImage;
  if (!bgImage || !bgImage.includes('hangar.png')) {
    return;
  }
  
  const img = new Image();
  img.onload = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const imageAspectRatio = img.width / img.height; // 1536 / 1024 = 1.5
    
    // Berechne die tatsächliche gerenderte Breite mit contain
    let renderedWidth;
    if (viewportWidth / viewportHeight > imageAspectRatio) {
      // Viewport ist breiter - Bild wird an der Höhe skaliert
      renderedWidth = viewportHeight * imageAspectRatio;
    } else {
      // Viewport ist schmaler - Bild wird an der Breite skaliert
      renderedWidth = viewportWidth;
    }
    
    // Setze max-width auf den Grid-Container
    hangarLayout.style.maxWidth = `${renderedWidth}px`;
  };
  img.src = '/hangar.png';
}

/**
 * Zeigt das Game Menu an
 * @param {Object} dependencies - Abhängigkeiten (DOM, setupGamepadNavigation)
 */
export function showGameMenu(dependencies) {
  const { DOM, setupGamepadNavigation } = dependencies;
  
  // Hintergrundbild zurück zum Titelbild wechseln
  const titleScreenBg = document.querySelector('.title-screen-bg');
  if (titleScreenBg) {
    titleScreenBg.style.backgroundImage = "url('/hayspace-cover.png')";
    titleScreenBg.style.backgroundSize = 'contain'; // Zurück zu contain für Titelbild
    titleScreenBg.style.backgroundPosition = 'center';
  }
  
  // Starfield wieder einblenden (für Titelbildschirm)
  if (DOM.titleStarfieldCanvas) {
    DOM.titleStarfieldCanvas.style.opacity = '1';
  }
  
  DOM.titleScreen?.classList.remove('hidden');
  DOM.mainMenuSection?.classList.remove('hidden');
  DOM.startJourneySection?.classList.add('hidden');
  
  // Andere Contents verstecken (sofort, ohne Animation)
  if (DOM.levelSelectContent) DOM.levelSelectContent.style.display = 'none';
  if (DOM.settingsContent) DOM.settingsContent.style.display = 'none';
  if (DOM.shopContent) DOM.shopContent.style.display = 'none';
  
  // Karte auf Standard-Größe setzen
  if (DOM.mainMenuCard) {
    DOM.mainMenuCard.style.width = 'min(500px, 92vw)';
    DOM.mainMenuCard.style.maxWidth = '500px';
  }
  
  // Hauptmenü-Buttons ausblenden mit Animation (nur wenn sichtbar)
  if (DOM.mainMenuButtons && DOM.mainMenuButtons.style.display !== 'none') {
    const menuButtons = [DOM.newGameBtn, DOM.continueBtn, DOM.settingsBtn, DOM.backToTitleFromMainBtn].filter(Boolean);
    
    animateButtonsExit(menuButtons, () => {
      DOM.mainMenuButtons.style.display = 'none';
      
      // ERST JETZT die neue Seite einblenden (nach dem Ausblenden)
      if (DOM.gameMenuContent) {
        const wasVisible = DOM.gameMenuContent.style.display !== 'none';
        
        if (!wasVisible) {
          const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
          
          // Buttons zuerst auf opacity: 0 setzen, BEVOR der Content eingeblendet wird
          gameMenuButtons.forEach((btn) => {
            btn.style.opacity = '0';
            btn.style.transform = 'scale(0.9) translateY(10px)';
          });
          
          // Jetzt den Content einblenden
          DOM.gameMenuContent.style.display = 'block';
          
          // Animation starten
          animateButtonsEnter(gameMenuButtons, {
            startDelay: 200,
            staggerDelay: 100,
            onComplete: () => {
              setTimeout(() => {
                setupGamepadNavigation('gameMenu');
              }, 500);
            }
          });
        } else {
          // Bereits sichtbar, einfach anzeigen
          DOM.gameMenuContent.style.display = 'block';
          setTimeout(() => {
            setupGamepadNavigation('gameMenu');
          }, 100);
        }
      }
    }, 300);
  } else {
    // Buttons sind bereits versteckt, neue Seite sofort einblenden
    if (DOM.mainMenuButtons) {
      DOM.mainMenuButtons.style.display = 'none';
    }
    
    if (DOM.gameMenuContent) {
      const wasVisible = DOM.gameMenuContent.style.display !== 'none';
      
      if (!wasVisible) {
        const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
        
        gameMenuButtons.forEach((btn) => {
          btn.style.opacity = '0';
          btn.style.transform = 'scale(0.9) translateY(10px)';
        });
        
        DOM.gameMenuContent.style.display = 'block';
        
        animateButtonsEnter(gameMenuButtons, {
          startDelay: 200,
          staggerDelay: 100,
          onComplete: () => {
            setTimeout(() => {
              setupGamepadNavigation('gameMenu');
            }, 500);
          }
        });
      } else {
        DOM.gameMenuContent.style.display = 'block';
        setTimeout(() => {
          setupGamepadNavigation('gameMenu');
        }, 100);
      }
    }
  }
}

/**
 * Zeigt den Shop/Hangar an
 * @param {Object} dependencies - Abhängigkeiten (DOM, shop, setupGamepadNavigation)
 */
export function showShop(dependencies) {
  const { DOM, shop, setupGamepadNavigation } = dependencies;
  
  // Hintergrundbild zu Hangar wechseln
  const titleScreenBg = document.querySelector('.title-screen-bg');
  if (titleScreenBg) {
    titleScreenBg.style.backgroundImage = "url('/hangar.png')";
    titleScreenBg.style.backgroundSize = 'contain'; // Originalformat wie beim Titelbild
    titleScreenBg.style.backgroundPosition = 'center';
  }
  
  // Starfield ausblenden (nicht im Hangar)
  if (DOM.titleStarfieldCanvas) {
    DOM.titleStarfieldCanvas.style.opacity = '0';
  }
  
  // Karte ausblenden (damit Hangar den vollen Bildschirm nutzen kann)
  if (DOM.mainMenuCard) {
    DOM.mainMenuCard.style.display = 'none';
  }
  
  // Game Menu Buttons ausblenden mit Animation
  if (DOM.gameMenuContent) {
    const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
    
    animateButtonsExit(gameMenuButtons, () => {
      DOM.gameMenuContent.style.display = 'none';
      
      // Shop Content einblenden mit Animation
      if (DOM.shopContent) {
        DOM.shopContent.style.display = 'block';
        
        // Maximale Breite des Grid-Containers basierend auf der tatsächlichen Bildgröße setzen
        setTimeout(() => {
          updateHangarLayoutWidth();
        }, 100);
        
        // Kurze Verzögerung, damit DOM aktualisiert ist
        requestAnimationFrame(() => {
          // Shop rendern NACH dem Einblenden
          if (shop) {
            shop.render();
          }
        });
        
        animateContentEnter(DOM.shopContent, {
          delay: 300,
          onComplete: () => {
            setTimeout(() => {
              setupGamepadNavigation('shop');
            }, 500);
          }
        });
      }
    }, 300);
  } else {
    // Game Menu bereits versteckt
    if (DOM.shopContent) {
      DOM.shopContent.style.display = 'block';
      
      // Maximale Breite des Grid-Containers basierend auf der tatsächlichen Bildgröße setzen
      setTimeout(() => {
        updateHangarLayoutWidth();
      }, 100);
      
      // Kurze Verzögerung, damit DOM aktualisiert ist
      requestAnimationFrame(() => {
        // Shop rendern NACH dem Einblenden
        if (shop) {
          shop.render();
        }
      });
      
      animateContentEnter(DOM.shopContent, {
        delay: 200,
        onComplete: () => {
          setTimeout(() => {
            setupGamepadNavigation('shop');
          }, 500);
        }
      });
    }
  }
}

/**
 * Übergang zur Level-Auswahl
 * @param {Object} dependencies - Abhängigkeiten (DOM, game, setupGamepadNavigation, onLevelClick, showScreen)
 */
export function transitionToLevelSelect(dependencies) {
  const { DOM, game, setupGamepadNavigation, onLevelClick, showScreen } = dependencies;
  
  // Sicherstellen, dass titleScreen und mainMenuSection sichtbar sind
  DOM.titleScreen?.classList.remove('hidden');
  DOM.mainMenuSection?.classList.remove('hidden');
  DOM.startJourneySection?.classList.add('hidden');
  
  // Game Menu Content ausblenden mit Animation
  if (DOM.gameMenuContent) {
    const gameMenuButtons = [DOM.levelSelectMenuBtn, DOM.shopBtn, DOM.gameMenuBackBtn].filter(Boolean);
    
    animateButtonsExit(gameMenuButtons, () => {
      DOM.gameMenuContent.style.display = 'none';
      
      if (DOM.shopContent) {
        DOM.shopContent.style.display = 'none';
      }
      
      // Karte auf Hauptmenü-Größe setzen
      if (DOM.mainMenuCard) {
        DOM.mainMenuCard.style.width = 'min(500px, 92vw)';
        DOM.mainMenuCard.style.maxWidth = '500px';
      }
      
      // Levelauswahl rendern BEVOR der Content eingeblendet wird
      renderLevelSelect(game, onLevelClick, DOM.levelList, setupGamepadNavigation);
      
      // Levelauswahl-Content einblenden mit Animation (nach Game Menu ausblenden)
      setTimeout(() => {
        if (DOM.levelSelectContent) {
          DOM.levelSelectContent.style.display = 'block';
        }
        
        // Levelauswahl-Screen anzeigen
        showScreen('levelSelect', dependencies);
        
        // Karte vergrößern mit Animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (DOM.mainMenuCard) {
              DOM.mainMenuCard.classList.add('card-expanding');
              setTimeout(() => {
                DOM.mainMenuCard.classList.remove('card-expanding');
                DOM.mainMenuCard.style.width = '';
                DOM.mainMenuCard.style.maxWidth = '';
              }, 600);
            }
          });
        });
      }, 300);
    }, 300);
  } else {
    // Game Menu bereits versteckt
    if (DOM.shopContent) {
      DOM.shopContent.style.display = 'none';
    }
    
    if (DOM.mainMenuCard) {
      DOM.mainMenuCard.style.width = 'min(500px, 92vw)';
      DOM.mainMenuCard.style.maxWidth = '500px';
    }
    
    renderLevelSelect(game, onLevelClick, DOM.levelList, setupGamepadNavigation);
    
    setTimeout(() => {
      if (DOM.levelSelectContent) {
        DOM.levelSelectContent.style.display = 'block';
      }
      
      showScreen('levelSelect', dependencies);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (DOM.mainMenuCard) {
            DOM.mainMenuCard.classList.add('card-expanding');
            setTimeout(() => {
              DOM.mainMenuCard.classList.remove('card-expanding');
              DOM.mainMenuCard.style.width = '';
              DOM.mainMenuCard.style.maxWidth = '';
            }, 600);
          }
        });
      });
    }, 200);
  }
}

/**
 * Zeigt das Pause-Menü an
 * @param {Object} dependencies - Abhängigkeiten (game, DOM, showScreen, setupGamepadNavigation)
 */
export function showPauseMenu(dependencies) {
  const { game, DOM, showScreen, setupGamepadNavigation } = dependencies;
  
  if (game.state === 'play') {
    game.paused = true;
    showScreen('pause', dependencies);
    DOM.overlay?.classList.remove('hidden');
    setTimeout(() => {
      setupGamepadNavigation('pause');
    }, 100);
  }
}

/**
 * Versteckt das Pause-Menü
 * @param {Object} dependencies - Abhängigkeiten (game, DOM, gamepad)
 */
export function hidePauseMenu(dependencies) {
  const { game, DOM, gamepad } = dependencies;
  
  if (game.state === 'play' && game.paused) {
    game.paused = false;
    DOM.pauseMenu?.classList.add('hidden');
    DOM.overlay?.classList.add('hidden');
    gamepad.disableMenuNavigation();
  }
}

/**
 * Startet das Spiel neu
 * @param {Object} dependencies - Abhängigkeiten (game, hardMode)
 */
export function restart(dependencies) {
  const { game, hardMode } = dependencies;
  
  if (game.state !== 'play') return;
  game.resetAll();
  game.state = 'play';
  game.hardMode = hardMode;
  game.spawnWave(game.wave);
}

