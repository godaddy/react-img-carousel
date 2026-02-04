Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  get() {
    return parseFloat(this.style.width) || 0;
  }
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  get() {
    return parseFloat(this.style.height) || 0;
  }
});
