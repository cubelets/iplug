import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';
import cleanup from 'rollup-plugin-cleanup';

const {
  name,
  main,
  module,
  peerDependencies,
} = require('./package.json');

const sourcemap = true;

const external = [...Object.keys(peerDependencies || {})];

const camelize = s => s.replace(/-./g, x=>x.toUpperCase()[1])

export default {
  input: 'src/index.js',
	output: [
		{ file: main,   format: 'cjs', sourcemap, exports: 'default' },
		{ file: module, format: 'es',  sourcemap },
	],
  external,
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps(),
    terser(),
    cleanup({ sourcemap }),
    visualizer({ filename: './doc/bundle-stats.html', sourcemap }),
  ],
}
