import { LanguageClientWrapper, WorkerConfigDirect, WebSocketConfigOptions, WebSocketConfigOptionsUrl, WorkerConfigOptions } from 'monaco-editor-wrapper'
import { ExtUri } from './vscode-lean4/vscode-lean4/src/utils/exturi'
import { LanguageClientOptions } from 'vscode-languageclient/node'
import { Message } from 'vscode-jsonrpc'
import { displayNotification } from './vscode-lean4/vscode-lean4/src/utils/notifs'

export const setupMonacoClient = (options: WebSocketConfigOptions | WebSocketConfigOptionsUrl | WorkerConfigOptions | WorkerConfigDirect) => {
  return async (folderUri: ExtUri, clientOptions: LanguageClientOptions, elanDefaultToolchain: string) => {
    const languageClientWrapper = new LanguageClientWrapper()
    await languageClientWrapper.init({
      languageClientConfig: {
        languageId: 'lean4',
        options,
        clientOptions: {
          ...clientOptions,
          connectionOptions: {
            ...clientOptions.connectionOptions,
            messageStrategy: {
              handleMessage: (message: any, next: (message: Message) => void) => {
                if (message.error) {
                  // TODO: Handle Lean errors correctly
                  displayNotification("Error", message.error.message)
                  next(message) // remove this to prevent propagating the message
                } else {
                  next(message)
                }
              }
            }
          }
        }
      }
    })
    await languageClientWrapper?.start()
    const client = languageClientWrapper.getLanguageClient()!
    ;(client as any)._serverProcess = {stderr: {on: () => {}}}
    return client
  }
}