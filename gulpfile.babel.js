import 'babel-polyfill';
import gulp from 'gulp';
import baseTestTasks from 'godaddy-test-tools';

import './test/unit/setup'; // Workaround for tests using React

baseTestTasks(gulp, {
  es6: true,
  sourceFiles: 'src/**/*.js',
  unitTestFiles: 'test/unit/**/*.tests.js'
});
