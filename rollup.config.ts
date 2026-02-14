import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

// @ts-ignore
import { builtinModules } from 'node:module'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true,
    // Prevents Rollup from adding a "default" property to exports
    // which can break some GitHub Action runtime expectations.
    generatedCode: 'es2015',
    compact: true
  },
  // Treats Node.js internals as external so they aren't bundled
  external: [
    ...builtinModules,
    /^node:/
  ],
  plugins: [
    typescript({
      // Ensures the compiler uses the same settings as your linting/IDE
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      inlineSourceMap: true
    }),
    nodeResolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    commonjs({
      // Critical for @actions/core which is authored in CJS
      ignoreDynamicRequires: true,
      strictRequires: true
    })
  ],
  // Prevents 'this is undefined' warnings in CJS-heavy libraries
  context: 'globalThis'
}