/**
 * Upgrade-System für Raumschiff-Upgrades
 * Verwaltet Upgrades, Preise und LocalStorage
 */

export class UpgradeSystem {
  constructor() {
    console.log('🔧 UpgradeSystem constructor aufgerufen');
    // Upgrade-Stufen (0 = nicht gekauft, 1+ = gekauft)
    this.upgrades = {
      weapon: 0,        // 0-2 (1→2→3 Schüsse)
      overheat: 0,     // 0-3 (15%, 30%, 50% langsamer)
      speed: 0,         // 0-5 (+0.2, +0.4, +0.6, +0.8, +1.0)
      dash: 0,          // 0-1 (aktiviert/deaktiviert)
      shield: 0         // 0-5 (+20%, +40%, +60%, +80%, +100%)
    };
    
    // Credits (kumulativ, verfallen nicht)
    this.credits = 0;
    
    // Upgrade-Preise (steigend pro Stufe)
    this.prices = {
      weapon: [500, 1000],           // Stufe 1, Stufe 2
      overheat: [400, 800, 1500],    // Stufe 1, Stufe 2, Stufe 3
      speed: [300, 600, 1000, 1500, 2500],  // Stufe 1-5
      dash: [800],                   // Stufe 1
      shield: [400, 800, 1200, 1800, 2500]  // Stufe 1-5
    };
    
    console.log('🔧 Vor loadFromLocalStorage - this.upgrades:', this.upgrades);
    this.loadFromLocalStorage();
    console.log('🔧 Nach loadFromLocalStorage - this.upgrades:', this.upgrades);
  }
  
  /**
   * Lädt Upgrades und Credits aus LocalStorage
   */
  loadFromLocalStorage() {
    const saved = localStorage.getItem('upgrades');
    console.log('💾 loadFromLocalStorage() - saved:', saved);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        console.log('💾 Parsed data:', data);
        console.log('💾 data.upgrades:', data.upgrades);
        this.upgrades = { ...this.upgrades, ...data.upgrades };
        this.credits = data.credits || 0;
        console.log('💾 Nach Laden - this.upgrades:', this.upgrades);
        console.log('💾 Nach Laden - this.credits:', this.credits);
      } catch (e) {
        console.warn('Fehler beim Laden der Upgrades:', e);
      }
    } else {
      console.log('💾 Keine gespeicherten Upgrades gefunden');
    }
  }
  
  /**
   * Speichert Upgrades und Credits in LocalStorage
   */
  saveToLocalStorage() {
    const data = {
      upgrades: this.upgrades,
      credits: this.credits
    };
    localStorage.setItem('upgrades', JSON.stringify(data));
  }
  
  /**
   * Fügt Credits hinzu
   */
  addCredits(amount) {
    this.credits += amount;
    this.saveToLocalStorage();
  }
  
  /**
   * Setzt Credits (für New Game)
   */
  setCredits(amount) {
    this.credits = amount;
    this.saveToLocalStorage();
  }
  
  /**
   * Gibt aktuellen Credit-Stand zurück
   */
  getCredits() {
    return this.credits;
  }
  
  /**
   * Prüft ob ein Upgrade gekauft werden kann
   */
  canAfford(upgradeType, level) {
    const price = this.getPrice(upgradeType, level);
    return price !== null && this.credits >= price;
  }
  
  /**
   * Gibt den Preis für ein Upgrade zurück
   */
  getPrice(upgradeType, level) {
    const upgradePrices = this.prices[upgradeType];
    if (!upgradePrices || level < 1 || level > upgradePrices.length) {
      return null;
    }
    return upgradePrices[level - 1];
  }
  
  /**
   * Gibt die maximale Stufe für ein Upgrade zurück
   */
  getMaxLevel(upgradeType) {
    return this.prices[upgradeType]?.length || 0;
  }
  
  /**
   * Gibt die aktuelle Stufe eines Upgrades zurück
   */
  getLevel(upgradeType) {
    return this.upgrades[upgradeType] || 0;
  }
  
  /**
   * Kauft ein Upgrade
   * @returns {boolean} true wenn erfolgreich, false wenn nicht genug Credits oder bereits max Stufe
   */
  buyUpgrade(upgradeType, level) {
    // Prüfe ob bereits auf dieser oder höheren Stufe
    if (this.upgrades[upgradeType] >= level) {
      return false;
    }
    
    // Prüfe ob Vorgänger-Stufen gekauft wurden
    if (level > 1 && this.upgrades[upgradeType] < level - 1) {
      return false;
    }
    
    // Prüfe ob genug Credits vorhanden
    const price = this.getPrice(upgradeType, level);
    if (!price || this.credits < price) {
      return false;
    }
    
    // Kaufe Upgrade
    this.credits -= price;
    this.upgrades[upgradeType] = level;
    this.saveToLocalStorage();
    return true;
  }
  
  /**
   * Setzt alle Upgrades zurück (für New Game)
   */
  reset() {
    this.upgrades = {
      weapon: 0,
      overheat: 0,
      speed: 0,
      dash: 0,
      shield: 0
    };
    this.credits = 0;
    this.saveToLocalStorage();
  }
  
  /**
   * Gibt die berechneten Werte für das Spiel zurück
   */
  getGameValues() {
    console.log('🔍 getGameValues() aufgerufen');
    console.log('🔍 this.upgrades:', this.upgrades);
    console.log('🔍 this.upgrades.weapon:', this.upgrades.weapon);
    console.log('🔍 this.upgrades.speed:', this.upgrades.speed);
    console.log('🔍 this.upgrades.shield:', this.upgrades.shield);
    console.log('🔍 this.upgrades.dash:', this.upgrades.dash);
    console.log('🔍 this.upgrades.overheat:', this.upgrades.overheat);
    
    const values = {
      // Waffen-Level: Shop-Upgrade + 1 (weil Level 0 = 1 Schuss, Level 1 = 2 Schüsse, etc.)
      weaponLevel: this.upgrades.weapon + 1,
      
      // Overheat Protection: Reduziert Heat-Cost um X%
      overheatReduction: this.upgrades.overheat === 0 ? 0 : 
                        this.upgrades.overheat === 1 ? 0.15 :
                        this.upgrades.overheat === 2 ? 0.30 : 0.50,
      
      // Speed Boost: Startwert 1.0 + Upgrade-Wert
      speedBoost: 1.0 + (this.upgrades.speed * 0.2),
      
      // Dash: Aktiviert wenn Stufe >= 1
      dashEnabled: this.upgrades.dash >= 1,
      
      // Shield: Basis 100 + Prozent-Erhöhung
      shieldMax: 100 * (1 + (this.upgrades.shield * 0.2))
    };
    
    console.log('🔍 Berechnete Werte:', values);
    return values;
  }
}

