/**
 * Gamepad-System für Xbox Controller und andere Gamepads
 * Unterstützt die Web Gamepad API
 */

export class GamepadSystem {
  constructor() {
    this.gamepads = [];
    this.activeGamepadIndex = null;
    this.buttonStates = {
      shoot: false,
      dash: false,
      pause: false,
      menu: false
    };
    this.lastButtonStates = { ...this.buttonStates };
    
  // Button-Mapping für Xbox Controller
  // Standard-Mapping basierend auf Xbox Controller Layout
  this.buttonMap = {
    shoot: 0,        // A Button
    dash: 1,         // B Button
    pause: 9,        // Start Button
    menu: 8,         // Back/Select Button
    shootAlt: 7,     // Right Trigger (RT)
    dashAlt: 6       // Left Trigger (LT)
  };
  
  // Stick Deadzone (verhindert Drift)
  this.deadzone = 0.15;
  
  // Menü-Navigation
  this.menuNavigation = {
    enabled: false,
    currentFocus: 0,
    buttons: [],
    lastDPadState: { up: false, down: false, left: false, right: false },
    navCooldown: 0,
    navCooldownTime: 0.2 // 200ms Cooldown für D-Pad Navigation
  };
    
    this.setupEventListeners();
    this.pollGamepads();
  }
  
