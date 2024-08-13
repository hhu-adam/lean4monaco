import { Uri } from 'vscode'
import { fs } from 'memfs'
import { ITextFileEditorModel, createModelReference } from 'vscode/monaco'
import * as monaco from 'monaco-editor'
import { IReference } from '@codingame/monaco-vscode-editor-service-override'
import path from 'path'

export class LeanMonacoEditor {

  editor: monaco.editor.IStandaloneCodeEditor
  modelRef: IReference<ITextFileEditorModel>
  disposed = false

  async start(editorEl: HTMLElement, fileName: string, code: string) {
    if (this.disposed) return

    // Create file for clientProvider to find
    fs.mkdirSync(path.dirname(fileName), {recursive: true})
    fs.writeFileSync(fileName, '')

    // Create editor and model
    this.modelRef = await createModelReference(Uri.parse(fileName), code)
    this.editor = monaco.editor.create(editorEl, {
      automaticLayout: true,
      // Note: looks like setting options here prevents them from being overwritten later.
      // TODO: Looks like these options cannot be set in `updateVSCodeOptions` in `leanmonaco.ts`
      // so we set them here
      contextmenu: false,             // the context menu breaks mobile support.
      lineNumbersMinChars: 1,         // minimal no. of characters for line numbers
      lineDecorationsWidth: 5,        // distance (px) between line number and code.
    })
    this.editor.setModel(this.modelRef.object.textEditorModel)

    // Set focus on editor to trigger infoview to open
    this.editor.focus()
  }

  dispose(){
    if (this.modelRef) this.modelRef.dispose()
    if (this.editor) this.editor.dispose()
    this.disposed = true
  }
}