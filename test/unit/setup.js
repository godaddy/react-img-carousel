import { jsdom } from 'jsdom';
import { stub } from 'sinon';

const document = jsdom(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { resourceLoader: stub().yields(null, '') });
global.window = document.defaultView;
global.document = window.document;
global.navigator = { userAgent: 'node.js' };
