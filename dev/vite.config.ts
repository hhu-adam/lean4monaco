import { nodePolyfills } from 'vite-plugin-node-polyfills'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
import path from 'node:path'

export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  plugins: [
    nodePolyfills({
      overrides: {
        fs: 'memfs',
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, '../node_modules/@leanprover/infoview/dist/*.production.min.js')),
          dest: 'infoview'
        }
      ]
    })
  ],
}