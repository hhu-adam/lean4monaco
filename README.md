# Lean 4 Monaco

Provides browser support for running Lean in a Monaco editor.

This package uses the [VSCode extension
"Lean 4"](https://marketplace.visualstudio.com/items?itemName=leanprover.lean4) and the
[Lean Infoview](https://www.npmjs.com/package/@leanprover/infoview).

## Usage

Install this package in your npm project.

```
npm install lean4monaco
```

The package contains two main classes: `LeanMonaco` and `LeanMonacoEditor`. The
class `LeanMonaco` can only have exactly one active instance and arranges the
correct setup of the Monaco Services and the VSCode API. When it is started,
one or more editors can be created using `LeanMonacoEditor`. Here is an example
how to use the classes using React:

```ts
import { LeanMonaco, LeanMonacoEditor } from 'lean4monaco'

[...]

useEffect(() => {
    const leanMonaco = new LeanMonaco()
    const leanMonacoEditor = new LeanMonacoEditor()

    ;(async () => {
        await leanMonaco.start({websocket: {url: 'ws://localhost:8080/'}})
        leanMonaco.setInfoviewElement(infoviewRef.current)
        await leanMonacoEditor.start(codeviewRef.current!, '/project/test.lean', '#check Nat')
    })()

    return () => {
        leanMonacoEditor.dispose()
        leanMonaco.dispose()
    }
})
```

For some reason, the file (here `test.lean`) cannot be at the root of the file system, i.e., not `/test.lean` instead of `/project/test.lean`. (TODO: find out why)

The package uses the Lean 4 VSCode extension, which is intended to run in a nodejs runtime. Therefore, we need to install node polyfills.
Here is how this can be done if your project uses Vite:
```
npm install vite-plugin-node-polyfills@0.17.0 --save-exact
npm install memfs 
```
(We use version 0.17.0 due to this bug: https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81)

```ts
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default {
  plugins: [
    nodePolyfills({
      overrides: {
        fs: 'memfs',
      },
    }),
  ],
}
```

For Vite dev mode to work properly, the following plugin is necessary:
```
npm install 'https://gitpkg.vercel.app/abentkamp/monacotest2/esbuild-import-meta-url-plugin?ec9666e' --save-dev
```
This could be replaced by `@codingame/esbuild-import-meta-url-plugin` when this PR is accepted: https://github.com/CodinGame/esbuild-import-meta-url-plugin/pull/5

```ts
// vite.config.ts
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

export default {
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  },
  [...]
}
```

Moreover, the infoview javascript files need to be served:
```ts
// vite.config.ts
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
import path from 'node:path'

export default {
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: [
            normalizePath(path.resolve(__dirname, './node_modules/@leanprover/infoview/dist/*.production.min.js')),
            normalizePath(path.resolve(__dirname, './node_modules/lean4monaco/webview/webview.js')),
          ],
          dest: 'infoview'
        }
      ]
    })
  ]
}
```

## Troubleshooting

* Make sure that only one version of the npm package `monaco-vscode-api` is installed.
The error I typically got is:
```
this._configurationService.onDidChangeConfiguration is not a function
```
