/**
 * Shop-UI für Raumschiff-Upgrades
 * Verwaltet die grafische Darstellung und Interaktion des Shops
 */

export class Shop {
  constructor(upgradeSystem, onUpgradePurchased, onBackClick) {
    this.upgradeSystem = upgradeSystem;
    this.onUpgradePurchased = onUpgradePurchased;
    this.onBackClick = onBackClick;
    this.shopContent = null;
    this.shopUpgrades = null; // Wird nicht mehr verwendet, aber für Kompatibilität behalten
    this.creditsDisplay = null;
    this.hangarCategories = null;
    this.hangarItems = null;
    this.selectedCategory = 'weapon'; // Standard-Kategorie
    
    // Upgrade-Definitionen mit Symbolen (Unicode als Platzhalter)
    this.upgradeDefinitions = {
      weapon: {
        name: 'Multi Fire',
        icon: '⚔️',
        description: 'Increases number of simultaneous shots',
        maxLevel: 2,
        getLevelDescription: (level) => {
          if (level === 0) return '1 shot';
          if (level === 1) return 'Double Fire';
          if (level === 2) return 'Triple Fire';
          return 'MAX';
        },
        getLevelName: (level) => {
          if (level === 1) return 'Double Fire';
          if (level === 2) return 'Triple Fire';
          return `Level ${level}`;
        }
      },
      overheat: {
        name: 'Thermal Control',
        icon: '❄️',
        description: 'Weapon overheats slower',
        maxLevel: 3,
        getLevelDescription: (level) => {
          if (level === 0) return 'Normal';
          if (level === 1) return '15% slower';
          if (level === 2) return '30% slower';
          if (level === 3) return '50% slower';
          return 'MAX';
        },
        getLevelName: (level) => {
          if (level === 1) return 'Enhanced Cooling';
          if (level === 2) return 'Super Cooling';
          if (level === 3) return 'Ultra Cooling';
          return `Level ${level}`;
        }
      },
      speed: {
        name: 'Speed Control',
        icon: '⚡',
        description: 'Increases acceleration and max speed',
        maxLevel: 5,
        getLevelDescription: (level) => {
          if (level === 0) return '1.0x';
          const speed = 1.0 + (level * 0.2);
          return `${speed.toFixed(1)}x`;
        },
        getLevelName: (level) => {
          if (level === 1) return 'Speed I';
          if (level === 2) return 'Speed II';
          if (level === 3) return 'Speed III';
          if (level === 4) return 'Speed IV';
          if (level === 5) return 'Speed V';
          return `Level ${level}`;
        }
      },
      dash: {
        name: 'Boost System',
        icon: '💨',
        description: 'Quick movement burst',
        maxLevel: 3,
        getLevelDescription: (level) => {
          if (level === 0) return 'Disabled';
          if (level === 1) return 'Enabled';
          if (level === 2) return 'Enhanced';
          if (level === 3) return 'Ultra';
          return 'MAX';
        },
        getLevelName: (level) => {
          if (level === 1) return 'Boost Enabled';
          if (level === 2) return 'Enhanced Boost';
          if (level === 3) return 'Ultra Boost';
          return `Level ${level}`;
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
        },
        getLevelName: (level) => {
          if (level === 1) return '120% Shield';
          if (level === 2) return '140% Shield';
          if (level === 3) return '160% Shield';
          if (level === 4) return '180% Shield';
          if (level === 5) return '200% Shield';
          return `Level ${level}`;
        }
      }
    };
  }
  
