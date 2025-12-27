/**
 * Menu Animations
 * Zentrale Animation-Logik für alle Menü-Übergänge
 */

/**
 * Blendet Buttons mit Exit-Animation aus
 * @param {Array<HTMLElement>} buttons - Array von Button-Elementen
 * @param {Function} callback - Callback nach Animation (optional)
 * @param {number} delay - Verzögerung in ms (optional, default: 300)
 */
export function animateButtonsExit(buttons, callback = null, delay = 300) {
  buttons.forEach((btn) => {
    if (btn) {
      btn.classList.add('start-journey-exit');
    }
  });
  
  setTimeout(() => {
    buttons.forEach(btn => {
      if (btn) {
        btn.classList.remove('start-journey-exit');
      }
    });
    if (callback) callback();
  }, delay);
}

/**
 * Blendet Buttons mit Enter-Animation ein
 * @param {Array<HTMLElement>} buttons - Array von Button-Elementen
 * @param {Object} options - Optionen für Animation
 * @param {number} options.startDelay - Start-Verzögerung in ms (default: 200)
 * @param {number} options.staggerDelay - Verzögerung zwischen Buttons in ms (default: 100)
 * @param {Function} options.onComplete - Callback nach Animation (optional)
 */
export function animateButtonsEnter(buttons, options = {}) {
  const {
    startDelay = 200,
    staggerDelay = 100,
    onComplete = null
  } = options;
  
  buttons.forEach((btn, index) => {
    if (btn) {
      btn.style.opacity = '0';
      btn.style.transform = 'scale(0.9) translateY(10px)';
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 1) btn.classList.add('level-button-enter-delay-1');
        if (index >= 2) btn.classList.add('level-button-enter-delay-2');
        
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
          
          // Callback beim letzten Button
          if (index === buttons.length - 1 && onComplete) {
            setTimeout(() => onComplete(), 100);
          }
        }, 500);
      }, startDelay + (index * staggerDelay));
    }
  });
}

/**
 * Blendet Content mit Fade-In-Animation ein
 * @param {HTMLElement} element - Element zum Einblenden
 * @param {Object} options - Optionen für Animation
 * @param {number} options.delay - Verzögerung in ms (default: 200)
 * @param {Function} options.onComplete - Callback nach Animation (optional)
 */
export function animateContentEnter(element, options = {}) {
  const {
    delay = 200,
    onComplete = null
  } = options;
  
  if (!element) return;
  
  element.style.opacity = '0';
  element.style.transform = 'scale(0.95)';
  element.style.display = 'block';
  
  setTimeout(() => {
    element.classList.add('level-button-enter');
    setTimeout(() => {
      element.classList.remove('level-button-enter');
      element.style.opacity = '';
      element.style.transform = '';
      if (onComplete) onComplete();
    }, 500);
  }, delay);
}

/**
 * Blendet Content mit Exit-Animation aus
 * @param {HTMLElement} element - Element zum Ausblenden
 * @param {Function} callback - Callback nach Animation
 * @param {number} delay - Verzögerung in ms (default: 300)
 */
export function animateContentExit(element, callback, delay = 300) {
  if (!element) {
    if (callback) callback();
    return;
  }
  
  element.classList.add('start-journey-exit');
  setTimeout(() => {
    element.style.display = 'none';
    element.classList.remove('start-journey-exit');
    if (callback) callback();
  }, delay);
}

/**
 * Kombiniert Exit- und Enter-Animation für Menü-Übergänge
 * @param {Object} config - Konfiguration
 * @param {Array<HTMLElement>} config.exitButtons - Buttons zum Ausblenden
 * @param {HTMLElement} config.exitContainer - Container zum Ausblenden (optional)
 * @param {Array<HTMLElement>} config.enterButtons - Buttons zum Einblenden
 * @param {HTMLElement} config.enterContainer - Container zum Einblenden (optional)
 * @param {Function} config.onComplete - Callback nach kompletter Animation
 * @param {number} config.exitDelay - Verzögerung für Exit (default: 300)
 * @param {number} config.enterDelay - Verzögerung für Enter (default: 200)
 */
export function animateMenuTransition(config) {
  const {
    exitButtons = [],
    exitContainer = null,
    enterButtons = [],
    enterContainer = null,
    onComplete = null,
    exitDelay = 300,
    enterDelay = 200
  } = config;
  
  // Exit-Animation starten
  if (exitButtons.length > 0) {
    animateButtonsExit(exitButtons, () => {
      if (exitContainer) {
        exitContainer.style.display = 'none';
      }
      
      // Enter-Animation nach Exit
      if (enterContainer) {
        animateContentEnter(enterContainer, {
          delay: enterDelay,
          onComplete: () => {
            if (enterButtons.length > 0) {
              animateButtonsEnter(enterButtons, {
                startDelay: enterDelay,
                onComplete
              });
            } else if (onComplete) {
              onComplete();
            }
          }
        });
      } else if (enterButtons.length > 0) {
        animateButtonsEnter(enterButtons, {
          startDelay: enterDelay,
          onComplete
        });
      } else if (onComplete) {
        onComplete();
      }
    }, exitDelay);
  } else if (exitContainer) {
    animateContentExit(exitContainer, () => {
      if (enterContainer) {
        animateContentEnter(enterContainer, {
          delay: enterDelay,
          onComplete: () => {
            if (enterButtons.length > 0) {
              animateButtonsEnter(enterButtons, {
                startDelay: enterDelay,
                onComplete
              });
            } else if (onComplete) {
              onComplete();
            }
          }
        });
      } else if (enterButtons.length > 0) {
        animateButtonsEnter(enterButtons, {
          startDelay: enterDelay,
          onComplete
        });
      } else if (onComplete) {
        onComplete();
      }
    }, exitDelay);
  } else {
    // Kein Exit, direkt Enter
    if (enterContainer) {
      animateContentEnter(enterContainer, {
        delay: enterDelay,
        onComplete: () => {
          if (enterButtons.length > 0) {
            animateButtonsEnter(enterButtons, {
              startDelay: enterDelay,
              onComplete
            });
          } else if (onComplete) {
            onComplete();
          }
        }
      });
    } else if (enterButtons.length > 0) {
      animateButtonsEnter(enterButtons, {
        startDelay: enterDelay,
        onComplete
      });
    } else if (onComplete) {
      onComplete();
    }
  }
}

