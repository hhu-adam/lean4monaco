import { PluginOption, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  plugins: [
    react(),
    nodePolyfills({
      overrides: {
        fs: 'memfs',
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: [
            normalizePath(path.resolve(__dirname, '../node_modules/@leanprover/infoview/dist/*')),
            normalizePath(path.resolve(__dirname, '../dist/webview/webview.js')),
          ],
          dest: 'infoview'
        }
      ]
    }) as PluginOption
  ],
  server: {
    fs: {
      allow: [".."]
    }
  },
})