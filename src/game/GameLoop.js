/**
 * Game Loop
 * Hauptspielschleife mit Fixed Timestep
 */

import { rand } from '../utils/math.js';
import { render } from '../render/GameRenderer.js';
import { drawHUD, drawScoreOverlay } from '../ui/HUD.js';
import { ensureAudio } from '../systems/AudioSystem.js';
import { showScreen } from '../ui/ScreenManager.js';
import { updateTitleStarfield } from '../ui/TitleStarfield.js';

let last = performance.now();
let accumulator = 0;
const targetFPS = 60;
const fixedDT = 1.0 / targetFPS;

/**
 * Initialisiert die Game Loop
 * @param {Object} dependencies - Abhängigkeiten (game, keys, gamepad, upgradeSystem, DOM, etc.)
 * @returns {Function} gameLoop Funktion
 */
export function initGameLoop(dependencies) {
  const {
    game,
    keys,
    gamepad,
    upgradeSystem,
    DOM,
    setupGamepadNavigation,
    handleGamepadBack,
    setLevelCompleteDelayStarted,
    setLevelCompleteTime,
    getLevelCompleteDelayStarted,
    getLevelCompleteTime
  } = dependencies;
  
  let gamepadNavigationCheckTime = 0;
  
  function gameLoop() {
    const realDT = Math.min(0.033, (performance.now() - last) / 1000);
    last = performance.now();
    accumulator += realDT;

    // Gamepad-Inputs aktualisieren
    gamepad.update(realDT);

    // Menü-Navigation mit Gamepad (immer prüfen, nicht nur wenn paused)
    // Nur wenn nicht im Spiel oder pausiert
    if (game.state !== 'play' || game.paused) {
      const nav = gamepad.handleMenuNavigation(realDT);
      if (nav) {
        if (nav.action === 'confirm' && nav.button) {
          // Button klicken
          ensureAudio();
          nav.button.click();
        } else if (nav.action === 'back') {
          handleGamepadBack();
        }
      }
      
      // Prüfe regelmäßig, ob Navigation aktualisiert werden muss (alle 0.5 Sekunden)
      if (!gamepadNavigationCheckTime || (performance.now() - gamepadNavigationCheckTime) > 500) {
        gamepadNavigationCheckTime = performance.now();
        // Prüfe aktuellen Screen und aktiviere Navigation falls nötig
        if (gamepad.isConnected() && !gamepad.menuNavigation.enabled) {
          // Navigation ist deaktiviert, aber wir sind in einem Menü - reaktiviere
          if (game.state === 'title' || game.state === 'levelSelect' || 
              (game.state === 'play' && game.paused) || 
              game.state === 'levelComplete' || game.state === 'gameComplete') {
            // Bestimme den richtigen Screen-Namen
            let screenName = game.state;
            if (game.state === 'play' && game.paused) {
              screenName = 'pause';
            }
            setupGamepadNavigation(screenName);
          }
        }
      }
    }

    while (accumulator >= fixedDT) {
      const dt = fixedDT;
      accumulator -= fixedDT;

      // Gamepad Pause-Handling
      if (gamepad.isPausePressed() && game.state === 'play') {
        if (game.paused) {
          // Spiel fortsetzen - Menü verstecken
          game.paused = false;
          DOM.pauseMenu?.classList.add('hidden');
          DOM.overlay?.classList.add('hidden');
          gamepad.disableMenuNavigation();
        } else {
          // Spiel pausieren - Menü anzeigen
          game.paused = true;
          showScreen('pause', dependencies);
          DOM.overlay?.classList.remove('hidden');
          // Gamepad-Navigation für Pausenmenü aktivieren (mit mehreren Delays für Sicherheit)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setupGamepadNavigation('pause');
              // Zusätzlicher Fallback nach weiteren 200ms
              setTimeout(() => {
                setupGamepadNavigation('pause');
              }, 200);
              // Noch ein Fallback nach weiteren 300ms
              setTimeout(() => {
                setupGamepadNavigation('pause');
              }, 500);
            });
          });
        }
      }

      if (game.state === 'play' && !game.paused) {
        game.update(dt, keys, gamepad);
        
        // Prüfen, ob Boss besiegt wurde
        if (game.bossDefeated && !getLevelCompleteDelayStarted()) {
          // Delay-Timer starten, wenn Boss besiegt wurde
          setLevelCompleteDelayStarted(true);
          setLevelCompleteTime(performance.now());
        }
        
        // Prüfen, ob Spieler tot ist
        if (game.state === 'dead') {
          DOM.overlay?.classList.remove('hidden');
          const titleH1 = DOM.titleScreen?.querySelector('h1');
          if (titleH1) {
            titleH1.textContent = 'GAME OVER';
          }
          showScreen('title', dependencies);
        }
      }
      
      // Level-Complete-Delay-Logik außerhalb der Play-State-Bedingung,
      // damit sie in jedem Frame geprüft wird
      if (game.bossDefeated && getLevelCompleteDelayStarted()) {
        // 2 Sekunden warten, bevor das Menü angezeigt wird
        if (performance.now() - getLevelCompleteTime() >= 2000) {
          // State auf levelComplete setzen und Menü anzeigen
          game.state = 'levelComplete';
          if (game.currentLevel === 5) {
            showScreen('gameComplete', dependencies);
          } else {
            if (DOM.levelCompleteTitle) {
              DOM.levelCompleteTitle.textContent = `LEVEL ${game.currentLevel} COMPLETE!`;
            }
            if (DOM.levelCompleteText) {
              DOM.levelCompleteText.textContent = 'Congratulations! You have successfully completed the level.';
            }
            if (DOM.nextLevelBtn) {
              DOM.nextLevelBtn.style.display = 'block';
            }
            // Stelle sicher, dass backToLevelSelectBtn auch sichtbar ist
            if (DOM.backToLevelSelectBtn) {
              DOM.backToLevelSelectBtn.style.display = 'block';
            }
            showScreen('levelComplete', dependencies);
            // Gamepad-Navigation für Level Complete aktivieren (mit mehreren Delays für Sicherheit)
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setupGamepadNavigation('levelComplete');
                // Zusätzlicher Fallback nach weiteren 200ms
                setTimeout(() => {
                  setupGamepadNavigation('levelComplete');
                }, 200);
                // Noch ein Fallback nach weiteren 300ms
                setTimeout(() => {
                  setupGamepadNavigation('levelComplete');
                }, 500);
              });
            });
          }
          // Reset für nächstes Level
          setLevelCompleteDelayStarted(false);
          game.bossDefeated = false;
        }
      }
    }

    // Rendering
    let sx = 0, sy = 0;
    if (game.shake > 0) {
      sx = rand(-game.shake, game.shake);
      sy = rand(-game.shake, game.shake);
    }

    DOM.ctx.save();
    DOM.ctx.translate(sx, sy);
    render(DOM.ctx, game);
    drawHUD(DOM.ctx, game);
    DOM.ctx.restore();
    
    // Credits/Wave Overlay oben rechts (außerhalb des Shake-Transforms)
    drawScoreOverlay(DOM.ctx, game, upgradeSystem);
    
    // Title Starfield aktualisieren
    updateTitleStarfield(realDT);

    requestAnimationFrame(gameLoop);
  }
  
  return gameLoop;
}

/**
 * Setzt die Game Loop zurück
 */
export function resetGameLoop() {
  last = performance.now();
  accumulator = 0;
}


