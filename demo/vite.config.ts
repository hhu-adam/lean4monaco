import { PluginOption, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import importMetaUrlPlugin from 'lean4monaco/esbuild-import-meta-url-plugin/esbuildImportMetaUrlPlugin'
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
            // note: if you install `lean4monaco` via npm, this line need to change, see README.
            normalizePath(path.resolve(__dirname, '../dist/webview/webview.js')),
          ],
          dest: 'infoview'
        }
      ]
    })
  ],
  server: {
    fs: {
      // only needed because `demo` lies inside the `lean4monaco` folder
      allow: [".."]
    }
  },
})