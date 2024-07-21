import { Uri } from 'vscode';
import { fs } from 'memfs';
import { ITextFileEditorModel, createModelReference } from 'vscode/monaco';
import * as monaco from 'monaco-editor';
import { IReference } from '@codingame/monaco-vscode-editor-service-override';
import path from 'path'

export class LeanMonacoEditor {

  editor: monaco.editor.IStandaloneCodeEditor
  modelRef: IReference<ITextFileEditorModel>
  disposed = false

  async start(editorEl: HTMLElement, fileName: string, code: string) {
    if (this.disposed) return

    // Create file for clientProvider to find
    fs.mkdirSync(path.dirname(fileName), {recursive: true});
    fs.writeFileSync(fileName, '');
    
    // Create editor and model
    this.modelRef = await createModelReference(Uri.parse(fileName), code);
    this.editor = monaco.editor.create(editorEl, { automaticLayout: true });
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