import './style.css'

import 'vscode/localExtensionHost'
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    return new editorWorker()
  }
}

async function go() {

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="editor"></div>
  </div>
`

const el = document.getElementById('editor')!

const main = {
  text: "#check Nat",
  fileExt: 'lean'
};


const extensionFilesOrContents = new Map<string, string | URL>();
extensionFilesOrContents.set('/language-configuration.json', new URL('./vscode-lean4/language-configuration.json', import.meta.url));
extensionFilesOrContents.set('/syntaxes/lean4.json', new URL('./vscode-lean4/syntaxes/lean4.json', import.meta.url));
extensionFilesOrContents.set('/syntaxes/lean4-markdown.json', new URL('./vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url));
extensionFilesOrContents.set('/syntaxes/codeblock.json', new URL('./vscode-lean4/syntaxes/codeblock.json', import.meta.url));


const userConfig : UserConfig = {
  wrapperConfig: {
    editorAppConfig: {
      $type: 'extended', 
      codeResources: { main },
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

  languageClientConfig: {
    languageId: 'lean4',
    options: {
      $type: 'WebSocketUrl',
      url: 'ws://localhost:8080/websocket/mathlib-demo',
      startOptions: {
        onCall: () => {
          console.log('Connected to socket.');
        },
        reportStatus: true
      },
      stopOptions: {
        onCall: () => {
          console.log('Disconnected from socket.');
        },
        reportStatus: true
      }
    }
  }
}

const wrapper = new MonacoEditorLanguageClientWrapper()
await wrapper.init(userConfig)


const { AbbreviationFeature } = (await import('./vscode-lean4/src/abbreviation'));

new AbbreviationFeature();


await wrapper.start(el)
console.log(wrapper.getEditor().getModel().getLanguageId())



}

go()