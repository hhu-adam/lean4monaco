// TODO: Why does extension->activate not work?
// TODO: WHy do workspaces not work?
// TODO: Infoview using infoview loader?
// TODO: _character bug in monaco-vscode-api?
// TODO: Why does wrapper.init() not call editorApp.init()?

import './style.css'
import 'vscode/localExtensionHost'
import { RegisterExtensionResult } from 'monaco-editor-wrapper';
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
import { checkServiceConsistency } from 'monaco-editor-wrapper/vscode/services';
import { Logger } from 'monaco-languageclient/tools';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import { initServices } from 'monaco-languageclient/vscode/services';
import { ExtensionHostKind, IExtensionManifest, registerExtension } from 'vscode/extensions';
import { DisposableStore, ITextFileEditorModel, createModelReference } from 'vscode/monaco';
import * as monaco from 'monaco-editor';
import { IReference } from '@codingame/monaco-vscode-editor-service-override';
import path from 'path'

export namespace LeanMonaco {

  var clientProvider: LeanClientProvider
  var infoProvider: InfoProvider
  var iframeWebviewFactory : IFrameInfoWebviewFactory
  var abbreviationFeature: AbbreviationFeature
  var taskGutter: LeanTaskGutter
  var logger = new Logger()
  var registerFileUrlResults = new DisposableStore()
  var extensionRegisterResult: RegisterExtensionResult
  var started = false
  var ready
  export const whenReady = new Promise<void>((resolve) => {
    ready = resolve
  })

  export async function start(websocketUrl: string) {
    if (started) {
      console.error('LeanMonaco can only be started once')
      return
    }

    started = true

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

    const extensionFilesOrContents = new Map<string, URL>();
    extensionFilesOrContents.set('/language-configuration.json', new URL('./monaco-lean4/vscode-lean4/language-configuration.json', import.meta.url));
    extensionFilesOrContents.set('/syntaxes/lean4.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/lean4.json', import.meta.url));
    extensionFilesOrContents.set('/syntaxes/lean4-markdown.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url));
    extensionFilesOrContents.set('/syntaxes/codeblock.json', new URL('./monaco-lean4/vscode-lean4/syntaxes/codeblock.json', import.meta.url));

    const extensionConfig: IExtensionManifest = {
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
              "language": "lean4",
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
    }

    const serviceConfig = {
      userServices: {
        ...getTextmateServiceOverride(),
        ...getThemeServiceOverride(),
        ...getConfigurationServiceOverride()
      },
      workspaceConfig: {
        workspaceProvider: {
            trusted: true,
            workspace: {
                workspaceUri: Uri.file('/workspace')
            },
            async open() {
                return false;
            }
        }
      }
    }
    
    await initServices({
        serviceConfig,
        caller: `Lean monaco-editor`,
        performChecks: checkServiceConsistency,
        logger: logger
    });

    await (await import('@codingame/monaco-vscode-theme-defaults-default-extension')).whenReady;
    
    const manifest = extensionConfig
    extensionRegisterResult = registerExtension(extensionConfig, ExtensionHostKind.LocalProcess);
    
    if (extensionFilesOrContents) {
        for (const entry of extensionFilesOrContents) {
            const registerFileUrlResult = (extensionRegisterResult as any).registerFileUrl(entry[0], entry[1].href);
            registerFileUrlResults.add(registerFileUrlResult);
        }
    }
    await extensionRegisterResult.whenReady()
    
    abbreviationFeature = new AbbreviationFeature({} as any);

    clientProvider = new LeanClientProvider(
      {
        installChanged: () => {},
        testLeanVersion: () => {return "lean4/stable"},
        getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
        {appendLine: () => {}
      } as any,
      setupMonacoClient(
          {
              $type: 'WebSocketUrl',
              url: websocketUrl,
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
      ),
      checkLean4ProjectPreconditions,
      (docUri: ExtUri) => { return true }
    )

    taskGutter = new LeanTaskGutter(clientProvider, {asAbsolutePath: (path) => Uri.parse(`${new URL('monaco-lean4/vscode-lean4/' + path, import.meta.url)}`),} as any)

    if (!iframeWebviewFactory) iframeWebviewFactory = new IFrameInfoWebviewFactory()
      
    infoProvider = new InfoProvider(clientProvider, {language: 'lean4'}, {} as any, iframeWebviewFactory)

    ready()
  }

  export function setInfoviewElement(infoviewEl){
    if (!iframeWebviewFactory) iframeWebviewFactory = new IFrameInfoWebviewFactory()
    iframeWebviewFactory.setInfoviewElement(infoviewEl)
  }

  // export async function stop() {
  //   registerFileUrlResults.dispose()
  //   registerFileUrlResults = new DisposableStore()
  //   extensionRegisterResult.dispose()
  //   extensionRegisterResult = undefined
  //   infoProvider.dispose()
  //   infoProvider = undefined
  //   taskGutter.dispose()
  //   taskGutter = undefined
  //   clientProvider.dispose()
  //   clientProvider = undefined
  //   abbreviationFeature.dispose()
  //   abbreviationFeature = undefined
  // }
}

class LeanMonacoEditor {

  editor: monaco.editor.IStandaloneCodeEditor
  modelRef: IReference<ITextFileEditorModel>

  async start(editorEl: HTMLElement, fileName: string, code: string) {
    // Create file for clientProvider to find
    fs.mkdirSync(path.dirname(fileName), {recursive: true});
    fs.writeFileSync(fileName, '');
    
    // Create editor and model
    this.editor = monaco.editor.create(editorEl, { automaticLayout: true });
    this.modelRef = await createModelReference(Uri.parse(fileName), code);
    this.editor.setModel(this.modelRef.object.textEditorModel);

    // Set focus on editor to trigger infoview to open
    this.editor.focus()
  }

  dispose(){
    if (this.modelRef) this.modelRef.dispose()
    if (this.editor) this.editor.dispose()
  }
}

(async () => {

LeanMonaco.start('ws://localhost:8080/websocket/mathlib-demo')
LeanMonaco.setInfoviewElement(document.getElementById('infoview')!)

await LeanMonaco.whenReady
const lean = new LeanMonacoEditor()
lean.start(document.getElementById('editor')!, "/sss/test.lean", "#check 1")
const lean2 = new LeanMonacoEditor()
lean2.start(document.getElementById('editor2')!, "/sss/test2.lean", "#check 2")

})()