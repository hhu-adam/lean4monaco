import 'vscode/localExtensionHost'
import { RegisterExtensionResult, WebSocketConfigOptionsUrl } from 'monaco-editor-wrapper'
import { LeanClientProvider } from './vscode-lean4/vscode-lean4/src/utils/clientProvider'
import { Uri, workspace } from 'vscode'
import { InfoProvider } from './vscode-lean4/vscode-lean4/src/infoview'
import { AbbreviationFeature } from './vscode-lean4/vscode-lean4/src/abbreviation/AbbreviationFeature'
import { LeanTaskGutter } from './vscode-lean4/vscode-lean4/src/taskgutter'
import { IFrameInfoWebviewFactory } from './infowebview'
import { setupMonacoClient } from './monacoleanclient'
import { checkLean4ProjectPreconditions } from './preconditions'
import { initialize, getService, IThemeService, IConfigurationService } from 'vscode/services'
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override'
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override'
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override'
import getLanguagesServiceOverride from '@codingame/monaco-vscode-languages-service-override'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import { ExtensionHostKind, IExtensionManifest, registerExtension } from 'vscode/extensions'
import { DisposableStore } from 'vscode/monaco'
import packageJson from './vscode-lean4/vscode-lean4/package.json'
import { IGrammar } from 'vscode/vscode/vs/platform/extensions/common/extensions'
import { ExtensionKind } from 'vscode/vscode/vs/platform/environment/common/environment'

/** Options for LeanMonaco.
 *
 * The URL is where the server listens. You might want to use something like
 * `"ws://" + window.location.host`
 *
 * To add settings in `vscode`, you can open your settings in VSCode (Ctrl+,), search
 * for the desired setting, select "Copy Setting as JSON" from the "More Actions"
 * menu next to the selected setting, and paste the copied string here.
 */
