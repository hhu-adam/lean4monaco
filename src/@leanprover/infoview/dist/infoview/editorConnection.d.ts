import type { Location } from 'vscode-languageserver-protocol';
import { EditorApi, InfoviewAction, InfoviewActionKind, InfoviewApi, PlainGoal, PlainTermGoal } from '@leanprover/infoview-api';
import { EventEmitter, Eventify } from './event';
import { DocumentPosition } from './util';
export type EditorEvents = Omit<Eventify<InfoviewApi>, 'requestedAction' | 'goToDefinition'> & {
    requestedAction: EventEmitter<InfoviewAction, InfoviewActionKind>;
    goToDefinition: EventEmitter<string, string>;
};
/** Provides higher-level wrappers around functionality provided by the editor,
 * e.g. to insert a comment. See also {@link EditorApi}. */
export declare class EditorConnection {
    readonly api: EditorApi;
    readonly events: EditorEvents;
    constructor(api: EditorApi, events: EditorEvents);
    /** Highlights the given range in a document in the editor. */
    revealLocation(loc: Location): Promise<void>;
    revealPosition(pos: DocumentPosition): Promise<void>;
    /** Copies the text to a comment at the cursor position. */
    copyToComment(text: string): Promise<void>;
    requestPlainGoal(pos: DocumentPosition): Promise<PlainGoal | undefined>;
    requestPlainTermGoal(pos: DocumentPosition): Promise<PlainTermGoal | undefined>;
}
