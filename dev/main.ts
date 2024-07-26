import './style.css'
import { LeanMonaco } from '../src/leanmonaco'
import { LeanMonacoEditor } from '../src/editor'

(async () => {

var leanMonaco = new LeanMonaco()
leanMonaco.start({websocket: {url: 'ws://localhost:8080/'}})
leanMonaco.setInfoviewElement(document.getElementById('infoview')!)
leanMonaco.dispose()

leanMonaco = new LeanMonaco()
leanMonaco.start({websocket: {url: 'ws://localhost:8080/'}, vscode: {"workbench.colorTheme": "Cobalt"}})
leanMonaco.setInfoviewElement(document.getElementById('infoview')!)

await leanMonaco.whenReady
const lean = new LeanMonacoEditor()
lean.start(document.getElementById('editor')!, "/sss/test.lean", "#check 1")
const lean2 = new LeanMonacoEditor()
lean2.start(document.getElementById('editor2')!, "/sss/test2.lean", "#check 2")

})()