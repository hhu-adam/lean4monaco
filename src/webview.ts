// @ts-nocheck
import type { EditorApi } from '@leanprover/infoview'
import { loadRenderInfoview } from '@leanprover/infoview/loader'
import { Rpc } from './vscode-lean4/vscode-lean4/src/rpc'

const vscodeApi = window.parent

const rpc = new Rpc((m: any) => vscodeApi.postMessage(JSON.stringify(m)))
window.addEventListener('message', e => {rpc.messageReceived(JSON.parse(e.data))})
const editorApi: EditorApi = rpc.getApi()

const div: HTMLElement | null = document.querySelector('#react_root')

if (div) {
    const imports = 
     {
     '@leanprover/infoview': '/infoview/index.production.min.js',
     'react': '/infoview/react.production.min.js',
     'react/jsx-runtime': '/infoview/react-jsx-runtime.production.min.js',
     'react-dom': '/infoview/react-dom.production.min.js',
     }
    console.log(imports)
    loadRenderInfoview(imports, [editorApi, div], api => rpc.register(api))
}
