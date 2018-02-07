import { JSDOM } from 'jsdom';
import { stub } from 'sinon';

const document = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { resourceLoader: stub().yields(null, '') });
global.window = document.window;
global.document = window.document;
global.navigator = { userAgent: 'node.js' };
