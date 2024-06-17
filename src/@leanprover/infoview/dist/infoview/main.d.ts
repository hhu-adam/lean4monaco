import '@vscode/codicons/dist/codicon.css';
import '@vscode/codicons/dist/codicon.ttf';
import 'tachyons/css/tachyons.css';
import './index.css';
import { EditorApi, InfoviewApi } from '@leanprover/infoview-api';
/**
 * Render the Lean infoview into the DOM element `uiElement`.
 *
 * @param editorApi is a collection of methods which the infoview needs to be able to invoke
 * on the editor in order to function correctly (such as inserting text or moving the cursor).
 * @returns a collection of methods which must be invoked when the relevant editor events occur.
 */
export declare function renderInfoview(editorApi: EditorApi, uiElement: HTMLElement): InfoviewApi;
