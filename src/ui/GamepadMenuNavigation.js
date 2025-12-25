/**
 * Gamepad-Menü-Navigation
 * Verwaltet die Navigation durch Menüs mit dem Gamepad
 */

/**
 * Initialisiert die Gamepad-Menü-Navigation
 * @param {Object} elements - DOM-Elemente für die Navigation
 * @param {GamepadSystem} gamepad - Gamepad-System-Instanz
 * @param {Function} ensureAudio - Funktion zum Sicherstellen, dass Audio initialisiert ist
 */
export function initGamepadMenuNavigation(elements, gamepad, ensureAudio) {
  /**
   * Gamepad Back-Handler
   * Behandelt die Navigation zurück mit dem B-Button
   */
  function handleGamepadBack() {
    ensureAudio();
    
    if (!elements.titleScreen.classList.contains('hidden')) {
      // Im Titelbildschirm oder Hauptmenü
      if (!elements.startJourneySection.classList.contains('hidden')) {
        // Start Journey Screen - nichts zu tun
        return;
      } else if (!elements.mainMenuSection.classList.contains('hidden')) {
        // Hauptmenü
        if (elements.shopContent && elements.shopContent.style.display !== 'none') {
          // In Shop -> zurück zum Game Menu
          elements.shopBackBtn.click();
        } else if (elements.gameMenuContent && elements.gameMenuContent.style.display !== 'none') {
          // In Game Menu -> zurück zum Hauptmenü
          elements.gameMenuBackBtn.click();
        } else if (elements.levelSelectContent && elements.levelSelectContent.style.display !== 'none') {
          // In Level-Auswahl -> zurück zum Game Menu
          elements.backToTitleBtn.click();
        } else if (elements.settingsContent && elements.settingsContent.style.display !== 'none') {
          // In Settings -> zurück zum Hauptmenü
          elements.settingsBackBtn.click();
        } else {
          // Hauptmenü -> zurück zum Start Journey
          elements.backToTitleFromMainBtn.click();
        }
      }
    } else if (!elements.pauseMenu.classList.contains('hidden')) {
      // Pause-Menü -> Resume
      elements.resumeBtn.click();
    } else if (!elements.levelComplete.classList.contains('hidden')) {
      // Level Complete -> Level Select
      elements.backToLevelSelectBtn.click();
    } else if (!elements.gameComplete.classList.contains('hidden')) {
      // Game Complete -> Level Select
      elements.backToLevelSelectFromCompleteBtn.click();
    }
    
    const newGameWarningContainer = document.getElementById('newGameWarningContainer');
    if (newGameWarningContainer && !newGameWarningContainer.classList.contains('hidden')) {
      // Warning -> Cancel
      elements.cancelNewGameBtn.click();
    }
  }

  /**
   * Menü-Navigation für Gamepad aktivieren
   * Erkennt automatisch welche Buttons sichtbar sind und aktiviert die Navigation
   * @param {string} screenName - Name des aktuellen Screens (für Debugging)
   */
  function setupGamepadNavigation(screenName) {
    if (!gamepad.isConnected()) {
      gamepad.disableMenuNavigation();
      return;
    }
    
    let buttons = [];
    
    // Prüfe aktuellen Screen-Status (nicht nur screenName)
    const isStartJourneyVisible = elements.startJourneySection && !elements.startJourneySection.classList.contains('hidden');
    const isMainMenuVisible = elements.mainMenuSection && !elements.mainMenuSection.classList.contains('hidden');
    const isLevelSelectVisible = elements.levelSelectContent && elements.levelSelectContent.style.display !== 'none';
    const isSettingsVisible = elements.settingsContent && elements.settingsContent.style.display !== 'none';
    const isGameMenuVisible = elements.gameMenuContent && elements.gameMenuContent.style.display !== 'none';
    const isShopVisible = elements.shopContent && elements.shopContent.style.display !== 'none';
    const isPauseVisible = elements.pauseMenu && !elements.pauseMenu.classList.contains('hidden');
    const isLevelCompleteVisible = elements.levelComplete && !elements.levelComplete.classList.contains('hidden');
    const isGameCompleteVisible = elements.gameComplete && !elements.gameComplete.classList.contains('hidden');
    const newGameWarningContainer = document.getElementById('newGameWarningContainer');
    const isWarningVisible = newGameWarningContainer && !newGameWarningContainer.classList.contains('hidden');
    
    // Priorität: Level Complete und Game Complete haben höchste Priorität (überlagern andere Menüs)
    if (isLevelCompleteVisible) {
      // Level Complete: Prüfe welche Buttons sichtbar sind
      const levelCompleteButtons = [];
      
      // Versuche zuerst direkten Zugriff auf die Buttons
      if (elements.nextLevelBtn && !elements.nextLevelBtn.disabled) {
        const nextLevelStyle = window.getComputedStyle(elements.nextLevelBtn);
        const isNextLevelVisible = nextLevelStyle.display !== 'none' && 
                                    nextLevelStyle.visibility !== 'hidden' &&
                                    elements.nextLevelBtn.offsetParent !== null;
        if (isNextLevelVisible) {
          levelCompleteButtons.push(elements.nextLevelBtn);
        }
      }
      
      if (elements.backToLevelSelectBtn && !elements.backToLevelSelectBtn.disabled) {
        const backStyle = window.getComputedStyle(elements.backToLevelSelectBtn);
        const isBackVisible = backStyle.display !== 'none' && 
                              backStyle.visibility !== 'hidden' &&
                              elements.backToLevelSelectBtn.offsetParent !== null;
        if (isBackVisible) {
          levelCompleteButtons.push(elements.backToLevelSelectBtn);
        }
      }
      
      // Falls immer noch keine Buttons gefunden, versuche Container-Zugriff
      if (levelCompleteButtons.length === 0) {
        const levelCompleteContainer = document.getElementById('levelComplete');
        if (levelCompleteContainer && !levelCompleteContainer.classList.contains('hidden')) {
          const allButtons = levelCompleteContainer.querySelectorAll('button.btn, .btn');
          levelCompleteButtons.push(...Array.from(allButtons).filter(btn => {
            if (!btn || btn.disabled) return false;
            const style = window.getComputedStyle(btn);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' &&
                   btn.offsetParent !== null;
          }));
        }
      }
      
      buttons = levelCompleteButtons;
    } else if (isGameCompleteVisible) {
      buttons = [elements.backToLevelSelectFromCompleteBtn].filter(btn => btn && btn.offsetParent !== null);
    } else if (isPauseVisible) {
      // Pausenmenü-Buttons
      const pauseButtons = [];
      if (elements.resumeBtn) {
        const resumeStyle = window.getComputedStyle(elements.resumeBtn);
        const isResumeVisible = resumeStyle.display !== 'none' && 
                                resumeStyle.visibility !== 'hidden' &&
                                elements.resumeBtn.offsetParent !== null &&
                                !elements.resumeBtn.disabled;
        if (isResumeVisible) {
          pauseButtons.push(elements.resumeBtn);
        }
      }
      if (elements.pauseToLevelSelectBtn) {
        const pauseStyle = window.getComputedStyle(elements.pauseToLevelSelectBtn);
        const isPauseBtnVisible = pauseStyle.display !== 'none' && 
                                  pauseStyle.visibility !== 'hidden' &&
                                  elements.pauseToLevelSelectBtn.offsetParent !== null &&
                                  !elements.pauseToLevelSelectBtn.disabled;
        if (isPauseBtnVisible) {
          pauseButtons.push(elements.pauseToLevelSelectBtn);
        }
      }
      // Falls keine Buttons gefunden, versuche Container-Zugriff
      if (pauseButtons.length === 0 && elements.pauseMenu) {
        const allButtons = elements.pauseMenu.querySelectorAll('button.btn, .btn');
        pauseButtons.push(...Array.from(allButtons).filter(btn => {
          if (!btn || btn.disabled) return false;
          const style = window.getComputedStyle(btn);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 btn.offsetParent !== null;
        }));
      }
      buttons = pauseButtons;
    } else if (isWarningVisible) {
      buttons = [elements.confirmNewGameBtn, elements.cancelNewGameBtn].filter(btn => btn && btn.offsetParent !== null);
    } else if (isStartJourneyVisible && !isMainMenuVisible) {
      // Start Journey Screen (nur wenn Hauptmenü nicht sichtbar ist)
      buttons = [elements.startJourneyBtn].filter(btn => btn && btn.offsetParent !== null);
    } else if (isLevelSelectVisible) {
      // Level-Auswahl
      const levelButtons = elements.levelList.querySelectorAll('.btn:not([disabled])');
      buttons = Array.from(levelButtons);
      if (elements.backToTitleBtn) buttons.push(elements.backToTitleBtn);
    } else if (isShopVisible) {
      // Shop/Werft
      buttons = [elements.shopBackBtn].filter(btn => btn && btn.offsetParent !== null);
      // Shop-Upgrade-Buttons werden dynamisch hinzugefügt (wird von Shop.js gehandhabt)
    } else if (isGameMenuVisible) {
      // Game Menu (Seite 3: Level-Auswahl/Werft)
      buttons = [elements.levelSelectMenuBtn, elements.shopBtn, elements.gameMenuBackBtn].filter(btn => btn && btn.offsetParent !== null);
    } else if (isSettingsVisible) {
      // Settings
      buttons = [elements.settingsBackBtn].filter(btn => btn && btn.offsetParent !== null);
    } else if (isMainMenuVisible && !isLevelSelectVisible && !isSettingsVisible && !isGameMenuVisible && !isShopVisible) {
      // Hauptmenü-Buttons (nur wenn keine anderen Contents sichtbar sind)
      buttons = [elements.newGameBtn, elements.continueBtn, elements.settingsBtn, elements.backToTitleFromMainBtn].filter(btn => btn && btn.offsetParent !== null);
    }
    
    // Filtere null/undefined Buttons und nicht sichtbare Buttons (nur wenn noch nicht gefiltert)
    buttons = buttons.filter(btn => {
      if (!btn) return false;
      const style = window.getComputedStyle(btn);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' &&
             btn.offsetParent !== null &&
             !btn.disabled;
    });
    
    if (buttons.length > 0) {
      console.log('Gamepad Navigation aktiviert:', buttons.length, 'Buttons', {
        screenName,
        buttons: buttons.map(btn => btn.id || btn.textContent?.trim() || btn.className)
      });
      gamepad.enableMenuNavigation(buttons);
    } else {
      console.warn('Gamepad Navigation deaktiviert: Keine Buttons gefunden', {
        screenName,
        isStartJourneyVisible,
        isMainMenuVisible,
        isLevelSelectVisible,
        isSettingsVisible,
        isPauseVisible,
        isLevelCompleteVisible,
        isGameCompleteVisible,
        isWarningVisible,
        nextLevelBtn: elements.nextLevelBtn ? {
          exists: true,
          display: window.getComputedStyle(elements.nextLevelBtn).display,
          offsetParent: elements.nextLevelBtn.offsetParent !== null,
          disabled: elements.nextLevelBtn.disabled
        } : null,
        backToLevelSelectBtn: elements.backToLevelSelectBtn ? {
          exists: true,
          display: window.getComputedStyle(elements.backToLevelSelectBtn).display,
          offsetParent: elements.backToLevelSelectBtn.offsetParent !== null,
          disabled: elements.backToLevelSelectBtn.disabled
        } : null
      });
      gamepad.disableMenuNavigation();
    }
  }

  // Exportiere die Funktionen
  return {
    setupGamepadNavigation,
    handleGamepadBack
  };
}

