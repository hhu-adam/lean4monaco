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
  text: "params.text",
  fileExt: 'lean'
};

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
            contributes: {
                languages: [{
                    id: 'lean4',
                    extensions: ['.lean'],
                    aliases: ['lean', 'lean4'],
                    // configuration: './langium-configuration.json',
                }],
                // grammars: [{
                //     language: 'langium',
                //     scopeName: 'source.langium',
                //     path: './langium-grammar.json'
                // }]
            }
        },
        // filesOrContents: extensionFilesOrContents
    }]
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