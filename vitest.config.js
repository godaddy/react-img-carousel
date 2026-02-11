import { defineConfig } from 'vitest/config';
import babel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        presets: [
          ['@babel/preset-env', { 
            shippedProposals: true,
            modules: false  // Preserve ES modules
          }],
          '@babel/preset-react'
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
          'inline-react-svg'
        ]
      },
      filter: /\.[jt]sx?$/
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    include: ['test/**/*.tests.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.js'],
      exclude: ['src/stories/**']
    }
  }
});
