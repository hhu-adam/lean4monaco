// TODO: Why does extension->activate not work?
// TODO: WHy do workspaces not work?
// TODO: Infoview does probably not need index.html entrypoint. iframe.open() iframe.wrtie(innerHtml) should also work. (using infoview loader)
// TODO: _character bug in monaco-vscode-api?


import './style.css'
import 'vscode/localExtensionHost'
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { LeanClientProvider } from './vscode-lean4/src/utils/clientProvider';
import { Uri } from 'vscode';
import { InfoProvider } from './vscode-lean4/src/infoview';

class LeanEditorProvider {

wrapper: MonacoEditorLanguageClientWrapper
clientProvider: LeanClientProvider
infoProvider: InfoProvider

async init () {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      return new editorWorker()
    }
  }

  const extensionFilesOrContents = new Map<string, string | URL>();
  extensionFilesOrContents.set('/language-configuration.json', new URL('./vscode-lean4/language-configuration.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/lean4.json', new URL('./vscode-lean4/syntaxes/lean4.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/lean4-markdown.json', new URL('./vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url));
  extensionFilesOrContents.set('/syntaxes/codeblock.json', new URL('./vscode-lean4/syntaxes/codeblock.json', import.meta.url));

  const userConfig : UserConfig = {
    wrapperConfig: {
      editorAppConfig: {
        $type: 'extended',
        codeResources: {
          main: {
            uri: '/workspace/test.lean',
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


  const { AbbreviationFeature } = (await import('./vscode-lean4/src/abbreviation'));

  new AbbreviationFeature();

  this.clientProvider = new LeanClientProvider({
    installChanged: () => {},
    testLeanVersion: () => {return "lean4/stable"},
    getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
    {appendLine: () => {}
  } as any)

}

async start(editorEl, infoviewEl) {
  this.infoProvider = new InfoProvider(this.clientProvider, {language: 'lean4'}, {} as any, infoviewEl)
  await this.wrapper.start(editorEl)
  this.wrapper.getEditor().focus()
}

async dispose() {
  //TODO: Wait for start
  await this.infoProvider.dispose()
  await this.wrapper.dispose()
}
}

(async () => {

const lean = new LeanEditorProvider()
await lean.init();
await lean.start(document.getElementById('editor')!, document.getElementById('infoview')!);
// await lean.dispose();

// await lean.init();
// await lean.start(document.getElementById('editor')!, document.getElementById('infoview')!);

})()