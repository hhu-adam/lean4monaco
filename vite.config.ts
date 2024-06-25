import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  plugins: [
    nodePolyfills(),
    commonjs()
  ],
}