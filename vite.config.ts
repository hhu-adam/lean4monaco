import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath } from 'url'

export default {
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        webview: fileURLToPath(new URL('./src/vscode-lean4/webview/index.html', import.meta.url)),
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  plugins: [
    nodePolyfills(),
  ],
}