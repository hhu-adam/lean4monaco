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
    const theme = "Visual Studio Light" //"Visual Studio Dark" //"Default Light Modern" //"Default Light+" //"Default Dark+" //"Default High Contrast"
    this.editor = monaco.editor.create(editorEl, {
      theme,
      glyphMargin: true,
      lineDecorationsWidth: 5,
      folding: false,
      lineNumbers: 'on',
      lineNumbersMinChars: 1,
      lightbulb: {
        enabled: true
      },
      unicodeHighlight: {
          ambiguousCharacters: false,
      },
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      tabSize: 2,
      'semanticHighlighting.enabled': true,
      // wordWrap: config.wordWrap ? "on" : "off",
      // acceptSuggestionOnEnter: config.acceptSuggestionOnEnter ? "on" : "off",
      fontFamily: "JuliaMono",
      wrappingStrategy: "advanced",
    });
    this.modelRef = await createModelReference(Uri.parse(fileName), code);
    this.editor.setModel(this.modelRef.object.textEditorModel);

    // Set focus on editor to trigger infoview to open
    this.editor.focus()

    const fontFile = new FontFace(
      "JuliaMono",
      `url(${new URL("./JuliaMono-Regular.ttf", import.meta.url)})`,
    );
    document.fonts.add(fontFile);
    fontFile.load()
  }

  dispose(){
    if (this.modelRef) this.modelRef.dispose()
    if (this.editor) this.editor.dispose()
    this.disposed = true
  }
}