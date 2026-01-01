/**
 * LocalStorage Management
 * Verwaltet alle LocalStorage-Operationen für das Spiel
 */

import { setMusicVolume, setSFXVolume } from '../systems/AudioSystem.js';

/**
 * Setzt alle LocalStorage-Daten zurück (für New Game)
 */
export function resetLocalStorage() {
  localStorage.removeItem('unlockedLevels');
  localStorage.removeItem('upgrades');
  localStorage.removeItem('musicVolume');
  localStorage.removeItem('sfxVolume');
}

/**
 * Lädt Spielstand aus LocalStorage
 * @returns {Object} Spielstand-Daten
 */
export function loadFromLocalStorage() {
  const unlocked = localStorage.getItem('unlockedLevels');
  return unlocked ? JSON.parse(unlocked) : [1];
}

/**
 * Speichert Spielstand in LocalStorage
 * @param {Array<number>} unlockedLevels - Array der freigeschalteten Level
 */
export function saveToLocalStorage(unlockedLevels) {
  localStorage.setItem('unlockedLevels', JSON.stringify(unlockedLevels));
}

/**
 * Lädt Einstellungen aus LocalStorage und wendet sie an
 * @param {Object} DOM - DOM-Referenzen für Slider und Anzeigen
 */
export function loadSettings(DOM) {
  const savedMusicVolume = localStorage.getItem('musicVolume');
  const savedSFXVolume = localStorage.getItem('sfxVolume');
  
  if (savedMusicVolume !== null) {
    const volume = parseFloat(savedMusicVolume);
    setMusicVolume(volume);
    if (DOM.musicVolumeSlider) {
      DOM.musicVolumeSlider.value = volume * 100;
    }
    if (DOM.musicVolumeValue) {
      DOM.musicVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
  }
  
  if (savedSFXVolume !== null) {
    const volume = parseFloat(savedSFXVolume);
    setSFXVolume(volume);
    if (DOM.sfxVolumeSlider) {
      DOM.sfxVolumeSlider.value = volume * 100;
    }
    if (DOM.sfxVolumeValue) {
      DOM.sfxVolumeValue.textContent = Math.round(volume * 100) + '%';
    }
  }
}



