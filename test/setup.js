const { JSDOM } = require('jsdom');
const Enzyme = require('enzyme');
const AdapterModule = require('@cfaester/enzyme-adapter-react-18');
const Adapter = AdapterModule.default || AdapterModule;

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;

// Use Object.defineProperty for navigator since it's read-only in Node.js 24+
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true
});

// Copy window properties to global
Object.keys(dom.window).forEach((key) => {
  if (typeof global[key] === 'undefined') {
    try {
      global[key] = dom.window[key];
    } catch (e) {
      // Some properties may be read-only, skip them
    }
  }
});

// Configure Enzyme with React 18 adapter
Enzyme.configure({ adapter: new Adapter() });
