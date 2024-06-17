import * as React from 'react';
import type { DocumentUri, Position, Range, TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import { EventEmitter } from './event';
/** A document URI and a position in that document. */
export interface DocumentPosition extends Position {
    uri: DocumentUri;
}
export declare namespace DocumentPosition {
    function isEqual(p1: DocumentPosition, p2: DocumentPosition): boolean;
    function toTdpp(p: DocumentPosition): TextDocumentPositionParams;
    function toString(p: DocumentPosition): string;
}
export declare namespace PositionHelpers {
    function isLessThanOrEqual(p1: Position, p2: Position): boolean;
}
export declare namespace RangeHelpers {
    function contains(range: Range, pos: Position, ignoreCharacter?: boolean): boolean;
}
export declare function escapeHtml(s: string): string;
/** @deprecated (unused) */
export declare function colorizeMessage(goal: string): string;
export declare function basename(path: string): string;
/**
 * A specialization of {@link React.useEffect} which executes `f` with the event data
 * whenever `ev` fires.
 * If `key` is provided, `f` is only invoked on events fired with that key.
 */
export declare function useEvent<E, K>(ev: EventEmitter<E, K>, f: (_: E) => void, dependencies?: React.DependencyList, key?: K): void;
/**
 * A piece of React {@link React.useState} which returns the data that `ev` most recently fired with.
 * If `f` is provided, the data is mapped through `f` first. */
export declare function useEventResult<E, K>(ev: EventEmitter<E, K>): E | undefined;
export declare function useEventResult<E, K, T>(ev: EventEmitter<E, K>, f: (newVal: E) => T): T | undefined;
export declare function useServerNotificationEffect<T>(method: string, f: (params: T) => void, deps?: React.DependencyList): void;
/**
 * Returns the same tuple as `setState` such that whenever a server notification with `method`
 * arrives at the editor, the state will be updated according to `f`.
 */
export declare function useServerNotificationState<S, T>(method: string, initial: S, f: (params: T) => Promise<(state: S) => S>, deps?: React.DependencyList): [S, React.Dispatch<React.SetStateAction<S>>];
export declare function useClientNotificationEffect<T>(method: string, f: (params: T) => void, deps?: React.DependencyList): void;
/**
 * Like {@link useServerNotificationState} but for client->server notifications sent by the editor.
 */
export declare function useClientNotificationState<S, T>(method: string, initial: S, f: (state: S, params: T) => S, deps?: React.DependencyList): [S, React.Dispatch<React.SetStateAction<S>>];
/** Useful for controlling {@link usePausableState} from child components. */
export interface PausableProps {
    isPaused: boolean;
    setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
/**
 * Returns `[{ isPaused, setPaused }, tPausable, tRef]` s.t.
 * - `[isPaused, setPaused]` are the paused status state
 * - for as long as `isPaused` is set, `tPausable` holds its initial value (the `t` passed before pausing)
 *   rather than updates with changes to `t`.
 * - `tRef` can be used to overwrite the paused state
 *
 * To pause child components, `startPaused` can be passed in their props.
 */
export declare function usePausableState<T>(startPaused: boolean, t: T): [PausableProps, T, React.MutableRefObject<T>];
export type Keyed<T> = T & {
    key: string;
};
/**
 * Adds a unique `key` property to each element in `elems` using
 * the values of (possibly non-injective) `getId`.
 */
export declare function addUniqueKeys<T>(elems: T[], getId: (el: T) => string): Keyed<T>[];
/** Like `React.forwardRef`, but also allows reading the ref inside the forwarding component.
 * Adapted from https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd */
export declare function forwardAndUseRef<T, P>(render: (props: P, ref: React.RefObject<T>, setRef: (_: T | null) => void) => React.ReactElement | null): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
/** Like `forwardAndUseRef`, but the ref is stored in state so that setting it triggers a render.
 * Should only be used if re-rendering is necessary. */
export declare function forwardAndUseStateRef<T, P>(render: (props: P, ref: T | null, setRef: (_: T | null) => void) => React.ReactElement | null): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
export interface LogicalDomElement {
    contains(el: Node): boolean;
}
export interface LogicalDomStorage {
    /** Registers a descendant in the logical DOM.
     * Returns a function which disposes of the registration. */
    registerDescendant(el: LogicalDomElement): () => void;
}
export declare const LogicalDomContext: React.Context<LogicalDomStorage>;
/** Suppose a component B appears as a React descendant of the component A. For layout reasons,
 * we sometimes don't want B to appear as a descendant of A in the DOM, so we use `createPortal`.
 * We may still however want to carry out `contains` checks as if B were there, i.e. according to
 * the React tree structure rather than the DOM structure. While React already correctly propagates
 * DOM events up the React tree, other functionality such as `contains` is not provided. We provide
 * it in this hook.
 *
 * Accepts a ref to the observed {@link HTMLElement} (A in the example). Returns:
 * - a {@link LogicalDomElement} which provides `contains` checks for that {@link HTMLElement}; and
 * - a {@link LogicalDomStorage} which MUST be passed to a {@link LogicalDomContext} enclosing
 *   the observed {@link HTMLElement}.
 *
 * Additionally, any component which introduces a portal MUST call `registerDescendant` in the
 * {@link LogicalDomContext} with a ref to the portalled component (B in the example). */
export declare function useLogicalDomObserver(elt: React.RefObject<HTMLElement>): [LogicalDomElement, LogicalDomStorage];
/**
 * An effect which calls `onClickOutside` whenever an element not logically descending from `ld`
 * (see {@link useLogicalDomObserver}) is clicked. Note that `onClickOutside` is not called on clicks
 * on the scrollbar since these should usually not impact the app's state. */
export declare function useOnClickOutside(ld: LogicalDomElement, onClickOutside: (_: PointerEvent) => void): void;
/** Sends an exception object to a throwable error.
 * Maps JSON Rpc errors to throwable errors.
 */
export declare function mapRpcError(err: unknown): Error;
/** Catch handler for RPC methods that just returns undefined if the method is not found.
 * This is useful for compatibility with versions of Lean that do not yet have the given RPC method.
 */
export declare function discardMethodNotFound(e: unknown): undefined;
export type AsyncState<T> = {
    state: 'loading';
} | {
    state: 'resolved';
    value: T;
} | {
    state: 'rejected';
    error: any;
};
export type AsyncWithTriggerState<T> = {
    state: 'notStarted';
} | AsyncState<T>;
export declare function useAsyncWithTrigger<T>(fn: () => Promise<T>, deps?: React.DependencyList): [AsyncWithTriggerState<T>, () => Promise<void>];
/** This React hook will run the given promise function `fn` whenever the deps change
 * and use it to update the status and result when the promise resolves.
 *
 * This function prevents race conditions if the requests resolve in a
 * different order to that which they were requested in:
 *
 * - Request 1 is sent with, say, line=42.
 * - Request 2 is sent with line=90.
 * - Request 2 returns with diags=[].
 * - Request 1 returns with diags=['error'].
 *
 * Without `useAsync` we would now return the diagnostics for line 42 even though we're at line 90.
 *
 * When the deps change, the function immediately returns `{ state: 'loading' }`.
 */
export declare function useAsync<T>(fn: () => Promise<T>, deps?: React.DependencyList): AsyncState<T>;
/** Like {@link useAsync} but never transitions from `resolved` to `loading` by internally storing
 * the latest `resolved` state and continuing to return it while an update is in flight. The lower
 * amount of re-renders tends to be less visually jarring.
 */
export declare function useAsyncPersistent<T>(fn: () => Promise<T>, deps?: React.DependencyList): AsyncState<T>;
