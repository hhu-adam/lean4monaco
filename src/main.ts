// TODO: Why does extension->activate not work?
// TODO: WHy do workspaces not work?
// TODO: Infoview using infoview loader?
// TODO: _character bug in monaco-vscode-api?
// TODO: Why does wrapper.init() not call editorApp.init()?

import './style.css'
import 'vscode/localExtensionHost'
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { LeanClientProvider } from './monaco-lean4/vscode-lean4/src/utils/clientProvider';
import { Uri } from 'vscode';
import { InfoProvider } from './monaco-lean4/vscode-lean4/src/infoview';
import { AbbreviationFeature } from './monaco-lean4/vscode-lean4/src/abbreviation/AbbreviationFeature';
import { LeanTaskGutter } from './monaco-lean4/vscode-lean4/src/taskgutter';
import { IFrameInfoWebviewFactory } from './infowebview'
import { setupMonacoClient } from './monacoleanclient';
import { checkLean4ProjectPreconditions } from './preconditions'
import { fs } from 'memfs';
import { ExtUri } from './monaco-lean4/vscode-lean4/src/utils/exturi';


class LeanMonaco {

wrapper: MonacoEditorLanguageClientWrapper
clientProvider: LeanClientProvider
infoProvider: InfoProvider
iframeWebviewFactory : IFrameInfoWebviewFactory
abbreviationFeature: AbbreviationFeature
taskGutter: LeanTaskGutter


async init () {

  if (! window.MonacoEnvironment?.getWorker) {
    type WorkerLoader = () => Worker
    const workerLoaders: Partial<Record<string, WorkerLoader>> = {
      editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
      textMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
    }
    window.MonacoEnvironment = {
      getWorker: function (moduleId, label) {
        const workerFactory = workerLoaders[label]
        if (workerFactory != null) {
          return workerFactory()
        }
        throw new Error(`Unimplemented worker ${label} (${moduleId})`)
      }
    }
  }

  const fileName = '/test.lean'


  fs.writeFileSync(fileName, '');

  const extensionFilesOrContents = new Map<string, string | URL>();
  extensionFilesOrContents.set('/language-configuration.json', new URL('./monaco-lean4/vscode-lean4/language-configuration.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/lean4.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/lean4.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/lean4-markdown.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/codeblock.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/codeblock.json', import.meta.url));

  const userConfig : UserConfig = {
    wrapperConfig: {
      editorAppConfig: {
        $type: 'extended',
        codeResources: {
          main: {
            uri: fileName,
            text: '#check Nat'
          }
        },
        extensions: [{
          config: {
              name: 'lean4web',
              publisher: 'leanprover-community',
              version: '1.0.0',
              engines: {
                  vscode: '*'
              },
              "contributes": {
                "languages": [
                  {
                    "id": "lean4",
                    "configuration": "./language-configuration.json",
                    "extensions": [
                      ".lean"
                    ],
                  },
                  {
                    "id": "lean4markdown",
                    "aliases": [],
                    "extensions": [
                      ".lean4markdown"
                    ],
                    "configuration": "./language-configuration.json"
                  }
                ],
                "grammars": [
                  {
                    "language": "lean4",
                    "scopeName": "source.lean4",
                    "path": "./syntaxes/lean4.json"
                  },
                  {
                    "language": "lean4markdown",
                    "scopeName": "source.lean4.markdown",
                    "path": "./syntaxes/lean4-markdown.json"
                  },
                  {
                    "scopeName": "markdown.lean4.codeblock",
                    "path": "./syntaxes/codeblock.json",
                    "injectTo": [
                      "text.html.markdown"
                    ],
                    "embeddedLanguages": {
                      "meta.embedded.block.lean4": "lean4"
                    }
                  }
                ],
              }
          },
          filesOrContents: extensionFilesOrContents
        }],
        
      }
    },
  }

  this.wrapper = new MonacoEditorLanguageClientWrapper()
  await this.wrapper.init(userConfig)
  await this.wrapper.getMonacoEditorApp().init()
  
  this.abbreviationFeature = new AbbreviationFeature({} as any);

  this.clientProvider = new LeanClientProvider(
    {
      installChanged: () => {},
      testLeanVersion: () => {return "lean4/stable"},
      getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
      {appendLine: () => {}
    } as any,
    setupMonacoClient,
    checkLean4ProjectPreconditions,
    (docUri: ExtUri) => { return true }
  )

  this.taskGutter = new LeanTaskGutter(this.clientProvider, {asAbsolutePath: (path) => Uri.parse(`${new URL('monaco-lean4/vscode-lean4/' + path, import.meta.url)}`),} as any)

  this.iframeWebviewFactory = new IFrameInfoWebviewFactory()
  this.infoProvider = new InfoProvider(this.clientProvider, {language: 'lean4'}, {} as any, this.iframeWebviewFactory)

}

async start(editorEl, infoviewEl) {
  this.iframeWebviewFactory.setInfoviewElement(infoviewEl)
  await this.wrapper.getMonacoEditorApp().createEditors(editorEl) // Circumventing wrapper.start() because it calls editorApp.init()
  this.wrapper.getEditor().focus()
}

async stop() {
  //TODO: Wait for start
  await this.clientProvider.dispose()
  await this.wrapper.getModelRefs().modelRef.dispose()
  await this.wrapper.getEditor().dispose()
}

async dispose() {
  //TODO: Wait for init / start
  await this.stop()
  await this.wrapper.dispose()
  await this.infoProvider.dispose()
  await this.taskGutter.dispose()
  await this.clientProvider.dispose()
  await this.abbreviationFeature.dispose()
}
}

(async () => {

const lean = new LeanMonaco()
await lean.init();
await lean.start(document.getElementById('editor')!, document.getElementById('infoview')!);

await lean.dispose();

console.log("---")

const lean2 = new LeanMonaco()
await lean2.init();
await lean2.start(document.getElementById('editor')!, document.getElementById('infoview')!);

})()