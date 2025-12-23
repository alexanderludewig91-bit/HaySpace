import { ensureAudio } from '../systems/AudioSystem.js';
import { drawEnemy } from '../render/GameRenderer.js';

export function initDevMode(game, resetLocalStorage) {
  // DOM Elements
  const devModeBtn = document.getElementById('devModeBtn');
  const devModePanel = document.getElementById('devModePanel');
  const devModeCloseBtn = document.getElementById('devModeCloseBtn');
  const devUnlockLevel1 = document.getElementById('devUnlockLevel1');
  const devUnlockLevel2 = document.getElementById('devUnlockLevel2');
  const devUnlockLevel3 = document.getElementById('devUnlockLevel3');
  const devUnlockAll = document.getElementById('devUnlockAll');
  const devClearSave = document.getElementById('devClearSave');
  const devShowSave = document.getElementById('devShowSave');
  const devSaveInfo = document.getElementById('devSaveInfo');
  const devSaveContent = document.getElementById('devSaveContent');
  const devEnemyTableBody = document.getElementById('devEnemyTableBody');
  
  // Referenzen zu anderen Elementen
  const overlay = document.getElementById('overlay');
  const titleScreen = document.getElementById('titleScreen');
  const levelSelect = document.getElementById('levelSelect');
  const levelComplete = document.getElementById('levelComplete');
  const gameComplete = document.getElementById('gameComplete');
  const pauseMenu = document.getElementById('pauseMenu');
  const newGameWarning = document.getElementById('newGameWarning');

  // Dev Mode Button
  devModeBtn.addEventListener('click', () => {
    ensureAudio();
    // Dev-Mode-Panel einfach als Overlay anzeigen, ohne andere Screens zu beeinflussen
    devModePanel.classList.remove('hidden');
    overlay.classList.remove('hidden');
    renderEnemyTable();
  });

  // Dev Mode Close Button
  devModeCloseBtn.addEventListener('click', () => {
    ensureAudio();
    devModePanel.classList.add('hidden');
    // Overlay NICHT verstecken - der darunterliegende Screen bleibt sichtbar
    // Das Overlay bleibt immer sichtbar, wenn ein Screen aktiv ist
    // Nur verstecken, wenn wirklich nichts sichtbar ist (z.B. während des Spiels)
    const hasVisibleScreen = !titleScreen.classList.contains('hidden') || 
                             !levelSelect.classList.contains('hidden') ||
                             !levelComplete.classList.contains('hidden') ||
                             !gameComplete.classList.contains('hidden') ||
                             !pauseMenu.classList.contains('hidden') ||
                             !newGameWarning.classList.contains('hidden');
    
    // Overlay bleibt sichtbar, wenn ein Screen aktiv ist
    // Nur verstecken, wenn wirklich nichts sichtbar ist (z.B. während des Spiels)
    if (!hasVisibleScreen && game.state === 'play') {
      overlay.classList.add('hidden');
    }
    // Wenn ein Screen sichtbar ist, bleibt das Overlay sichtbar (für den Screen)
  });

  // Level Unlock Buttons
  devUnlockLevel1.addEventListener('click', () => {
    game.unlockLevel(1);
    alert('Level 1 unlocked!');
  });

  devUnlockLevel2.addEventListener('click', () => {
    game.unlockLevel(2);
    alert('Level 2 unlocked!');
  });

  devUnlockLevel3.addEventListener('click', () => {
    game.unlockLevel(3);
    alert('Level 3 unlocked!');
  });

  devUnlockAll.addEventListener('click', () => {
    game.unlockLevel(1);
    game.unlockLevel(2);
    game.unlockLevel(3);
    alert('All levels unlocked!');
  });

  // Save Game Buttons
  devClearSave.addEventListener('click', () => {
    if (confirm('Clear all save data?')) {
      resetLocalStorage();
      alert('Save game cleared!');
    }
  });

  devShowSave.addEventListener('click', () => {
    const save = localStorage.getItem('unlockedLevels');
    if (save) {
      devSaveContent.textContent = JSON.stringify(JSON.parse(save), null, 2);
      devSaveInfo.style.display = 'block';
    } else {
      devSaveContent.textContent = 'No save data';
      devSaveInfo.style.display = 'block';
    }
  });

  // Enemy Overview Table
  const enemyData = [
    { name: 'Drone', kind: 'drone', level: 1, hp: { normal: 2, hard: 3 }, score: 25, r: 12, hue: 340 },
    { name: 'Striker', kind: 'striker', level: 1, hp: { normal: 4, hard: 6 }, score: 45, r: 14, hue: 330 },
    { name: 'Tank', kind: 'tank', level: 1, hp: { normal: 10, hard: 14 }, score: 90, r: 18, hue: 350, hasHPBar: true },
    { name: 'Hunter', kind: 'hunter', level: 2, hp: { normal: 4, hard: 5 }, score: 40, r: 13, hue: 200 },
    { name: 'Crusher', kind: 'crusher', level: 2, hp: { normal: 6, hard: 8 }, score: 60, r: 16, hue: 280 },
    { name: 'Guardian', kind: 'guardian', level: 2, hp: { normal: 14, hard: 18 }, score: 110, r: 20, hue: 50, hasHPBar: true },
    { name: 'Hunter', kind: 'hunter', level: 3, hp: { normal: 4, hard: 5 }, score: 40, r: 13, hue: 200 },
    { name: 'Crusher', kind: 'crusher', level: 3, hp: { normal: 6, hard: 8 }, score: 60, r: 16, hue: 280 },
    { name: 'Guardian', kind: 'guardian', level: 3, hp: { normal: 14, hard: 18 }, score: 110, r: 20, hue: 50, hasHPBar: true },
    { name: 'Destroyer', kind: 'destroyer', level: 3, hp: { normal: 20, hard: 24 }, score: 150, r: 22, hue: 10, hasHPBar: true }
  ];

  // Render enemy table
  function renderEnemyTable() {
    devEnemyTableBody.innerHTML = '';
    
    enemyData.forEach((enemy, index) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      
      // Name column
      const nameCell = document.createElement('td');
      nameCell.style.padding = '12px 8px';
      nameCell.style.color = 'rgba(245,250,255,0.9)';
      nameCell.textContent = enemy.name;
      row.appendChild(nameCell);
      
      // Animation column
      const animCell = document.createElement('td');
      animCell.style.padding = '8px';
      animCell.style.textAlign = 'center';
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      canvas.style.maxWidth = '32px';
      canvas.style.maxHeight = '32px';
      canvas.id = `enemyCanvas_${index}`;
      animCell.appendChild(canvas);
      row.appendChild(animCell);
      
      // Values column
      const valuesCell = document.createElement('td');
      valuesCell.style.padding = '8px';
      valuesCell.style.color = 'rgba(245,250,255,0.8)';
      valuesCell.style.fontSize = '11px';
      valuesCell.innerHTML = `
        <div>HP: ${enemy.hp.normal} (normal) / ${enemy.hp.hard} (hard)</div>
        <div>Score: ${enemy.score}</div>
        <div>Radius: ${enemy.r}px</div>
        <div>Hue: ${enemy.hue}°</div>
        ${enemy.hasHPBar ? '<div style="color: rgba(108,255,154,0.8);">Has HP Bar</div>' : ''}
      `;
      row.appendChild(valuesCell);
      
      // Level column
      const levelCell = document.createElement('td');
      levelCell.style.padding = '8px';
      levelCell.style.color = 'rgba(245,250,255,0.9)';
      levelCell.textContent = `Level ${enemy.level}`;
      row.appendChild(levelCell);
      
      devEnemyTableBody.appendChild(row);
      
      // Render enemy animation
      setTimeout(() => {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Scale down significantly - calculate based on canvas size
        // Canvas is 32x32, so we want enemies to be about 8-12px radius max
        const maxRadius = 10;
        const scaleFactor = maxRadius / enemy.r;
        
        // Create enemy object for rendering with scaled radius
        const enemyObj = {
          x: centerX,
          y: centerY,
          r: enemy.r * scaleFactor, // Scale down to fit canvas
          kind: enemy.kind,
          hue: enemy.hue,
          hp: enemy.hp.normal,
          t: 0
        };
        
        // Clear and draw enemy
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEnemy(ctx, enemyObj, false);
      }, 10);
    });
  }
  
}

