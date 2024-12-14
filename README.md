[![GitHub license](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/hhu-adam/lean4monaco/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/lean4monaco.svg)](https://www.npmjs.com/package/lean4monaco)
[![(Runtime) Build and Test](https://github.com/hhu-adam/lean4monaco/actions/workflows/test.yml/badge.svg)](https://github.com/hhu-adam/lean4monaco/actions/workflows/test.yml)

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
import { LeanMonaco, LeanMonacoEditor, LeanMonacoOptions } from 'lean4monaco'

[...]

// Refs for the editor and infoview
const editorRef = useRef<HTMLDivElement>(null)
const infoviewRef = useRef<HTMLDivElement>(null)

// Lean4monaco options
const [options, setOptions] = useState<LeanMonacoOptions>({
  websocket: {
    url: 'ws://localhost:8080/'
  },
  htmlElement: undefined, // The wrapper div for monaco
  vscode: {
    "editor.wordWrap": true,
  }
})

// Optional: restrict monaco's extend (e.g. context menu) to the editor itself
useEffect(() => {
  setOptions({...options, htmlElement: editorRef.current ?? undefined})
}, [editorRef])

// Start infoview and editor(s)
useEffect(() => {
  // You must create a single `LeanMonaco` instance (infoview), but you can create multiple
  // `LeanMonacoEditor` instances (editor)
  // You must await `leanMonaco.start` or use `await leanMonaco.whenReady` before
  // starting the editors!
  const leanMonaco = new LeanMonaco()
  const leanMonacoEditor = new LeanMonacoEditor()

  leanMonaco.setInfoviewElement(infoviewRef.current!)

  ;(async () => {
    await leanMonaco.start(options)
    await leanMonacoEditor.start(editorRef.current!, '/project/test.lean', '#check Nat')
  })()

  return () => {
    leanMonaco.dispose()
    leanMonacoEditor.dispose()
  }
}, [options, infoviewRef, editorRef])
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

Ideally you clone this repo using `git clone --recurse-submodules <ssh/https address>` to load the included submodule.
(alternatively, call `git submodule init && git submodule update` inside the cloned the repo).

Afterwards, you can run the demo with

```
cd lean4monaco
npm install
npm run setup_demo # this builds lean4monaco and calls `npm install` in `demo/`
npm start
```

and open [localhost:5173](http://localhost:5173). This should open a rudimentary webpage
with 1 (or more) monaco editors and an infoview, showing the Lean infos at the cursor.

## Troubleshooting

Some random errors we encountered. If you have more, please share them.

* Make sure that only one version of the npm package `monaco-vscode-api` is installed. The error I typically got is:

  ```
  this._configurationService.onDidChangeConfiguration is not a function
  ```

### Warnings on `npm install`

* Warnings about `glob` and `inflight` come from `copyfiles`: see [copyfiles#132](https://github.com/calvinmetcalf/copyfiles/pull/132)
* Warning about ` @types/cypress` comes from `cypress-iframe`

## Development

You can run

```
npm install
npm test
```

for the automated cypress tests.

### Docker image

There is a `Dockerfile` which defines an image where the server is run in a Linux container.
You can look at the github workflow to see how it is used; in particular the image can
be built with

```
docker build  -t lean4monaco .
```

and then started with

```
docker run -it -p 5173:5173 -p 8080:8080 lean4monaco
```

Now the demo should be accessible at [localhost:5173](http://localhost:5173).

This is an alternative to calling `npm start`, but it
does not have some feature such as auto-reload
on edit.
