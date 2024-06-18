// TODO: Why does extension->activate not work?
// TODO: WHy do workspaces not work?
// TODO: Infoview does probably not need index.html entrypoint. iframe.open() iframe.wrtie(innerHtml) should also work. (using infoview loader)
// TODO: _character bug in monaco-vscode-api?


import './style.css'
import 'vscode/localExtensionHost'
import * as vscode from 'vscode';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getViewsServiceOverride from '@codingame/monaco-vscode-views-service-override';
import { useOpenEditorStub } from 'monaco-editor-wrapper/vscode/services';
// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import { MonacoEditorLanguageClientWrapper, UserConfig, EditorAppExtended, RegisterLocalProcessExtensionResult } from 'monaco-editor-wrapper';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { LeanClientProvider } from './vscode-lean4/src/utils/clientProvider';
import { LeanInstaller } from './vscode-lean4/src/utils/leanInstaller';
import { LeanClient } from './vscode-lean4/src/leanclient';
import { Uri } from 'vscode';
import { createModelReference } from 'vscode/monaco';
import { InfoProvider } from './vscode-lean4/src/infoview';
import { loadRenderInfoview } from '@leanprover/infoview/loader'

import type { EditorApi } from '@leanprover/infoview';
import { Rpc } from './vscode-lean4/src/rpc';


self.MonacoEnvironment = {
  getWorker(_, label) {
    return new editorWorker()
  }
}

async function go() {

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="editor"></div>
    <div id="infoview"></div>
`

const el = document.getElementById('editor')!

const main = {
  text: "#check Nat",
  uri: Uri.file('/workspace/model.lean')
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

  // languageClientConfig: {
  //   languageId: 'lean4',
  //   options: {
  //     $type: 'WebSocketUrl',
  //     url: 'ws://localhost:8080/websocket/mathlib-demo',
  //     startOptions: {
  //       onCall: () => {
  //         console.log('Connected to socket.');
  //       },
  //       reportStatus: true
  //     },
  //     stopOptions: {
  //       onCall: () => {
  //         console.log('Disconnected from socket.');
  //       },
  //       reportStatus: true
  //     }
  //   }
  // }
}

const wrapper = new MonacoEditorLanguageClientWrapper()
await wrapper.init(userConfig)


const { AbbreviationFeature } = (await import('./vscode-lean4/src/abbreviation'));

new AbbreviationFeature();


await wrapper.start(el)

// here the modelReference is created manually and given to the updateEditorModels of the wrapper
const uri = vscode.Uri.parse('/workspace/test.lean');
console.log(vscode.workspace.workspaceFolders)
const modelRef = await createModelReference(uri, '#check Nat');
wrapper.updateEditorModels({
    modelRef
});

const clientProvider = new LeanClientProvider({installChanged: () => {}, testLeanVersion: () => {return "lean4/stable"}, getElanDefaultToolchain: () => {return "lean4/stable"}} as any, {appendLine: () => {}} as any)

const infoProvider = new InfoProvider(clientProvider, {language: 'lean4'}, {} as any)


// const vscodeApi = wrapper.getApi()

// const rpc = new Rpc((m: any) => vscodeApi.postMessage(m));
// window.addEventListener('message', e => rpc.messageReceived(e.data))
// const editorApi: EditorApi = rpc.getApi();

// const div: HTMLElement | null = document.querySelector('#react_root');
// const script: HTMLOrSVGScriptElement | null = document.currentScript
// if (div && script) {
//     const imports = {
//         '@leanprover/infoview': script.getAttribute('data-importmap-leanprover-infoview')!,
//         'react': script.getAttribute('data-importmap-react')!,
//         'react/jsx-runtime': script.getAttribute('data-importmap-react-jsx-runtime')!,
//         'react-dom': script.getAttribute('data-importmap-react-dom')!,
//     }
//     loadRenderInfoview(imports, [editorApi, div], api => rpc.register(api));
// }


// const infoviewEl = document.getElementById('editor')!
// const imports = {
//   '@leanprover/infoview': `${window.location.origin}/index.production.min.js`,
//   'react': `${window.location.origin}/react.production.min.js`,
//   'react/jsx-runtime': `${window.location.origin}/react-jsx-runtime.production.min.js`,
//   'react-dom': `${window.location.origin}/react-dom.production.min.js`,
//   'react-popper': `${window.location.origin}/react-popper.production.min.js`
// }
// loadRenderInfoview(imports, [infoProvider.getApi(), infoviewEl])

}

go()