  /**
   * Initialisiert den Shop (muss nach DOM-Load aufgerufen werden)
   */
  init() {
    this.shopContent = document.getElementById('shopContent');
    this.shopUpgrades = document.getElementById('shopUpgrades'); // Legacy, wird nicht mehr verwendet
    this.creditsDisplay = document.getElementById('creditsDisplay');
    this.hangarCategories = document.getElementById('hangarCategories');
    this.hangarItems = document.getElementById('hangarItems');
    
    if (!this.shopContent || !this.creditsDisplay) {
      console.error('Shop-Elemente nicht gefunden!');
      return;
    }
    
    // Kategorien und Items werden erst beim ersten render() initialisiert
    // (können null sein, wenn shopContent noch nicht sichtbar ist)
    // render() wird aufgerufen, wenn der Hangar geöffnet wird
  }
  
  /**
   * Rendert den Shop
   */
  render() {
    // Elemente beim Render immer neu suchen (falls sie noch nicht gefunden wurden)
    if (!this.hangarCategories) {
      this.hangarCategories = document.getElementById('hangarCategories');
    }
    if (!this.hangarItems) {
      this.hangarItems = document.getElementById('hangarItems');
    }
    if (!this.creditsDisplay) {
      this.creditsDisplay = document.getElementById('creditsDisplay');
    }
    
    if (!this.hangarCategories || !this.hangarItems) {
      console.error('Hangar-Elemente nicht gefunden!', {
        hangarCategories: !!this.hangarCategories,
        hangarItems: !!this.hangarItems,
        shopContent: !!this.shopContent
      });
      return;
    }
    
    console.log('Shop render() aufgerufen', {
      hangarCategories: !!this.hangarCategories,
      hangarItems: !!this.hangarItems,
      selectedCategory: this.selectedCategory,
      shopContent: !!this.shopContent,
      shopContentDisplay: this.shopContent ? getComputedStyle(this.shopContent).display : 'N/A',
      hangarLayout: document.getElementById('hangarLayout') ? getComputedStyle(document.getElementById('hangarLayout')).display : 'N/A'
    });
    
    // Credits-Anzeige finden und aktualisieren
    if (!this.hangarCreditsDisplay) {
      this.hangarCreditsDisplay = document.getElementById('hangarCreditsDisplay');
    }
    if (!this.creditsDisplay) {
      this.creditsDisplay = document.getElementById('creditsDisplay');
    }
    
    // Credits anzeigen
    if (this.creditsDisplay) {
      this.creditsDisplay.textContent = this.upgradeSystem.getCredits().toLocaleString();
    }
    if (this.hangarCreditsDisplay) {
      this.hangarCreditsDisplay.style.display = 'flex';
    }
    
    // Kategorien rendern
    this.renderCategories();
    
    // Items der gewählten Kategorie rendern
    this.renderItems();
    
    // Test: Prüfe ob Elemente sichtbar sind NACH dem Rendern
    setTimeout(() => {
      const shopContent = this.shopContent || document.getElementById('shopContent');
      console.log('Element-Positionen NACH Rendern:', {
        shopContent: shopContent ? {
          display: getComputedStyle(shopContent).display,
          position: getComputedStyle(shopContent).position,
          width: getComputedStyle(shopContent).width,
          height: getComputedStyle(shopContent).height,
          boundingRect: shopContent.getBoundingClientRect()
        } : 'N/A',
        hangarLayout: this.hangarCategories?.parentElement ? {
          display: getComputedStyle(this.hangarCategories.parentElement).display,
          position: getComputedStyle(this.hangarCategories.parentElement).position,
          zIndex: getComputedStyle(this.hangarCategories.parentElement).zIndex,
          width: getComputedStyle(this.hangarCategories.parentElement).width,
          height: getComputedStyle(this.hangarCategories.parentElement).height,
          visibility: getComputedStyle(this.hangarCategories.parentElement).visibility,
          opacity: getComputedStyle(this.hangarCategories.parentElement).opacity,
          boundingRect: this.hangarCategories.parentElement.getBoundingClientRect()
        } : 'N/A',
        hangarCategories: this.hangarCategories ? {
          display: getComputedStyle(this.hangarCategories).display,
          position: getComputedStyle(this.hangarCategories).position,
          zIndex: getComputedStyle(this.hangarCategories).zIndex,
          visibility: getComputedStyle(this.hangarCategories).visibility,
          opacity: getComputedStyle(this.hangarCategories).opacity,
          width: getComputedStyle(this.hangarCategories).width,
          height: getComputedStyle(this.hangarCategories).height,
          children: this.hangarCategories.children.length,
          boundingRect: this.hangarCategories.getBoundingClientRect(),
          firstChild: this.hangarCategories.firstElementChild ? {
            display: getComputedStyle(this.hangarCategories.firstElementChild).display,
            boundingRect: this.hangarCategories.firstElementChild.getBoundingClientRect()
          } : null
        } : 'N/A',
        hangarItems: this.hangarItems ? {
          display: getComputedStyle(this.hangarItems).display,
          position: getComputedStyle(this.hangarItems).position,
          zIndex: getComputedStyle(this.hangarItems).zIndex,
          visibility: getComputedStyle(this.hangarItems).visibility,
          opacity: getComputedStyle(this.hangarItems).opacity,
          width: getComputedStyle(this.hangarItems).width,
          height: getComputedStyle(this.hangarItems).height,
          children: this.hangarItems.children.length,
          boundingRect: this.hangarItems.getBoundingClientRect(),
          firstChild: this.hangarItems.firstElementChild ? {
            display: getComputedStyle(this.hangarItems.firstElementChild).display,
            boundingRect: this.hangarItems.firstElementChild.getBoundingClientRect()
          } : null
        } : 'N/A'
      });
    }, 100);
  }
  
