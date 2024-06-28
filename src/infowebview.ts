import { EditorApi, InfoviewApi } from "@leanprover/infoview-api"
import { InfoWebviewFactory } from "./monaco-lean4/vscode-lean4/src/infoview"
import { Rpc } from "./monaco-lean4/vscode-lean4/src/rpc"
import { ViewColumn } from "vscode"

export class IFrameInfoWebviewFactory implements InfoWebviewFactory {
    private infoviewElement

    setInfoviewElement(infoviewElement: HTMLElement) {
    this.infoviewElement = infoviewElement
    }

    make(editorApi: EditorApi, stylesheet: string) {
        const iframe : HTMLIFrameElement = document.createElement("iframe")
        this.infoviewElement.append(iframe)
        iframe.contentWindow.document.open()
        iframe.contentWindow.document.write(this.initialHtml(stylesheet))

        iframe.contentWindow.document.close()
        
        // Note that an extension can send data to its webviews using webview.postMessage().
        // This method sends any JSON serializable data to the webview. The message is received
        // inside the webview through the standard message event.
        // The receiving of these messages is done inside webview\index.ts where it
        // calls window.addEventListener('message',...
        const rpc = new Rpc(m => {
            try {
                // JSON.stringify is needed here to serialize getters such as `Position.line` and `Position.character`
                void iframe.contentWindow.postMessage(JSON.stringify(m))
            } catch (e) {
                // ignore any disposed object exceptions
            }
        })
        rpc.register(editorApi)

        // Similarly, we can received data from the webview by listening to onDidReceiveMessage.
        document.defaultView.addEventListener('message', m => {
            if (m.source != iframe.contentWindow) { return }
            try {
                rpc.messageReceived(JSON.parse(m.data))
            } catch {
                // ignore any disposed object exceptions
            }
        })
        const api = rpc.getApi<InfoviewApi>()

        return {
            rpc,
            api,
            visible: true,
            dispose: () => {
                // TODO
            },
            reveal: (viewColumn?: ViewColumn, preserveFocus?: boolean) => {}
        }
    }

    private initialHtml(stylesheet) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-type" content="text/html;charset=utf-8">
                <title>Infoview</title>
                <style>${stylesheet}</style>
                <link rel="stylesheet" href="${new URL('./vscode.css', import.meta.url)}">
                <link rel="stylesheet" href="${new URL('./monaco-lean4/lean4-infoview/src/infoview/index.css', import.meta.url)}">
            </head>
            <body>
                <div id="react_root"></div>
                <script type="module" src="${new URL('./webview.ts', import.meta.url)}"></script>
            </body>
            </html>`
    }
}
