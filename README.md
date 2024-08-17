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

### Configure vite

(Currently, this is all necessary for a functioning setup. However, we hope to remove some of these
steps in the future and fix them properly.)

For some reason, the file (here `test.lean`) cannot be at the root of the file system, i.e., not `/test.lean` instead of `/project/test.lean`. (TODO: find out why)

#### vite-plugin-node-polyfills

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

#### esbuild-import-meta-url-plugin

For Vite dev mode to work properly, the following plugin is necessary:

```
npm install -D 'https://gitpkg.vercel.app/hhu-adam/lean4monaco/esbuild-import-meta-url-plugin?main'
```

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

This could be replaced by `npm install --save-dev @codingame/esbuild-import-meta-url-plugin` when this PR is accepted: https://github.com/CodinGame/esbuild-import-meta-url-plugin/pull/5

#### infoview

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
            normalizePath(path.resolve(__dirname, './node_modules/lean4monaco/node_modules/@leanprover/infoview/dist/*')),
            normalizePath(path.resolve(__dirname, './node_modules/lean4monaco/dist/webview/webview.js')),
          ],
          dest: 'infoview'
        },
        {
          src: [
            normalizePath(path.resolve(__dirname, './node_modules/lean4monaco/node_modules/@leanprover/infoview/dist/codicon.ttf'))
          ],
          dest: 'assets'
        }
      ]
    })
  ]
}
```

## Demo

`lean4monaco` contains a sample project `lean4monaco/demo/` which you can use for comparison.

If you cloned `lean4monaco` and updated submodules (`git submodule init && git submodule update`), you can run the demo with

```
cd lean4monaco
npm install
npm start
```

and open [http://localhost:5173](http://localhost:5173). This should open a rudimentary webpage
with 1 (or more) monaco editors and an infoview, showing the Lean infos at the cursor.

## Troubleshooting

Some random errors we encountered. If you have more, please share them.

* Make sure that only one version of the npm package `monaco-vscode-api` is installed. The error I typically got is:

  ```
  this._configurationService.onDidChangeConfiguration is not a function
  ```

### Errors on `npm start`

* Errors `[vite] sh: line 1: vite: command not found` or `[vite] Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react'`. Manually install the `demo` dependencies:
```
cd demo
rm -rf package-lock.json
npm install
```

If you don't remove the package lock, you might face:
```
npm WARN tarball tarball data for @codingame/esbuild-import-meta-url-plugin@https://gitpkg.vercel.app/hhu-adam/lean4monaco/esbuild-import-meta-url-plugin?main (sha512-57hwS705QV7vD2U87FNuN7CngCpeakKSPHWJTfJwfbPWNzsQKyaev8M4H1liX+S9PJ6kE/oRiGy/1BU3ZxELHg==) seems to be corrupted. Trying again.
npm ERR! code EINTEGRITY
npm ERR! sha512-57hwS705QV7vD2U87FNuN7CngCpeakKSPHWJTfJwfbPWNzsQKyaev8M4H1liX+S9PJ6kE/oRiGy/1BU3ZxELHg== integrity checksum failed when using sha512: wanted sha512-57hwS705QV7vD2U87FNuN7CngCpeakKSPHWJTfJwfbPWNzsQKyaev8M4H1liX+S9PJ6kE/oRiGy/1BU3ZxELHg== but got sha512-UwN6GRHovlRXN04kllaCtQMxiMACnaylhNoBMVLcDUUwE73rq32ioCTm42pj0TG2DTS1OPmd9XEKfNml9MOnSg==. (1255 bytes)
```

### Warnings on `npm install`

* Warnings about `glob` and `inflight` come from `copyfiles`: see [copyfiles#132](https://github.com/calvinmetcalf/copyfiles/pull/132)
* Warning about ` @types/cypress` comes from `cypress-iframe`