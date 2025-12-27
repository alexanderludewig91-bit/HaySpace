/**
 * Screen Manager
 * Verwaltet die Anzeige verschiedener Screens
 */

import { stopLevelMusic, startBackgroundMusic, ensureAudio } from '../systems/AudioSystem.js';
import { setTitleStarfieldVisible } from './TitleStarfield.js';
import { renderLevelSelect } from './LevelSelectRenderer.js';

/**
 * Zeigt einen bestimmten Screen an
 * @param {string} screenName - Name des Screens
 * @param {Object} dependencies - Abhängigkeiten (DOM, game, setupGamepadNavigation, etc.)
 */
export function showScreen(screenName, dependencies) {
  const {
    DOM,
    game,
    setupGamepadNavigation,
    onLevelClick
  } = dependencies;
  
  // titleScreen wird nicht versteckt, wenn levelSelect angezeigt wird (gleiche Karte)
  if (screenName !== 'levelSelect' && screenName !== 'title') {
    DOM.titleScreen?.classList.add('hidden');
  }
  // levelSelect wird nur versteckt, wenn es nicht angezeigt werden soll
  if (screenName !== 'levelSelect') {
    DOM.levelSelect?.classList.add('hidden');
  }
  DOM.levelComplete?.classList.add('hidden');
  DOM.gameComplete?.classList.add('hidden');
  DOM.pauseMenu?.classList.add('hidden');
  const newGameWarningContainer = document.getElementById('newGameWarningContainer');
  if (newGameWarningContainer) {
    newGameWarningContainer.classList.add('hidden');
  }
  // devModePanel wird NICHT hier versteckt, da es ein Overlay ist, das unabhängig funktioniert
  
  if (screenName === 'title') {
    DOM.titleScreen?.classList.remove('hidden');
    DOM.startJourneySection?.classList.remove('hidden');
    DOM.mainMenuSection?.classList.add('hidden');
    // Levelauswahl-Content verstecken, Hauptmenü-Buttons wieder anzeigen
    if (DOM.levelSelectContent) {
      DOM.levelSelectContent.style.display = 'none';
    }
    // Settings-Content verstecken
    if (DOM.settingsContent) {
      DOM.settingsContent.style.display = 'none';
    }
    if (DOM.mainMenuButtons) {
      DOM.mainMenuButtons.style.display = 'flex';
      DOM.mainMenuButtons.style.flexDirection = 'column';
      DOM.mainMenuButtons.style.gap = '16px';
    }
    // Sterne wieder anzeigen, wenn zum Titelbildschirm zurückgekehrt wird
    setTitleStarfieldVisible(true);
    if (DOM.titleStarfieldCanvas) {
      DOM.titleStarfieldCanvas.style.opacity = '1';
      DOM.titleStarfieldCanvas.style.transition = 'opacity 0.6s ease-in';
    }
    // Level-Musik stoppen und Titelmusik starten
    stopLevelMusic();
    ensureAudio();
    startBackgroundMusic();
  }
  else if (screenName === 'levelSelect') {
    // titleScreen bleibt sichtbar (gleiche Karte)
    DOM.titleScreen?.classList.remove('hidden');
    // startJourneySection verstecken
    DOM.startJourneySection?.classList.add('hidden');
    // Hauptmenü-Section muss sichtbar bleiben, da die Karte dort ist
    DOM.mainMenuSection?.classList.remove('hidden');
    // levelSelect-Screen wird nicht benötigt, da alles in titleScreen ist
    // levelSelect bleibt versteckt, da die Karte in titleScreen ist
    // Hauptmenü-Buttons ausblenden
    if (DOM.mainMenuButtons) {
      DOM.mainMenuButtons.style.display = 'none';
    }
    // Levelauswahl-Content einblenden
    if (DOM.levelSelectContent) {
      DOM.levelSelectContent.style.display = 'block';
      // Sanfte Animation für Levelauswahl-Buttons
      renderLevelSelect(game, onLevelClick, DOM.levelList, setupGamepadNavigation);
      // Gamepad-Navigation nach dem Rendern aktivieren
      setTimeout(() => {
        setupGamepadNavigation('levelSelect');
      }, 600); // Nach Animation
    }
  }
  else if (screenName === 'levelComplete') {
    DOM.levelComplete?.classList.remove('hidden');
    // Hauptmenü verstecken, wenn Level Complete angezeigt wird
    if (DOM.mainMenuSection) {
      DOM.mainMenuSection.classList.add('hidden');
    }
  }
  else if (screenName === 'gameComplete') {
    DOM.gameComplete?.classList.remove('hidden');
  }
  else if (screenName === 'pause') {
    DOM.pauseMenu?.classList.remove('hidden');
  }
  else if (screenName === 'settings') {
    // titleScreen bleibt sichtbar (gleiche Karte)
    DOM.titleScreen?.classList.remove('hidden');
    // startJourneySection verstecken
    DOM.startJourneySection?.classList.add('hidden');
    // Hauptmenü-Section muss sichtbar bleiben, da die Karte dort ist
    DOM.mainMenuSection?.classList.remove('hidden');
    // Hauptmenü-Buttons ausblenden
    if (DOM.mainMenuButtons) {
      DOM.mainMenuButtons.style.display = 'none';
    }
    // Levelauswahl-Content verstecken, falls sichtbar
    if (DOM.levelSelectContent) {
      DOM.levelSelectContent.style.display = 'none';
    }
    // Settings-Content einblenden
    if (DOM.settingsContent) {
      DOM.settingsContent.style.display = 'block';
    }
  }
  else if (screenName === 'newGameWarning') {
    // Titelbildschirm sichtbar lassen, damit das Menü im Hintergrund bleibt
    DOM.titleScreen?.classList.remove('hidden');
    // Hauptmenü-Section sichtbar lassen
    DOM.mainMenuSection?.classList.remove('hidden');
    // Warnmeldung-Container anzeigen (enthält Overlay und Warnmeldung)
    const newGameWarningContainer = document.getElementById('newGameWarningContainer');
    if (newGameWarningContainer) {
      newGameWarningContainer.classList.remove('hidden');
    }
  }
  // devMode wird nicht über showScreen gehandhabt, da es ein Overlay ist
  
  if (screenName !== 'pause') {
    DOM.overlay?.classList.remove('hidden');
  }
  
  // Gamepad-Navigation für den Screen aktivieren
  setTimeout(() => {
    setupGamepadNavigation(screenName);
  }, 100); // Kurze Verzögerung, damit DOM aktualisiert ist
}

