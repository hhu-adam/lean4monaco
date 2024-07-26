import 'vscode/localExtensionHost'
import { RegisterExtensionResult, WebSocketConfigOptionsUrl } from 'monaco-editor-wrapper';
import { LeanClientProvider } from './vscode-lean4/vscode-lean4/src/utils/clientProvider';
import { Uri, workspace } from 'vscode';
import { InfoProvider } from './vscode-lean4/vscode-lean4/src/infoview';
import { AbbreviationFeature } from './vscode-lean4/vscode-lean4/src/abbreviation/AbbreviationFeature';
import { LeanTaskGutter } from './vscode-lean4/vscode-lean4/src/taskgutter';
import { IFrameInfoWebviewFactory } from './infowebview'
import { setupMonacoClient } from './monacoleanclient';
import { checkLean4ProjectPreconditions } from './preconditions'
import { ExtUri } from './vscode-lean4/vscode-lean4/src/utils/exturi';
import { initialize, getService, IThemeService } from 'vscode/services';
import getConfigurationServiceOverride, { updateUserConfiguration, initUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override';
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override';
import { ExtensionHostKind, IExtensionManifest, registerExtension } from 'vscode/extensions';
import { DisposableStore } from 'vscode/monaco';
import packageJson from './vscode-lean4/vscode-lean4/package.json'

export type LeanMonacoOptions = {
  websocket: {
    url: string
  }
  vscode?: {
    [id: string]: any
  }
}

export class LeanMonaco {
  ready: (value: void | PromiseLike<void>) => void
  whenReady = new Promise<void>((resolve) => {
    this.ready = resolve
  })

  static activeInstance: LeanMonaco | null = null

  registerFileUrlResults = new DisposableStore()
  extensionRegisterResult: RegisterExtensionResult | undefined
  clientProvider: LeanClientProvider | undefined
  infoProvider: InfoProvider | undefined
  iframeWebviewFactory : IFrameInfoWebviewFactory | undefined
  abbreviationFeature: AbbreviationFeature | undefined
  taskGutter: LeanTaskGutter | undefined
  infoviewEl: HTMLElement | undefined
  disposed = false

  async start(options: LeanMonacoOptions) {

    if (LeanMonaco.activeInstance == this) {
      console.warn('A LeanMonaco instance cannot be started twice.')
      return
    }
    if (LeanMonaco.activeInstance) {
      console.warn('There can only be one active LeanMonaco instance at a time. Disposing previous instance.')
      LeanMonaco.activeInstance?.dispose()
    }
    LeanMonaco.activeInstance = this

    if (! window.MonacoEnvironment) {
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
    
      await initialize(
        {
          ...getTextmateServiceOverride(),
          ...getThemeServiceOverride(),
          ...getConfigurationServiceOverride(),
          ...getLanguagesServiceOverride(),
          ...getModelServiceOverride()
        }, 
        undefined, 
        { 
          workspaceProvider: {
            trusted: true,
            workspace: {
                workspaceUri: Uri.file('/workspace.code-workspace')
            },
            async open() {
                return false;
            }
          }
        }
      )

    }
    await (await import('@codingame/monaco-vscode-theme-defaults-default-extension')).whenReady;

    if (this.disposed) return;
    
    this.extensionRegisterResult = registerExtension(this.getExtensionManifest(), ExtensionHostKind.LocalProcess);

    for (const entry of this.getExtensionFiles()) {
      const registerFileUrlResult = (this.extensionRegisterResult as any).registerFileUrl(entry[0], entry[1].href);
      this.registerFileUrlResults.add(registerFileUrlResult);
    }

    await this.extensionRegisterResult.whenReady()

    if (this.disposed) return;

    const themeService = await getService(IThemeService)

    if (this.disposed) return;

    this.updateVSCodeOptions(options.vscode ?? {})

    this.abbreviationFeature = new AbbreviationFeature({} as any, { kind: 'MoveAllSelections' });
  
    this.clientProvider = new LeanClientProvider(
      {
        installChanged: () => {return {dispose: ()  => {}}},
        testLeanVersion: () => {return "lean4/stable"},
        getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
        {appendLine: () => {}
      } as any,
      setupMonacoClient(this.getWebSocketOptions(options)),
      checkLean4ProjectPreconditions
    )
  
    this.taskGutter = new LeanTaskGutter(this.clientProvider, {asAbsolutePath: (path: string) => Uri.parse(`${new URL('vscode-lean4/vscode-lean4/' + path, import.meta.url)}`),} as any)
  
    this.iframeWebviewFactory = new IFrameInfoWebviewFactory(themeService)
    if (this.infoviewEl) this.iframeWebviewFactory.setInfoviewElement(this.infoviewEl)
    
    this.infoProvider = new InfoProvider(this.clientProvider, {language: 'lean4'}, {} as any, this.iframeWebviewFactory) 
    
    const fontFile = new FontFace(
      "JuliaMono",
      `url(${new URL("./JuliaMono-Regular.ttf", import.meta.url)})`,
    );
    document.fonts.add(fontFile);
    await fontFile.load()

    this.updateVSCodeOptions(options.vscode ?? {})

    if (this.disposed) return;

    this.ready()
  }

  updateVSCodeOptions(vsCodeOptions: { [id: string]: any }){
    for (const key in vsCodeOptions) {
        workspace.getConfiguration().update(key, vsCodeOptions[key])
    }
  }

  setInfoviewElement(infoviewEl: HTMLElement){
    if (this.iframeWebviewFactory) this.iframeWebviewFactory.setInfoviewElement(infoviewEl)
    this.infoviewEl = infoviewEl
  }

  protected getExtensionFiles() {
    const extensionFiles = new Map<string, URL>();
    extensionFiles.set('/language-configuration.json', new URL('./vscode-lean4/vscode-lean4/language-configuration.json', import.meta.url));
    extensionFiles.set('/syntaxes/lean4.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/lean4.json', import.meta.url));
    extensionFiles.set('/syntaxes/lean4-markdown.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url));
    extensionFiles.set('/syntaxes/codeblock.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/codeblock.json', import.meta.url));
    extensionFiles.set('/themes/cobalt2.json', new URL('./themes/cobalt2.json', import.meta.url));
    return extensionFiles
  }

  protected getExtensionManifest(): IExtensionManifest {
    return {
      name: 'lean4web',
      publisher: 'leanprover-community',
      version: '1.0.0',
      engines: {
          vscode: '*'
      },
      "contributes": {
        "configuration": packageJson.contributes.configuration as any,
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
        "configurationDefaults": {
            "editor.folding": false,
            "editor.wordSeparators": "`~@$%^&*()-=+[{]}⟨⟩⦃⦄⟦⟧⟮⟯‹›\\|;:\",.<>/",
            "editor.lineNumbers": 'on',
            "editor.lineNumbersMinChars": 1,
            "editor.glyphMargin": true,
            "editor.lineDecorationsWidth": 5,
            "editor.tabSize": 2,
            "editor.detectIndentation": false,
            "editor.lightbulb.enabled": "on",
            "editor.unicodeHighlight.ambiguousCharacters": false,
            "editor.minimap.enabled": false,
            "editor.semanticHighlighting.enabled": true,
            "editor.wordWrap": "off",
            "editor.acceptSuggestionOnEnter": "off",
            "editor.fontFamily": "JuliaMono",
            "editor.wrappingStrategy": "advanced",
          },
        "themes": [
          {
              "id": "Cobalt",
              "label": "Cobalt",
              "uiTheme": "vs",
              "path": "./themes/cobalt2.json"
            }
        ],
      },
    }
  }

  protected getWebSocketOptions(options: LeanMonacoOptions): WebSocketConfigOptionsUrl {
    return {
      $type: 'WebSocketUrl',
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
      },
      ...options.websocket
    }
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
