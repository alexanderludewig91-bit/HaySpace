/**
 * Level Manager
 * Verwaltet Level-Start und -Initialisierung
 */

import { ensureAudio, startLevelMusic } from '../systems/AudioSystem.js';

/**
 * Startet ein Level
 * @param {number} level - Level-Nummer
 * @param {Object} dependencies - Abhängigkeiten (game, upgradeSystem, gamepad, DOM, hardMode, etc.)
 */
export function startLevel(level, dependencies) {
  const {
    game,
    upgradeSystem,
    gamepad,
    DOM,
    hardMode,
    setLevelCompleteDelayStarted,
    setLevelCompleteTime
  } = dependencies;
  
  console.log('🚀 startLevel() aufgerufen für Level', level);
  console.log('🔍 Game.upgradeSystem vorhanden?', !!game.upgradeSystem);
  console.log('🔍 upgradeSystem (global) vorhanden?', !!upgradeSystem);
  
  ensureAudio();
  // Level-Musik starten
  startLevelMusic(level);
  game.setLevel(level);
  console.log('📋 resetAll() wird aufgerufen...');
  game.resetAll();
  console.log('📋 resetAll() abgeschlossen');
  console.log('📋 Nach resetAll - weaponLevel:', game.player.weaponLevel);
  console.log('📋 Nach resetAll - speedBoost:', game.player.speedBoost);
  
  // Upgrades anwenden
  console.log('🔧 Upgrades werden angewendet...');
  if (game.upgradeSystem) {
    const upgradeValues = game.upgradeSystem.getGameValues();
    console.log('🔧 Upgrade-Werte:', upgradeValues);
    
    // Waffen-Level anwenden
    const oldWeaponLevel = game.player.weaponLevel;
    game.player.weaponLevel = upgradeValues.weaponLevel || 1;
    console.log(`🔫 Waffen-Level: ${oldWeaponLevel} → ${game.player.weaponLevel}`);
    
    // Speed Boost anwenden
    const oldSpeedBoost = game.player.speedBoost;
    game.player.speedBoost = upgradeValues.speedBoost || 1.0;
    console.log(`⚡ Speed Boost: ${oldSpeedBoost} → ${game.player.speedBoost}`);
    
    // Shield Max anwenden
    const oldShieldMax = game.player.shieldMax;
    game.player.shieldMax = upgradeValues.shieldMax || 100;
    const shieldRatio = game.player.shield / oldShieldMax;
    game.player.shield = game.player.shieldMax * shieldRatio;
    console.log(`🛡️ Shield Max: ${oldShieldMax} → ${game.player.shieldMax}`);
    
    // Dash-Enabled
    game.dashEnabled = upgradeValues.dashEnabled !== false;
    console.log(`💨 Dash: ${game.dashEnabled}`);
    
    // Overheat-Reduktion
    game.overheatReduction = upgradeValues.overheatReduction || 0;
    console.log(`❄️ Overheat-Reduktion: ${game.overheatReduction}`);
  } else {
    console.warn('⚠️ UpgradeSystem nicht verfügbar!');
  }
  
  console.log('🔧 Nach Anwendung - weaponLevel:', game.player.weaponLevel);
  console.log('🔧 Nach Anwendung - speedBoost:', game.player.speedBoost);
  console.log('🔧 Nach Anwendung - shieldMax:', game.player.shieldMax);
  
  game.state = 'play';
  game.paused = false;
  game.hardMode = hardMode;
  DOM.overlay?.classList.add('hidden');
  // Gamepad-Navigation deaktivieren (Spiel läuft)
  gamepad.disableMenuNavigation();
  // Alle Screens verstecken, damit Canvas wieder sichtbar wird
  DOM.titleScreen?.classList.add('hidden');
  DOM.levelSelect?.classList.add('hidden');
  // Levelauswahl-Content verstecken
  if (DOM.levelSelectContent) {
    DOM.levelSelectContent.style.display = 'none';
  }
  // Hauptmenü-Buttons verstecken
  if (DOM.mainMenuButtons) {
    DOM.mainMenuButtons.style.display = 'none';
  }
  // Delay-Variablen zurücksetzen
  setLevelCompleteDelayStarted(false);
  setLevelCompleteTime(0);
  game.bossDefeated = false;
  game.spawnWave(game.wave);
}

