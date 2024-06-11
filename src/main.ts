import './style.css'

import { initialize as initializeMonacoService } from 'vscode/services'
import { ExtensionHostKind, registerExtension } from 'vscode/extensions'
import getModelServiceOverride from '@codingame/monaco-vscode-model-service-override'
import getExtensionServiceOverride from '@codingame/monaco-vscode-extensions-service-override'
import 'vscode/localExtensionHost'
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { EditorAppExtended } from 'monaco-editor-wrapper';
import { Logger } from 'monaco-languageclient/tools';
import { initServices } from 'monaco-languageclient/vscode/services';
import { checkServiceConsistency, configureServices } from 'monaco-editor-wrapper/vscode/services';

import * as monaco from 'monaco-editor'

async function go() {

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div id="editor"></div>
  </div>
`

const userConfig : UserConfig = {
  wrapperConfig: {
    editorAppConfig: {
      $type: 'extended', 
      extensions: []
    }
  }
}

const logger = new Logger()

const editorApp = new EditorAppExtended("myID", userConfig, logger);

// editorApps init their own service thats why they have to be created first
const specificServices = await editorApp.specifyServices();
const serviceConfig = await configureServices({
    specificServices,
    logger: logger
});
await initServices({
    serviceConfig,
    caller: `lean4web`,
    performChecks: checkServiceConsistency,
    logger: logger
});

// TODO:
// this.languageClientWrapper = new LanguageClientWrapper();
// await this.languageClientWrapper.init({
//     languageClientConfig: userConfig.languageClientConfig,
//     logger: this.logger
// });

// The wrapper does not do this. TODO: Check whether this is a wrapper bug!
monaco.languages.register({
  id: 'lean4',
  extensions: ['.lean']
})

const model = monaco.editor.createModel("#check Nat", "lean4")
console.log(model.getLanguageId())

const el = document.getElementById('editor')!
monaco.editor.create(el, { model })


const { AbbreviationFeature } = (await import('./vscode-lean4/src/abbreviation'));

new AbbreviationFeature();

}

go()