  /**
   * Rendert die Kategorien in der linken Spalte
   */
  renderCategories() {
    if (!this.hangarCategories) return;
    
    this.hangarCategories.innerHTML = '';
    
    for (const [upgradeType, definition] of Object.entries(this.upgradeDefinitions)) {
      const categoryBtn = document.createElement('button');
      categoryBtn.className = 'hangar-category-button';
      if (this.selectedCategory === upgradeType) {
        categoryBtn.classList.add('active');
      }
      const isActive = this.selectedCategory === upgradeType;
      categoryBtn.style.cssText = `
        display: flex !important;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        text-align: left;
        background: ${isActive ? 'linear-gradient(180deg, rgba(30, 50, 70, 0.98), rgba(20, 40, 60, 0.98))' : 'linear-gradient(180deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 30, 0.95))'};
        border: 2.5px solid ${isActive ? 'rgba(100, 255, 200, 0.9)' : 'rgba(77, 227, 255, 0.75)'};
        color: ${isActive ? 'rgba(100, 255, 200, 1)' : 'rgba(245,250,255,0.94)'};
        font-size: 14px;
        font-weight: 700;
        transition: all 0.2s;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 13;
        box-shadow: ${isActive ? 
          '0 0 30px rgba(100, 255, 200, 0.5), 0 0 50px rgba(100, 255, 200, 0.2), 0 15px 38px rgba(0,0,0,.25), 0 2.5px 0 rgba(255,255,255,.12) inset' : 
          '0 0 25px rgba(77, 227, 255, 0.3), 0 15px 38px rgba(0,0,0,.25), 0 2.5px 0 rgba(255,255,255,.12) inset'};
      `;
      categoryBtn.innerHTML = `
        <span style="font-size: 20px;">${definition.icon}</span>
        <span>${definition.name}</span>
      `;
      
      categoryBtn.addEventListener('click', () => {
        this.selectedCategory = upgradeType;
        this.render();
      });
      
      this.hangarCategories.appendChild(categoryBtn);
    }
    
    // Back-Button am Ende der linken Spalte hinzufügen
    const backBtn = document.createElement('button');
    backBtn.id = 'shopBackBtn';
    backBtn.className = 'hangar-category-button';
    backBtn.style.cssText = `
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px 20px;
      margin-top: auto;
      background: linear-gradient(180deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 30, 0.95));
      border: 2.5px solid rgba(77, 227, 255, 0.75);
      color: rgba(245,250,255,0.94);
      font-family: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.2s ease;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 13;
      box-shadow: 
        0 0 25px rgba(77, 227, 255, 0.3),
        0 15px 38px rgba(0,0,0,.25),
        0 2.5px 0 rgba(255,255,255,.12) inset;
    `;
    backBtn.textContent = 'Back';
    backBtn.addEventListener('click', () => {
      if (this.onBackClick) {
        this.onBackClick();
      }
    });
    this.hangarCategories.appendChild(backBtn);
    
    console.log('renderCategories() abgeschlossen - Kategorien gerendert:', this.hangarCategories.children.length);
  }
  
