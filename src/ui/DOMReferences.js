/**
 * Zentrale DOM-Element-Referenzen
 * Alle DOM-Selektionen an einem Ort
 */

export const DOM = {
  // Canvas
  canvas: null,
  ctx: null,
  
  // Overlay & Screens
  overlay: null,
  titleScreen: null,
  startJourneySection: null,
  mainMenuSection: null,
  mainMenuCard: null,
  mainMenuButtons: null,
  levelSelectContent: null,
  settingsContent: null,
  gameMenuContent: null,
  shopContent: null,
  levelSelect: null,
  levelList: null,
  levelComplete: null,
  gameComplete: null,
  gameOver: null,
  pauseMenu: null,
  
  // Buttons - Main Menu
  startJourneyBtn: null,
  newGameBtn: null,
  continueBtn: null,
  settingsBtn: null,
  backToTitleFromMainBtn: null,
  
  // Buttons - Game Menu
  levelSelectMenuBtn: null,
  shopBtn: null,
  gameMenuBackBtn: null,
  shopBackBtn: null,
  
  // Buttons - Level Select
  backToTitleBtn: null,
  
  // Buttons - Level Complete
  nextLevelBtn: null,
  backToLevelSelectBtn: null,
  backToLevelSelectFromCompleteBtn: null,
  levelCompleteTitle: null,
  levelCompleteText: null,
  
  // Buttons - Game Over
  retryLevelFromGameOverBtn: null,
  backToGameMenuFromGameOverBtn: null,
  
  // Buttons - New Game Warning
  newGameWarning: null,
  confirmNewGameBtn: null,
  cancelNewGameBtn: null,
  
  // Buttons - Settings
  settingsBackBtn: null,
  
  // Buttons - Pause
  resumeBtn: null,
  pauseToLevelSelectBtn: null,
  
  // Settings Controls
  musicVolumeSlider: null,
  sfxVolumeSlider: null,
  musicVolumeValue: null,
  sfxVolumeValue: null,
  
  // Title Starfield
  titleStarfieldCanvas: null,
  titleStarfieldCtx: null
};

/**
 * Initialisiert alle DOM-Referenzen
 */
export function initDOMReferences() {
  DOM.canvas = document.getElementById('c');
  DOM.ctx = DOM.canvas.getContext('2d');
  DOM.ctx.imageSmoothingEnabled = true;
  
  DOM.overlay = document.getElementById('overlay');
  DOM.titleScreen = document.getElementById('titleScreen');
  DOM.startJourneySection = document.getElementById('startJourneySection');
  DOM.mainMenuSection = document.getElementById('mainMenuSection');
  DOM.mainMenuCard = document.getElementById('mainMenuCard');
  DOM.mainMenuButtons = document.getElementById('mainMenuButtons');
  DOM.levelSelectContent = document.getElementById('levelSelectContent');
  DOM.settingsContent = document.getElementById('settingsContent');
  DOM.gameMenuContent = document.getElementById('gameMenuContent');
  DOM.shopContent = document.getElementById('shopContent');
  DOM.levelSelect = document.getElementById('levelSelect');
  DOM.levelList = document.getElementById('levelList');
  DOM.levelComplete = document.getElementById('levelComplete');
  DOM.gameComplete = document.getElementById('gameComplete');
  DOM.gameOver = document.getElementById('gameOver');
  DOM.pauseMenu = document.getElementById('pauseMenu');
  
  DOM.startJourneyBtn = document.getElementById('startJourneyBtn');
  DOM.newGameBtn = document.getElementById('newGameBtn');
  DOM.continueBtn = document.getElementById('continueBtn');
  DOM.settingsBtn = document.getElementById('settingsBtn');
  DOM.backToTitleFromMainBtn = document.getElementById('backToTitleFromMainBtn');
  
  DOM.levelSelectMenuBtn = document.getElementById('levelSelectMenuBtn');
  DOM.shopBtn = document.getElementById('shopBtn');
  DOM.gameMenuBackBtn = document.getElementById('gameMenuBackBtn');
  DOM.shopBackBtn = document.getElementById('shopBackBtn');
  
  DOM.backToTitleBtn = document.getElementById('backToTitleBtn');
  
  DOM.nextLevelBtn = document.getElementById('nextLevelBtn');
  DOM.backToLevelSelectBtn = document.getElementById('backToLevelSelectBtn');
  DOM.backToLevelSelectFromCompleteBtn = document.getElementById('backToLevelSelectFromCompleteBtn');
  DOM.levelCompleteTitle = document.getElementById('levelCompleteTitle');
  DOM.levelCompleteText = document.getElementById('levelCompleteText');
  
  DOM.retryLevelFromGameOverBtn = document.getElementById('retryLevelFromGameOverBtn');
  DOM.backToGameMenuFromGameOverBtn = document.getElementById('backToGameMenuFromGameOverBtn');
  
  DOM.newGameWarning = document.getElementById('newGameWarning');
  DOM.confirmNewGameBtn = document.getElementById('confirmNewGameBtn');
  DOM.cancelNewGameBtn = document.getElementById('cancelNewGameBtn');
  
  DOM.settingsBackBtn = document.getElementById('settingsBackBtn');
  
  DOM.resumeBtn = document.getElementById('resumeBtn');
  DOM.pauseToLevelSelectBtn = document.getElementById('pauseToLevelSelectBtn');
  
  DOM.musicVolumeSlider = document.getElementById('musicVolumeSlider');
  DOM.sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
  DOM.musicVolumeValue = document.getElementById('musicVolumeValue');
  DOM.sfxVolumeValue = document.getElementById('sfxVolumeValue');
  
  DOM.titleStarfieldCanvas = document.getElementById('titleStarfield');
  DOM.titleStarfieldCtx = DOM.titleStarfieldCanvas?.getContext('2d');
}


