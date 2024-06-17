import { DocumentPosition } from './util';
type InfoKind = 'cursor' | 'pin';
interface InfoPinnable {
    kind: InfoKind;
    /** Takes an argument for caching reasons, but should only ever (un)pin itself. */
    onPin: (pos: DocumentPosition) => void;
}
/**
 * Note: in the cursor view, we have to keep the cursor position as part of the component state
 * to avoid flickering when the cursor moved. Otherwise, the component is re-initialised and the
 * goal states reset to `undefined` on cursor moves.
 */
export type InfoProps = InfoPinnable & {
    pos?: DocumentPosition;
};
/** Fetches info from the server and renders an {@link InfoDisplay}. */
export declare function Info(props: InfoProps): import("react/jsx-runtime").JSX.Element;
export {};
