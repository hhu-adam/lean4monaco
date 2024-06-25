// import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import type { Plugin } from 'esbuild'
import * as fs from 'fs'
import url from 'url'
import { resolve } from 'import-meta-resolve'

// Fix for @codingame/esbuild-import-meta-url-plugin, see https://github.com/CodinGame/esbuild-import-meta-url-plugin/pull/5
// TODO: remove this when pull request gets accepted
const importMetaUrlPlugin : Plugin ={
  name: 'import.meta.url',
  setup ({ onLoad }) {
    // Help vite that bundles/move files in dev mode without touching `import.meta.url` which breaks asset urls
    onLoad({ filter: /.*\.js$/, namespace: 'file' }, async args => {
      const code = fs.readFileSync(args.path, 'utf8')

      const assetImportMetaUrlRE = /\bnew\s+URL\s*\(\s*('[^']+'|"[^"]+"|`[^`]+`)\s*,\s*import\.meta\.url\s*(?:,\s*)?\)/g
      let i = 0
      let newCode = ''
      for (let match = assetImportMetaUrlRE.exec(code); match != null; match = assetImportMetaUrlRE.exec(code)) {
        newCode += code.slice(i, match.index)

        const path = match[1]!.slice(1, -1)
        const resolved = resolve!(path, url.pathToFileURL(args.path).toString())

        newCode += `new URL(${JSON.stringify(url.fileURLToPath(resolved))}, import.meta.url)`

        i = assetImportMetaUrlRE.lastIndex
      }
      newCode += code.slice(i)

      return { contents: newCode }
    })
  }
}

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