  /**
   * Rendert die Items (Upgrade-Stufen) der gewählten Kategorie in der rechten Spalte
   */
  renderItems() {
    if (!this.hangarItems) {
      console.error('hangarItems nicht gefunden in renderItems()');
      return;
    }
    
    // Credits-Anzeige behalten, nur Items löschen
    let creditsDisplay = this.hangarItems.querySelector('#hangarCreditsDisplay');
    this.hangarItems.innerHTML = '';
    
    // Credits-Anzeige wieder einfügen oder erstellen (als erstes Element)
    if (!creditsDisplay) {
      // Credits-Anzeige erstellen, falls sie noch nicht existiert
      creditsDisplay = document.getElementById('hangarCreditsDisplay');
    }
    if (creditsDisplay) {
      this.hangarItems.appendChild(creditsDisplay);
      creditsDisplay.style.display = 'flex';
    }
    
    const definition = this.upgradeDefinitions[this.selectedCategory];
    if (!definition) {
      console.error('Definition nicht gefunden für:', this.selectedCategory);
      return;
    }
    
    const maxLevel = definition.maxLevel;
    console.log('renderItems() - Kategorie:', this.selectedCategory, 'maxLevel:', maxLevel);
    
    // Alle Stufen von 1 bis maxLevel rendern (Level 0 ist Standard und wird nicht angezeigt)
    const currentLevel = this.upgradeSystem.getLevel(this.selectedCategory); // Einmal außerhalb der Schleife holen für Konsistenz
    
    for (let level = 1; level <= maxLevel; level++) {
      const isOwned = level <= currentLevel;
      const isNext = level === currentLevel + 1;
      // Für alle Kategorien zeigen wir alle Level immer an, aber nur das nächste verfügbare Level ist kaufbar
      const showItem = true; // Alle Level werden immer angezeigt
      // Nur das nächste Level ist kaufbar
      const isAvailable = isNext;
      // Preis nur setzen, wenn das Level verfügbar ist
      const price = isAvailable ? this.upgradeSystem.getPrice(this.selectedCategory, level) : null;
      const canAfford = price !== null && this.upgradeSystem.canAfford(this.selectedCategory, level);
      
      // Alle Items rendern
      const itemElement = this.createItemElement(this.selectedCategory, definition, level, isOwned, isAvailable, price, canAfford);
      this.hangarItems.appendChild(itemElement);
    }
    
    console.log('renderItems() abgeschlossen - Items gerendert:', this.hangarItems.children.length);
  }
  
