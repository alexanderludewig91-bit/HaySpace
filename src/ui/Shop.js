/**
 * Shop-UI für Raumschiff-Upgrades
 * Verwaltet die grafische Darstellung und Interaktion des Shops
 */

export class Shop {
  constructor(upgradeSystem, onUpgradePurchased) {
    this.upgradeSystem = upgradeSystem;
    this.onUpgradePurchased = onUpgradePurchased;
    this.shopContent = null;
    this.shopUpgrades = null;
    this.creditsDisplay = null;
    
    // Upgrade-Definitionen mit Symbolen (Unicode als Platzhalter)
    this.upgradeDefinitions = {
      weapon: {
        name: 'Weapon Upgrade',
        icon: '⚔️',
        description: 'Increases number of simultaneous shots',
        maxLevel: 2,
        getLevelDescription: (level) => {
          if (level === 0) return '1 shot';
          if (level === 1) return '2 shots';
          if (level === 2) return '3 shots';
          return 'MAX';
        }
      },
      overheat: {
        name: 'Overheat Protection',
        icon: '❄️',
        description: 'Weapon overheats slower',
        maxLevel: 3,
        getLevelDescription: (level) => {
          if (level === 0) return 'Normal';
          if (level === 1) return '15% slower';
          if (level === 2) return '30% slower';
          if (level === 3) return '50% slower';
          return 'MAX';
        }
      },
      speed: {
        name: 'Speed Boost',
        icon: '⚡',
        description: 'Increases acceleration and max speed',
        maxLevel: 5,
        getLevelDescription: (level) => {
          if (level === 0) return '1.0x';
          const speed = 1.0 + (level * 0.2);
          return `${speed.toFixed(1)}x`;
        }
      },
      dash: {
        name: 'Dash System',
        icon: '💨',
        description: 'Quick movement burst',
        maxLevel: 1,
        getLevelDescription: (level) => {
          return level === 0 ? 'Disabled' : 'Enabled';
        }
      },
      shield: {
        name: 'Shield',
        icon: '🛡️',
        description: 'Increases maximum shield capacity',
        maxLevel: 5,
        getLevelDescription: (level) => {
          if (level === 0) return '100%';
          const shield = 100 * (1 + (level * 0.2));
          return `${Math.round(shield)}%`;
        }
      }
    };
  }
  
  /**
   * Initialisiert den Shop (muss nach DOM-Load aufgerufen werden)
   */
  init() {
    this.shopContent = document.getElementById('shopContent');
    this.shopUpgrades = document.getElementById('shopUpgrades');
    this.creditsDisplay = document.getElementById('creditsDisplay');
    
    if (!this.shopContent || !this.shopUpgrades || !this.creditsDisplay) {
      console.error('Shop-Elemente nicht gefunden!');
      return;
    }
    
    this.render();
  }
  
  /**
   * Rendert den Shop
   */
  render() {
    if (!this.shopUpgrades) return;
    
    // Credits anzeigen
    if (this.creditsDisplay) {
      this.creditsDisplay.textContent = this.upgradeSystem.getCredits().toLocaleString();
    }
    
    // Shop leeren
    this.shopUpgrades.innerHTML = '';
    
    // Alle Upgrades rendern
    for (const [upgradeType, definition] of Object.entries(this.upgradeDefinitions)) {
      const upgradeElement = this.createUpgradeElement(upgradeType, definition);
      this.shopUpgrades.appendChild(upgradeElement);
    }
  }
  
  /**
   * Erstellt ein Upgrade-Element
   */
  createUpgradeElement(upgradeType, definition) {
    const currentLevel = this.upgradeSystem.getLevel(upgradeType);
    const maxLevel = definition.maxLevel;
    const nextLevel = currentLevel + 1;
    const canUpgrade = nextLevel <= maxLevel;
    const price = canUpgrade ? this.upgradeSystem.getPrice(upgradeType, nextLevel) : null;
    const canAfford = price !== null && this.upgradeSystem.canAfford(upgradeType, nextLevel);
    
    const container = document.createElement('div');
    container.className = 'shop-upgrade-item';
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: rgba(20, 30, 50, 0.6);
      border: 2px solid ${canAfford ? 'rgba(100, 255, 200, 0.5)' : 'rgba(100, 100, 120, 0.3)'};
      border-radius: 8px;
      transition: all 0.2s;
    `;
    
    // Header mit Icon und Name
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    header.innerHTML = `
      <span style="font-size: 24px;">${definition.icon}</span>
      <div style="flex: 1;">
        <div style="font-size: 16px; font-weight: bold; color: rgba(245,250,255,0.9);">${definition.name}</div>
        <div style="font-size: 12px; color: rgba(245,250,255,0.6);">${definition.description}</div>
      </div>
    `;
    container.appendChild(header);
    
    // Level-Anzeige
    const levelInfo = document.createElement('div');
    levelInfo.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 14px;';
    levelInfo.innerHTML = `
      <span style="color: rgba(245,250,255,0.7);">
        Current: <strong style="color: rgba(100,255,200,1);">${definition.getLevelDescription(currentLevel)}</strong>
      </span>
      ${canUpgrade ? `
        <span style="color: rgba(245,250,255,0.7);">
          Next: <strong style="color: rgba(255,200,100,1);">${definition.getLevelDescription(nextLevel)}</strong>
        </span>
      ` : '<span style="color: rgba(150,150,150,1);">MAX</span>'}
    `;
    container.appendChild(levelInfo);
    
    // Preis und Kauf-Button
    if (canUpgrade) {
      const purchaseRow = document.createElement('div');
      purchaseRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 8px;';
      
      const priceDisplay = document.createElement('span');
      priceDisplay.style.cssText = `font-size: 16px; font-weight: bold; color: ${canAfford ? 'rgba(100,255,200,1)' : 'rgba(255,100,100,1)'};`;
      priceDisplay.textContent = `${price.toLocaleString()} Credits`;
      purchaseRow.appendChild(priceDisplay);
      
      const buyButton = document.createElement('button');
      buyButton.className = 'btn';
      buyButton.textContent = canAfford ? 'Buy' : 'Not enough credits';
      buyButton.disabled = !canAfford;
      buyButton.style.cssText = canAfford ? '' : 'opacity: 0.5; cursor: not-allowed;';
      buyButton.addEventListener('click', () => {
        if (canAfford && this.upgradeSystem.buyUpgrade(upgradeType, nextLevel)) {
          if (this.onUpgradePurchased) {
            this.onUpgradePurchased(upgradeType, nextLevel);
          }
          this.render(); // Shop neu rendern
        }
      });
      purchaseRow.appendChild(buyButton);
      
      container.appendChild(purchaseRow);
    } else {
      const maxLabel = document.createElement('div');
      maxLabel.style.cssText = 'text-align: center; color: rgba(150,150,150,1); font-size: 14px; margin-top: 8px;';
      maxLabel.textContent = 'Maximum upgrade reached';
      container.appendChild(maxLabel);
    }
    
    return container;
  }
  
  /**
   * Aktualisiert die Credits-Anzeige
   */
  updateCredits() {
    if (this.creditsDisplay) {
      this.creditsDisplay.textContent = this.upgradeSystem.getCredits().toLocaleString();
    }
  }
}