export type LeanMonacoOptions = {
  websocket: {
    url: string
  }
  htmlElement?: HTMLElement
  vscode?: {
    [id: string]: any
  }
}


 export class LeanMonaco {
  private ready: (value: void | PromiseLike<void>) => void
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
    console.debug('[LeanMonaco]: starting')

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
        // The wrapper HTML element determines the extend of certain monaco features
        // such as the right-click context menu.
        options.htmlElement ?? undefined,
        {
          workspaceProvider: {
            trusted: true,
            workspace: {
                workspaceUri: Uri.file('/workspace.code-workspace')
            },
            async open() {
                return false
            }
          }
        }
      )

    }
    await (await import('@codingame/monaco-vscode-theme-defaults-default-extension')).whenReady

    if (this.disposed) return

    this.extensionRegisterResult = registerExtension(this.getExtensionManifest(), ExtensionHostKind.LocalProcess)

    for (const entry of this.getExtensionFiles()) {
      const registerFileUrlResult = (this.extensionRegisterResult as any).registerFileUrl(entry[0], entry[1].href)
      this.registerFileUrlResults.add(registerFileUrlResult)
    }

    await this.extensionRegisterResult.whenReady()

    if (this.disposed) return

    const themeService = await getService(IThemeService)
    const configurationService = await getService(IConfigurationService)

    if (this.disposed) return

    this.updateVSCodeOptions(options.vscode ?? {})

    this.abbreviationFeature = new AbbreviationFeature({} as any, { kind: 'MoveAllSelections' })

    this.clientProvider = new LeanClientProvider(
      {
        installChanged: () => {return {dispose: ()  => {}}},
        testLeanVersion: () => {return "lean4/stable"},
        getElanDefaultToolchain: () => {return "lean4/stable"}} as any,
        {appendLine: () => {}
      } as any,
      checkLean4ProjectPreconditions,
      setupMonacoClient(this.getWebSocketOptions(options))
    )

    const asAbsolutePath = (path: string) => {
      switch (path) {
        // url.pathToFileURL
        case "media/progress-light.svg":       return Uri.parse(`${new URL('./vscode-lean4/vscode-lean4/media/progress-light.svg', import.meta.url)}`)
        case "media/progress-dark.svg":        return Uri.parse(`${new URL('./vscode-lean4/vscode-lean4/media/progress-dark.svg', import.meta.url)}`)
        case "media/progress-error-light.svg": return Uri.parse(`${new URL('./vscode-lean4/vscode-lean4/media/progress-error-light.svg', import.meta.url)}`)
        case "media/progress-error-dark.svg":  return Uri.parse(`${new URL('./vscode-lean4/vscode-lean4/media/progress-error-dark.svg', import.meta.url)}`)
      }
    }

    this.taskGutter = new LeanTaskGutter(this.clientProvider, {asAbsolutePath: asAbsolutePath} as any)

    // Load fonts
    const fontFiles = [
      new FontFace(
      "JuliaMono",
      `url(${new URL("./fonts/JuliaMono-Regular.ttf", import.meta.url)})`,
      ),
      // new FontFace(
      //   "LeanWeb",
      //   `url(${new URL("./fonts/LeanWeb-Regular.otf", import.meta.url)})`,
      // )
    ]
    fontFiles.map(font => {
      document.fonts.add(font)
    })

    this.iframeWebviewFactory = new IFrameInfoWebviewFactory(themeService, configurationService, fontFiles)
    if (this.infoviewEl) this.iframeWebviewFactory.setInfoviewElement(this.infoviewEl)

    this.infoProvider = new InfoProvider(this.clientProvider, {language: 'lean4'}, {} as any, this.iframeWebviewFactory)

    // Wait for all fonts to be loaded
    await Promise.all(fontFiles.map(font => font.load()))

    // Here we provide default options for the editor. They can be overwritten by the user.
    this.updateVSCodeOptions({
      // Layout options, trying to maximise the usable space of the code editor
      "editor.lineNumbers": "on",
      "editor.stickyScroll.enabled": false,
      "editor.folding": false,
      "editor.minimap.enabled": false,

      // features useful for Lean
      "editor.glyphMargin": true, // Shows the yellow/red task gutter on the left.
      "editor.semanticHighlighting.enabled": true,
      "editor.lightbulb.enabled": "on",
      "editor.detectIndentation": false, // rather, indentation in Lean is always 2
      "editor.acceptSuggestionOnEnter": "off", // since there are plenty suggestions

      // other options
      "editor.renderWhitespace": "trailing",
      "editor.fontFamily": "'JuliaMono'",
      "editor.wordWrap": "on",
      "editor.wrappingStrategy": "advanced",
      "workbench.colorTheme": "Visual Studio Light",
      ...options.vscode
    })

    if (this.disposed) return

    this.ready()
  }

  /** Update options of the editor */
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
    const extensionFiles = new Map<string, URL>()
    extensionFiles.set('/language-configuration.json', new URL('./vscode-lean4/vscode-lean4/language-configuration.json', import.meta.url))
    extensionFiles.set('/syntaxes/lean4.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/lean4.json', import.meta.url))
    extensionFiles.set('/syntaxes/lean4-markdown.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/lean4-markdown.json', import.meta.url))
    extensionFiles.set('/syntaxes/codeblock.json', new URL('./vscode-lean4/vscode-lean4/syntaxes/codeblock.json', import.meta.url))
    extensionFiles.set('/themes/cobalt2.json', new URL('./themes/cobalt2.json', import.meta.url))
    return extensionFiles
  }

  /** This basically returns the `package.json` of `vscode-lean4` with some ts-fixes and the custom themes. */
  protected getExtensionManifest(): IExtensionManifest {
    return {
      ...packageJson,
      contributes: {
        ...packageJson.contributes,
        configuration: packageJson.contributes.configuration as any, // Apparently `IExtensionContributions.configuration` has type `any`
        // TODO: This is suspect, the thrid entry does not have "language", yet it doesn't complain
        // look into that.
        grammars: packageJson.contributes.grammars as IGrammar[],
        // Somehow `submenu` is incompatible. Since we don't use that anyways we just drop
        // `menus` and `submenus` from the package.json
        menus: undefined,
        submenus: undefined,
        // Add custom themes here.
        themes: [
          {
            "id": "Cobalt",
            "label": "Cobalt",
            "uiTheme": "vs",
            "path": "./themes/cobalt2.json"
          }
        ],
      },
      extensionKind: packageJson.extensionKind as ExtensionKind[],
    }
  }

  protected getWebSocketOptions(options: LeanMonacoOptions): WebSocketConfigOptionsUrl {
    return {
      $type: 'WebSocketUrl',
      startOptions: {
        onCall: () => {
            console.log('Connected to socket.')
        },
        reportStatus: true
      },
      stopOptions: {
        onCall: () => {
            console.log('Disconnected from socket.')
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
