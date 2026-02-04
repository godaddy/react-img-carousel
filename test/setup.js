import '@testing-library/jest-dom';

// Mock setImmediate for tests that use it
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return parseFloat(this.style.width) || 0;
  }
});

Object.defineProperty(window.HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return parseFloat(this.style.height) || 0;
  }
});
