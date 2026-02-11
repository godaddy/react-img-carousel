import '@testing-library/jest-dom';

// Mock setImmediate for tests that use it
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
