import { LanguageClientWrapper } from 'monaco-editor-wrapper'

export async function setupMonacoClient(clientOptions) {
    const languageClientWrapper = new LanguageClientWrapper();
    await languageClientWrapper.init({
        languageClientConfig: {
            languageId: 'lean4',
            options: {
                $type: 'WebSocketUrl',
                url: 'ws://localhost:8080/websocket/mathlib-demo',
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
                }
            },
            clientOptions
        }
    });
    await languageClientWrapper?.start();
    const client = languageClientWrapper.getLanguageClient()!;
    return client
}