  setupEventListeners() {
    // Gamepad verbunden
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad verbunden:', e.gamepad.id);
      this.activeGamepadIndex = e.gamepad.index;
      this.pollGamepads();
    });
    
    // Gamepad getrennt
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad getrennt:', e.gamepad.id);
      if (this.activeGamepadIndex === e.gamepad.index) {
        this.activeGamepadIndex = null;
      }
      this.pollGamepads();
    });
  }
  
  pollGamepads() {
    // Gamepad-Status aktualisieren (muss regelmäßig aufgerufen werden)
    const gamepads = navigator.getGamepads();
    this.gamepads = Array.from(gamepads).filter(g => g !== null);
    
    if (this.gamepads.length > 0 && this.activeGamepadIndex === null) {
      // Ersten verfügbaren Gamepad aktivieren
      this.activeGamepadIndex = this.gamepads[0].index;
    }
  }
  
  getActiveGamepad() {
    this.pollGamepads();
    if (this.activeGamepadIndex !== null) {
      const gamepad = this.gamepads.find(g => g && g.index === this.activeGamepadIndex);
      return gamepad || null;
    }
    return null;
  }
  
  // Bewegung vom Left Stick oder D-Pad
  getMovement() {
    const gamepad = this.getActiveGamepad();
    if (!gamepad) return { x: 0, y: 0 };
    
    let x = 0, y = 0;
    
    // Left Stick (Achsen 0 und 1)
    const stickX = gamepad.axes[0] || 0;
    const stickY = gamepad.axes[1] || 0;
    
    // Deadzone anwenden
    if (Math.abs(stickX) > this.deadzone) {
      x = stickX;
    }
    if (Math.abs(stickY) > this.deadzone) {
      y = stickY;
    }
    
    // D-Pad als Alternative (Buttons 12-15)
    // 12 = D-Pad Up, 13 = D-Pad Down, 14 = D-Pad Left, 15 = D-Pad Right
    if (gamepad.buttons[12]?.pressed) y = -1;
    if (gamepad.buttons[13]?.pressed) y = 1;
    if (gamepad.buttons[14]?.pressed) x = -1;
    if (gamepad.buttons[15]?.pressed) x = 1;
    
    // Normalisieren (falls beide Sticks/D-Pad verwendet werden)
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    
    return { x, y };
  }
  
  // Button-Status prüfen
  isButtonPressed(buttonName) {
    const gamepad = this.getActiveGamepad();
    if (!gamepad) return false;
    
    const buttonIndex = this.buttonMap[buttonName];
    if (buttonIndex === undefined) return false;
    
    const button = gamepad.buttons[buttonIndex];
    return button?.pressed || false;
  }
  
  // Button wurde gerade gedrückt (Edge Detection)
  isButtonJustPressed(buttonName) {
    const current = this.isButtonPressed(buttonName);
    const lastKey = `last_${buttonName}`;
    const last = this.lastButtonStates[lastKey] || false;
    // State für nächsten Frame speichern
    this.lastButtonStates[lastKey] = current;
    // Nur true, wenn Button gerade gedrückt wurde (nicht vorher)
    return current && !last;
  }
  
  // Schießen (A Button oder Right Trigger)
  isShooting() {
    return this.isButtonPressed('shoot') || 
           (this.getActiveGamepad()?.buttons[this.buttonMap.shootAlt]?.pressed && 
            this.getActiveGamepad().buttons[this.buttonMap.shootAlt].value > 0.5);
  }
  
  // Dash (B Button oder Left Trigger)
  isDashing() {
    return this.isButtonPressed('dash') || 
           (this.getActiveGamepad()?.buttons[this.buttonMap.dashAlt]?.pressed && 
            this.getActiveGamepad().buttons[this.buttonMap.dashAlt].value > 0.5);
  }
  
  // Pause (Start Button)
  isPausePressed() {
    return this.isButtonJustPressed('pause');
  }
  
  // Menu/Back (Back Button)
  isMenuPressed() {
    return this.isButtonJustPressed('menu');
  }
  
  // Prüfen ob ein Gamepad verbunden ist
  isConnected() {
    return this.getActiveGamepad() !== null;
  }
  
  // Menü-Navigation aktivieren
  enableMenuNavigation(buttons) {
    // Filtere ungültige Buttons
    const validButtons = (Array.isArray(buttons) ? buttons : Array.from(buttons))
      .filter(btn => btn && btn.nodeType === 1); // Nur echte DOM-Elemente
    
    if (validButtons.length === 0) {
      this.disableMenuNavigation();
      return;
    }
    
    this.menuNavigation.enabled = true;
    this.menuNavigation.buttons = validButtons;
    this.menuNavigation.currentFocus = 0;
    // Stelle sicher, dass der erste Button nicht disabled ist
    while (this.menuNavigation.currentFocus < this.menuNavigation.buttons.length && 
           this.menuNavigation.buttons[this.menuNavigation.currentFocus]?.disabled) {
      this.menuNavigation.currentFocus++;
    }
    if (this.menuNavigation.currentFocus >= this.menuNavigation.buttons.length) {
      this.menuNavigation.currentFocus = 0;
    }
    this.updateMenuFocus();
  }
  
  // Menü-Navigation deaktivieren
  disableMenuNavigation() {
    this.menuNavigation.enabled = false;
    this.menuNavigation.buttons = [];
    this.menuNavigation.currentFocus = 0;
  }
  
  // Fokus auf Button aktualisieren
  updateMenuFocus() {
    if (!this.menuNavigation.enabled || this.menuNavigation.buttons.length === 0) return;
    
    // Alle Buttons zurücksetzen
    this.menuNavigation.buttons.forEach(btn => {
      if (btn && btn.classList) {
        btn.classList.remove('gamepad-focused');
      }
    });
    
    // Fokussierten Button markieren
    const focusedBtn = this.menuNavigation.buttons[this.menuNavigation.currentFocus];
    if (focusedBtn && focusedBtn.classList && !focusedBtn.disabled) {
      focusedBtn.classList.add('gamepad-focused');
      // Button in Viewport scrollen
      focusedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  // D-Pad Navigation
  handleMenuNavigation(dt) {
    if (!this.menuNavigation.enabled || this.menuNavigation.buttons.length === 0) return null;
    
    const gamepad = this.getActiveGamepad();
    if (!gamepad) return null;
    
    // Cooldown aktualisieren
    if (this.menuNavigation.navCooldown > 0) {
      this.menuNavigation.navCooldown -= dt;
    }
    
    let navigation = null;
    let moved = false;
    
    // D-Pad Buttons (12-15)
    const dpadUp = gamepad.buttons[12]?.pressed || false;
    const dpadDown = gamepad.buttons[13]?.pressed || false;
    const dpadLeft = gamepad.buttons[14]?.pressed || false;
    const dpadRight = gamepad.buttons[15]?.pressed || false;
    
    // Edge Detection für D-Pad
    if (dpadUp && !this.menuNavigation.lastDPadState.up && this.menuNavigation.navCooldown <= 0) {
      this.menuNavigation.currentFocus = Math.max(0, this.menuNavigation.currentFocus - 1);
      moved = true;
      this.menuNavigation.navCooldown = this.menuNavigation.navCooldownTime;
    }
    if (dpadDown && !this.menuNavigation.lastDPadState.down && this.menuNavigation.navCooldown <= 0) {
      this.menuNavigation.currentFocus = Math.min(this.menuNavigation.buttons.length - 1, this.menuNavigation.currentFocus + 1);
      moved = true;
      this.menuNavigation.navCooldown = this.menuNavigation.navCooldownTime;
    }
    
    // D-Pad State speichern
    this.menuNavigation.lastDPadState = { up: dpadUp, down: dpadDown, left: dpadLeft, right: dpadRight };
    
    // Fokus aktualisieren wenn bewegt
    if (moved) {
      this.updateMenuFocus();
    }
    
    // A-Button für Bestätigung
    if (this.isButtonJustPressed('shoot')) {
      const focusedBtn = this.menuNavigation.buttons[this.menuNavigation.currentFocus];
      if (focusedBtn && !focusedBtn.disabled) {
        navigation = { action: 'confirm', button: focusedBtn };
      }
    }
    
    // B-Button für Zurück
    if (this.isButtonJustPressed('dash')) {
      navigation = { action: 'back' };
    }
    
    return navigation;
  }
  
  // Update-Methode (sollte jeden Frame aufgerufen werden)
  update(dt = 0.016) {
    this.pollGamepads();
    // Button-States für Edge Detection aktualisieren
    // WICHTIG: lastButtonStates wird in isButtonJustPressed aktualisiert,
    // hier nur die aktuellen States speichern
    this.buttonStates.shoot = this.isShooting();
    this.buttonStates.dash = this.isDashing();
    this.buttonStates.pause = this.isButtonPressed('pause');
    this.buttonStates.menu = this.isButtonPressed('menu');
    
    // D-Pad States für Menü-Navigation aktualisieren (wenn nicht bereits in handleMenuNavigation)
    // Dies wird in handleMenuNavigation gemacht, aber hier als Fallback
  }
  
  // Reset Button States (für Edge Detection)
  resetButtonStates() {
    const gamepad = this.getActiveGamepad();
    if (gamepad) {
      // Alle Button-States zurücksetzen
      for (let i = 0; i < gamepad.buttons.length; i++) {
        this.lastButtonStates[`button_${i}`] = gamepad.buttons[i]?.pressed || false;
      }
    }
    // Spezielle Buttons zurücksetzen
    this.lastButtonStates.shoot = this.isShooting();
    this.lastButtonStates.dash = this.isDashing();
    this.lastButtonStates.pause = this.isButtonPressed('pause');
    this.lastButtonStates.menu = this.isButtonPressed('menu');
  }
}

