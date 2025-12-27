/**
 * Level Select Renderer
 * Rendert die Level-Auswahl-Buttons
 */

/**
 * Rendert die Level-Auswahl-Buttons
 * @param {Object} game - Game-Instanz
 * @param {Function} onLevelClick - Callback wenn ein Level geklickt wird
 * @param {HTMLElement} levelList - Container für Level-Buttons
 * @param {Function} setupGamepadNav - Gamepad-Navigation-Setup-Funktion
 */
export function renderLevelSelect(game, onLevelClick, levelList, setupGamepadNav) {
  levelList.innerHTML = '';
  const unlocked = game.getUnlockedLevels();
  
  // Erst alle Buttons erstellen und zum DOM hinzufügen
  const buttons = [];
  for (let i = 1; i <= 5; i++) {
    const levelBtn = document.createElement('button');
    levelBtn.className = 'btn';
    levelBtn.style.width = '100%';
    levelBtn.style.textAlign = 'center';
    levelBtn.style.padding = '20px 30px';
    levelBtn.style.display = 'flex';
    levelBtn.style.justifyContent = 'center';
    levelBtn.style.alignItems = 'center';
    levelBtn.style.gap = '10px';
    
    // Für Animation vorbereiten - komplett unsichtbar
    levelBtn.style.opacity = '0';
    levelBtn.style.transform = 'scale(0.9) translateY(10px)';
    levelBtn.style.visibility = 'hidden';
    
    const isUnlocked = unlocked.includes(i);
    if (isUnlocked) {
      levelBtn.innerHTML = `<span><b>LEVEL ${i}</b></span>`;
      levelBtn.onclick = () => onLevelClick(i);
    } else {
      levelBtn.innerHTML = `<span><b>LEVEL ${i}</b> 🔒</span>`;
      levelBtn.disabled = true;
      levelBtn.style.cursor = 'not-allowed';
    }
    
    levelList.appendChild(levelBtn);
    buttons.push({ btn: levelBtn, index: i, unlocked: isUnlocked });
  }
  
  // Nachdem alle Buttons gerendert wurden, Animation starten
  requestAnimationFrame(() => {
    buttons.forEach(({ btn, index, unlocked }) => {
      btn.style.visibility = 'visible';
      
      setTimeout(() => {
        btn.classList.add('level-button-enter');
        if (index === 2) btn.classList.add('level-button-enter-delay-1');
        if (index === 3) btn.classList.add('level-button-enter-delay-2');
        if (index === 4) btn.classList.add('level-button-enter-delay-2');
        if (index === 5) btn.classList.add('level-button-enter-delay-2');
        
        setTimeout(() => {
          btn.classList.remove('level-button-enter', 'level-button-enter-delay-1', 'level-button-enter-delay-2');
          btn.style.opacity = '';
          btn.style.transform = '';
          if (!unlocked) {
            btn.style.opacity = '0.5';
          }
        }, 500);
      }, 200 + (index - 1) * 100);
    });
  });
}

