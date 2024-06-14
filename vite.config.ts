import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  plugins: [
    nodePolyfills(),
  ],
}