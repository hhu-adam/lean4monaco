import './style.css'
import 'vscode/localExtensionHost'
import { RegisterExtensionResult, WebSocketConfigOptionsUrl } from 'monaco-editor-wrapper';
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
import { initServices, InitializeServiceConfig } from 'monaco-languageclient/vscode/services';
import { ExtensionHostKind, IExtensionManifest, registerExtension } from 'vscode/extensions';
import { DisposableStore, ITextFileEditorModel, createModelReference } from 'vscode/monaco';
import * as monaco from 'monaco-editor';
import { IReference } from '@codingame/monaco-vscode-editor-service-override';
import path from 'path'


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

const serviceConfig: InitializeServiceConfig = {
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

const websocketOptions: WebSocketConfigOptionsUrl = {
    $type: 'WebSocketUrl',
    url: '',
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

class LeanMonaco {
  ready
  whenReady = new Promise<void>((resolve) => {
    this.ready = resolve
  })

  static activeInstance: LeanMonaco | null = null

  logger = new Logger()
  registerFileUrlResults = new DisposableStore()
  extensionRegisterResult: RegisterExtensionResult
  clientProvider: LeanClientProvider
  infoProvider: InfoProvider
  iframeWebviewFactory : IFrameInfoWebviewFactory
  abbreviationFeature: AbbreviationFeature
  taskGutter: LeanTaskGutter
  disposed = false

  async start(websocketUrl) {

    if (LeanMonaco.activeInstance == this) {
      console.warn('A LeanMonaco instance cannot be started twice.')
      return
    }
    if (LeanMonaco.activeInstance) {
      console.warn('There can only be one active LeanMonaco instance at a time. Disposing previous instance.')
      LeanMonaco.activeInstance?.dispose()
    }
    LeanMonaco.activeInstance = this

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
    
    await initServices({
        serviceConfig,
        caller: `Lean monaco-editor`,
        performChecks: checkServiceConsistency,
        logger: this.logger
    });

    await (await import('@codingame/monaco-vscode-theme-defaults-default-extension')).whenReady;

    if (this.disposed) return;
    
    this.extensionRegisterResult = registerExtension(extensionConfig, ExtensionHostKind.LocalProcess);
    
    if (extensionFilesOrContents) {
        for (const entry of extensionFilesOrContents) {
            const registerFileUrlResult = (this.extensionRegisterResult as any).registerFileUrl(entry[0], entry[1].href);
            this.registerFileUrlResults.add(registerFileUrlResult);
        }
    }

    await this.extensionRegisterResult.whenReady()

    if (this.disposed) return;

    this.abbreviationFeature = new AbbreviationFeature({} as any);
  
    this.clientProvider = new LeanClientProvider(
      {
        installChanged: () => {return {dispose: ()  => {}}},
        testLeanVersion: () => {return "lean4/stable"},
        getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
        {appendLine: () => {}
      } as any,
      setupMonacoClient({
        ...websocketOptions,
        url: websocketUrl,
      }),
      checkLean4ProjectPreconditions,
      (docUri: ExtUri) => { return true }
    )
  
    this.taskGutter = new LeanTaskGutter(this.clientProvider, {asAbsolutePath: (path) => Uri.parse(`${new URL('monaco-lean4/vscode-lean4/' + path, import.meta.url)}`),} as any)
  
    if (!this.iframeWebviewFactory) this.iframeWebviewFactory = new IFrameInfoWebviewFactory()
      
    this.infoProvider = new InfoProvider(this.clientProvider, {language: 'lean4'}, {} as any, this.iframeWebviewFactory)  

    this.ready()
  }


  setInfoviewElement(infoviewEl){
    if (!this.iframeWebviewFactory) this.iframeWebviewFactory = new IFrameInfoWebviewFactory()
      this.iframeWebviewFactory.setInfoviewElement(infoviewEl)
  }

  dispose() {
    if (LeanMonaco.activeInstance == this) {
      LeanMonaco.activeInstance = null
    }
    this.registerFileUrlResults?.dispose()
    this.registerFileUrlResults = new DisposableStore()
    this.extensionRegisterResult?.dispose()
    this.extensionRegisterResult = undefined
    this.disposed = true
    this.infoProvider?.dispose()
    this.infoProvider = undefined
    this.taskGutter?.dispose()
    this.taskGutter = undefined
    this.clientProvider?.dispose()
    this.clientProvider = undefined
    this.abbreviationFeature?.dispose()
    this.abbreviationFeature = undefined
  }
}

class LeanMonacoEditor {

  editor: monaco.editor.IStandaloneCodeEditor
  modelRef: IReference<ITextFileEditorModel>

  async start(editorEl: HTMLElement, fileName: string, code: string) {
    // Create file for clientProvider to find
    fs.mkdirSync(path.dirname(fileName), {recursive: true});
    fs.writeFileSync(fileName, '');
    
    // Create editor and model
    const theme = "Visual Studio Light" //"Visual Studio Dark" //"Default Light Modern" //"Default Light+" //"Default Dark+" //"Default High Contrast"
    this.editor = monaco.editor.create(editorEl, { automaticLayout: true, theme });
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

var leanMonaco = new LeanMonaco()
leanMonaco.start('ws://localhost:8080/websocket/mathlib-demo')
leanMonaco.setInfoviewElement(document.getElementById('infoview')!)
leanMonaco.dispose()

leanMonaco = new LeanMonaco()
leanMonaco.start('ws://localhost:8080/websocket/mathlib-demo')
leanMonaco.setInfoviewElement(document.getElementById('infoview')!)

await leanMonaco.whenReady
const lean = new LeanMonacoEditor()
lean.start(document.getElementById('editor')!, "/sss/test.lean", "#check 1")
const lean2 = new LeanMonacoEditor()
lean2.start(document.getElementById('editor2')!, "/sss/test2.lean", "#check 2")

})()