  /**
   * Erstellt ein Item-Element für eine bestimmte Stufe
   */
  createItemElement(upgradeType, definition, level, isOwned, isAvailable, price, canAfford) {
    const container = document.createElement('div');
    const borderColor = isOwned ? 'rgba(100, 255, 200, 0.75)' : (isAvailable && canAfford ? 'rgba(77, 227, 255, 0.75)' : 'rgba(100, 100, 120, 0.4)');
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      background: linear-gradient(180deg, rgba(20, 25, 40, 0.95), rgba(10, 15, 30, 0.95)); /* Matt, undurchsichtig wie andere Menüs */
      backdrop-filter: none;
      border: 2.5px solid ${borderColor};
      border-radius: 14px;
      transition: all 0.2s ease;
      position: relative;
      z-index: 103;
      min-height: 80px;
      width: 100%;
      box-sizing: border-box;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto;
      box-shadow: 
        0 0 25px ${isOwned ? 'rgba(100, 255, 200, 0.3)' : (isAvailable && canAfford ? 'rgba(77, 227, 255, 0.3)' : 'rgba(0,0,0,0.2)')},
        0 15px 38px rgba(0,0,0,.25),
        0 2.5px 0 rgba(255,255,255,.12) inset;
    `;
    
    // Header mit Icon und Name
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    
    // Für weapon (Multi Fire), overheat (Thermal Control), speed (Speed Control), shield und dash (Boost System) verwenden wir spezielle Namen ohne Level-Nummer und ohne Untertitel
    const levelName = ((upgradeType === 'weapon' || upgradeType === 'overheat' || upgradeType === 'speed' || upgradeType === 'shield' || upgradeType === 'dash') && definition.getLevelName) 
      ? definition.getLevelName(level) 
      : `${definition.name} Level ${level}`;
    
    // Untertitel nur anzeigen, wenn es nicht weapon, overheat, speed, shield oder dash ist
    const showSubtitle = upgradeType !== 'weapon' && upgradeType !== 'overheat' && upgradeType !== 'speed' && upgradeType !== 'shield' && upgradeType !== 'dash';
    
    header.innerHTML = `
      <span style="font-size: 24px;">${definition.icon}</span>
      <div style="flex: 1;">
        <div style="font-family: 'Orbitron', ui-sans-serif, system-ui, sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(245,250,255,0.94);">${levelName}</div>
        ${showSubtitle ? `<div style="font-size: 13px; color: rgba(245,250,255,0.7); margin-top: 4px;">${definition.getLevelDescription(level)}</div>` : ''}
      </div>
    `;
    container.appendChild(header);
    
    // Status und Preis
    const statusRow = document.createElement('div');
    statusRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 8px;';
    
    if (isOwned) {
      const statusBadge = document.createElement('span');
      statusBadge.style.cssText = 'padding: 4px 12px; background: rgba(100, 255, 200, 0.2); color: rgba(100, 255, 200, 1); border-radius: 4px; font-size: 12px; font-weight: 600;';
      statusBadge.textContent = 'EQUIPPED';
      statusRow.appendChild(statusBadge);
    } else if (isAvailable && price !== null) {
      const priceDisplay = document.createElement('span');
      priceDisplay.style.cssText = `font-size: 16px; font-weight: bold; color: ${canAfford ? 'rgba(100,255,200,1)' : 'rgba(255,100,100,1)'};`;
      priceDisplay.textContent = `${price.toLocaleString()} Credits`;
      statusRow.appendChild(priceDisplay);
      
      const buyButton = document.createElement('button');
      buyButton.className = 'btn';
      buyButton.textContent = canAfford ? 'Buy' : 'Not enough credits';
      buyButton.disabled = !canAfford;
      buyButton.style.cssText = canAfford ? '' : 'opacity: 0.5; cursor: not-allowed;';
      buyButton.addEventListener('click', () => {
        if (canAfford && this.upgradeSystem.buyUpgrade(upgradeType, level)) {
          if (this.onUpgradePurchased) {
            this.onUpgradePurchased(upgradeType, level);
          }
          this.render(); // Shop neu rendern
        }
      });
      statusRow.appendChild(buyButton);
    } else {
      const lockedBadge = document.createElement('span');
      lockedBadge.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(255, 100, 100, 0.2); color: rgba(255, 100, 100, 1); border-radius: 4px; font-size: 12px; font-weight: 600;';
      lockedBadge.innerHTML = '🔒 LOCKED';
      statusRow.appendChild(lockedBadge);
    }
    
    container.appendChild(statusRow);
    
    return container;
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
    // Shop neu rendern, damit Items aktualisiert werden
    this.render();
  }
}

