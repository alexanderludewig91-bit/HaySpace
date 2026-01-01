export class InputSystem {
  constructor() {
    this.keys = new Set();
    this.hardMode = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys.add(e.code);
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  has(key) {
    return this.keys.has(key);
  }

  toggleHardMode() {
    this.hardMode = !this.hardMode;
  }
}




