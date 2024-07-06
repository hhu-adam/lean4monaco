import { LanguageClientWrapper, WorkerConfigDirect, WebSocketConfigOptions, WebSocketConfigOptionsUrl, WorkerConfigOptions } from 'monaco-editor-wrapper'
import { ExtUri } from './monaco-lean4/vscode-lean4/src/utils/exturi'
import {
    LanguageClientOptions,
} from 'vscode-languageclient/node'

export const setupMonacoClient = (options: WebSocketConfigOptions | WebSocketConfigOptionsUrl | WorkerConfigOptions | WorkerConfigDirect) => {
    return async (clientOptions: LanguageClientOptions, folderUri: ExtUri, elanDefaultToolchain: string) => {
        const languageClientWrapper = new LanguageClientWrapper();
        await languageClientWrapper.init({
            languageClientConfig: {
                languageId: 'lean4',
                options,
                clientOptions
            }
        });
        await languageClientWrapper?.start();
        const client = languageClientWrapper.getLanguageClient()!;
        (client as any)._serverProcess = {stderr: {on: () => {}}}
        return client
    }
}