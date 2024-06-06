import './style.css'

import { initialize as initializeMonacoService } from 'vscode/services'
import { ExtensionHostKind, registerExtension } from 'vscode/extensions'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import 'vscode/localExtensionHost'


import * as monaco from 'monaco-editor'
import { RegisteredFileSystemProvider, RegisteredMemoryFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override'


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

const res = await registerExtension({
  name: 'monacotest2',
  publisher: 'hhu-adam',
  version: '1.0.0',
  engines: {
    vscode: '*'
  }
}, ExtensionHostKind.LocalProcess)


monaco.languages.register({
  id: 'lean4',
  extensions: ['.lean']
})

res.setAsDefaultApi()

const vscode = await res.getApi()

const model = monaco.editor.createModel("#check Nat", "lean4", vscode.Uri.file('/user/test.lean'))
console.log(model.getLanguageId())
// Use model reference??
// const fileSystemProvider = new RegisteredFileSystemProvider(false)
// fileSystemProvider.registerFile(new RegisteredMemoryFile(vscode.Uri.file('/user/test.lean'), `#check Nat`
// ))
// registerFileSystemOverlay(1, fileSystemProvider)
// const modelRef = await monaco.editor.createModelReference(vscode.Uri.file('/user/test.lean'))
// const model = modelRef.object.textEditorModel

const el = document.getElementById('editor')!
monaco.editor.create(el, { model })


const { AbbreviationFeature } = (await import('./vscode-lean4/src/abbreviation'));

new AbbreviationFeature();

// const editor = vscode.window.activeTextEditor!

// console.log(editor)

// const config = new AbbreviationConfig()
// const abbrevRewriter = new AbbreviationRewriter(config, new AbbreviationProvider(config), editor)

// model.dispose()
// editor.dispose()


