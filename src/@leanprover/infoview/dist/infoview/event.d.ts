import type { Disposable } from 'vscode-languageserver-protocol';
export declare class EventEmitter<E, in out K> {
    private freshId;
    private handlers;
    private handlersWithKey;
    current?: E;
    /**
     * Register a handler that will receive events from this emitter
     * and return a closure that removes the handler registration.
     *
     * If `key` is specified, only events fired with that key
     * will be propagated to this handler.
     */
    on(handler: (_: E) => void, key?: K): Disposable;
    /**
     * Propagate the event to registered handlers.
     *
     * The event is propagated to all keyless handlers.
     * Furthermore if `key` is provided,
     * the event is also propagated to handlers registered with that key.
     */
    fire(event: E, key?: K): void;
}
type ExcludeNonEvent<T, U> = T extends (...args: any) => Promise<void> ? U : never;
/**
 * Turn all fields in `T` which extend `(...args: As) => Promise<void>`
 * into event emitter fields `f: EventEmitter<As>`.
 * Other fields are removed.
 */
export type Eventify<T> = {
    [P in keyof T as ExcludeNonEvent<T[P], P>]: T[P] extends (arg: infer A) => Promise<void> ? EventEmitter<A, never> : T[P] extends (...args: infer As) => Promise<void> ? EventEmitter<As, never> : never;
};
export {};
