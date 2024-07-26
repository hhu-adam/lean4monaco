import { EditorApi, InfoviewApi } from "@leanprover/infoview-api"
import { InfoWebviewFactory, InfoWebview } from "./vscode-lean4/vscode-lean4/src/infoview"
import { Rpc } from "./vscode-lean4/vscode-lean4/src/rpc"
import { ViewColumn, Disposable, EventEmitter } from "vscode"
import { IColorTheme, IThemeService } from "vscode/services"
import * as colorUtils from 'vscode/vscode/vs/platform/theme/common/colorUtils';
import { ColorScheme } from 'vscode/vscode/vs/platform/theme/common/theme';

export class IFrameInfoWebview implements InfoWebview {

    visible = true
    
    private onDidDisposeEmitter = new EventEmitter<void>()
    onDidDispose = this.onDidDisposeEmitter.event

    api: InfoviewApi

    constructor(private iframe: HTMLIFrameElement, public rpc: Rpc) {
        this.api = rpc.getApi<InfoviewApi>()
    }

    dispose() {
        this.iframe.remove()
        this.onDidDisposeEmitter.fire()
    }
    
    reveal(viewColumn?: ViewColumn, preserveFocus?: boolean) {

    }
}

export class IFrameInfoWebviewFactory implements InfoWebviewFactory {
    private infoviewElement: HTMLElement
    private iframe: HTMLIFrameElement

    constructor(private themeService: IThemeService) { }

    setInfoviewElement(infoviewElement: HTMLElement) {
        this.infoviewElement = infoviewElement
    }

    make(editorApi: EditorApi, stylesheet: string, column: number) {
        this.iframe = document.createElement("iframe")
        this.infoviewElement.append(this.iframe)
        this.iframe.contentWindow!.document.open()
        this.iframe.contentWindow!.document.write(this.initialHtml(stylesheet))
        this.iframe.contentWindow!.document.close()

        this.updateCssVars()
        this.themeService.onDidColorThemeChange(() => { this.updateCssVars() })
        
        // Note that an extension can send data to its webviews using webview.postMessage().
        // This method sends any JSON serializable data to the webview. The message is received
        // inside the webview through the standard message event.
        // The receiving of these messages is done inside webview\index.ts where it
        // calls window.addEventListener('message',...
        const rpc = new Rpc(m => {
            try {
                // JSON.stringify is needed here to serialize getters such as `Position.line` and `Position.character`
                void this.iframe.contentWindow!.postMessage(JSON.stringify(m))
            } catch (e) {
                // ignore any disposed object exceptions
            }
        })
        rpc.register(editorApi)

        // Similarly, we can received data from the webview by listening to onDidReceiveMessage.
        document.defaultView!.addEventListener('message', m => {
            if (m.source != this.iframe.contentWindow) { return }
            try {
                rpc.messageReceived(JSON.parse(m.data))
            } catch {
                // ignore any disposed object exceptions
            }
        })

        return new IFrameInfoWebview(this.iframe, rpc)
    }

    private updateCssVars() {
        const theme = this.themeService.getColorTheme();
        const vscodeColors = ((colorUtils as any).getColorRegistry().getColors() as Array<{id:string}>).reduce<string>((colors, entry) => {
            const color = theme.getColor(entry.id);
            if (color) {
                colors = colors + '--vscode-' + entry.id.replace('.', '-') + ': ' + color.toString() + "; ";
            }
            return colors
        }, '');
        console.log(theme.type)
        this.iframe.contentDocument?.documentElement.setAttribute('style', vscodeColors)
        this.iframe.contentDocument?.documentElement.setAttribute('class', this.apiThemeClassName(theme))
    }

    private apiThemeClassName(theme: IColorTheme) {
        switch (theme.type) {
            case ColorScheme.LIGHT: return 'vscode-light';
            case ColorScheme.DARK: return 'vscode-dark';
            case ColorScheme.HIGH_CONTRAST_DARK: return 'vscode-high-contrast';
            case ColorScheme.HIGH_CONTRAST_LIGHT: return 'vscode-high-contrast-light';
        }
    }

    private initialHtml(stylesheet: string) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-type" content="text/html;charset=utf-8">
                <title>Infoview</title>
                <style>${stylesheet}</style>
                <style>
                    body {
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                </style>
                <link rel="stylesheet" href="${new URL('./vscode.css', import.meta.url)}">
                <link rel="stylesheet" href="${new URL('./vscode-lean4/lean4-infoview/src/infoview/index.css', import.meta.url)}">
            </head>
            <body>
                <div id="react_root"></div>
                <script type="module" src="${new URL('./webview.js', import.meta.url)}"></script>
            </body>
            </html>`
    }
}
