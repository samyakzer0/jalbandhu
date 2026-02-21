// Browser polyfills for Node.js APIs required by natural.js and pg-types
import { Buffer } from 'buffer';
import path from 'path-browserify';

// Make Buffer available globally
(window as any).Buffer = Buffer;

// Make process available globally
(window as any).process = {
  env: {},
  version: 'v18.0.0',
  browser: true,
  cwd: () => '/',
  nextTick: (fn: Function) => setTimeout(fn, 0)
};

// Make global available
(window as any).global = window;

// Make path available globally
(window as any).path = path;

export {};
