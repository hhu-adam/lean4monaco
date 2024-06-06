import './style.css'

import { initialize as initializeMonacoService, waitServicesReady, withReadyServices } from 'vscode/services'
import { ExtensionHostKind, registerExtension } from 'vscode/extensions'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import 'vscode/localExtensionHost'
import { Disposable, workspace } from 'vscode'


// import * as monaco from 'monaco-editor'
// import { RegisteredFileSystemProvider, RegisteredMemoryFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override'

// import getConfigurationServiceOverride, { IStoredWorkspace, initUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override'

// import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override'
// import { Uri, workspace, ConfigurationTarget, EventEmitter } from 'vscode';
// import { setDefaultApi } from '@codingame/monaco-vscode-extensions-service-override'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="editor"></div>
  </div>
`

await initializeMonacoService({
  ...getModelServiceOverride(),
  ...getExtensionServiceOverride()
})

await registerExtension({
  name: 'monacotest2',
  publisher: 'hhu-adam',
  version: '1.0.0',
  engines: {
    vscode: '*'
  },
}, ExtensionHostKind.LocalProcess).setAsDefaultApi()

workspace.getConfiguration(undefined);

// const { getApi } = res

// const vscode = await getApi()

// const model = monaco.editor.createModel("#check Nat")

// // Use model reference??
// // const fileSystemProvider = new RegisteredFileSystemProvider(false)
// // fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/user/test.lean'), `#check Nat`
// // ))
// // registerFileSystemOverlay(1, fileSystemProvider)
// // const modelRef = await monaco.editor.createModelReference(vscode.Uri.file('/user/test.lean'))
// // const model = modelRef.object.textEditorModel

// const el = document.getElementById('editor')!
// monaco.editor.create(el, { model })


// const { AbbreviationRewriter } = (await import('lean4/src/abbreviation/rewriter/AbbreviationRewriter'));
// const { AbbreviationProvider } = (await import('lean4/src/abbreviation/AbbreviationProvider'));
// const { AbbreviationConfig } = (await import('lean4/src/abbreviation/config'));

// workspace.getConfiguration(undefined);
// const editor = vscode.window.activeTextEditor!
// const config = new AbbreviationConfig()
// const abbrevRewriter = new AbbreviationRewriter(config, new AbbreviationProvider(config), editor)

// model.dispose()
// editor.dispose()


