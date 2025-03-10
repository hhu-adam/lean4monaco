import { LanguageClientWrapper, WorkerConfigDirect, WebSocketConfigOptions, WebSocketConfigOptionsUrl, WorkerConfigOptions } from 'monaco-editor-wrapper'
import { ExtUri } from 'lean4/src/utils/exturi'
import { LanguageClientOptions } from 'vscode-languageclient/node'
import { Message } from 'vscode-jsonrpc'

// JE: just copied that from somewhere random out of `vscode-lean4`
function displayError(errorText: string) {
  this.error.hidden = errorText.length === 0
  this.error.innerText = errorText
}

export const setupMonacoClient = (options: WebSocketConfigOptions | WebSocketConfigOptionsUrl | WorkerConfigOptions | WorkerConfigDirect) => {
  return async (toolchainOverride: string | undefined, folderUri: ExtUri, clientOptions: LanguageClientOptions) => {
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
                  displayError(message.error.message)
                  next(message) // remove this to prevent propagating the message
                } else {
                  next(message)
                }
              }
            }
          } as any // TODO (JE): Just added `as any` to silence it...
        }
      }
    })
    await languageClientWrapper?.start()
    const client = languageClientWrapper.getLanguageClient()!
    ;(client as any)._serverProcess = {stderr: {on: () => {}}}
    return client
  }
}