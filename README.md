
```
npm install lean4monaco
```

(TODO: This repo must be published on npm for this to work)


```ts
import { LeanMonaco, LeanMonacoEditor } from 'lean4monaco'

[...]

useEffect(() => {
    const leanMonaco = new LeanMonaco()
    const leanMonacoEditor = new LeanMonacoEditor()

    ;(async () => {
        await leanMonaco.start('ws://localhost:8080/websocket/mathlib-demo')
        leanMonaco.setInfoviewElement(infoviewRef.current)
        await leanMonacoEditor.start(codeviewRef.current!, '/project/test.lean', '#check Nat')
    })()

    return () => {
        leanMonacoEditor.dispose()
        leanMonaco.dispose()
    }
})
```

For some reason, the file (here `test.lean`) cannot be at the root of the file system, i.e., not `/test.lean` instead of `/project/test.lean`.


```
npm install vite-plugin-node-polyfills memfs 
```

```
npm install 'https://gitpkg.vercel.app/abentkamp/monacotest2/esbuild-import-meta-url-plugin?main' --save-dev
```


```ts
// vite.config.ts
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

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
  ],
}