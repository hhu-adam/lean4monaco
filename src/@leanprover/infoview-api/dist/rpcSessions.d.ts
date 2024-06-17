import type { DocumentUri, TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import { RpcCallParams, RpcPtr, RpcReleaseParams } from './lspTypes';
/**
 * Abstraction of the Lean server interface required for RPC communication.
 *
 * This interface can be implemented both in the infoview (relaying the LSP
 * messages to the extension via webview RPC mechanism), as well as in the
 * extension itself (directly sending the LSP messages via the
 * `vscode-languageserver-node` library (TODO)).
 */
export interface RpcServerIface {
    /**
     * Creates an RPC session for the given uri and returns the session id.
     * The implementation of `RpcServerIface` takes care to send any required
     * keepalive notifications.
     */
    createRpcSession(uri: DocumentUri): Promise<string>;
    /** Closes an RPC session created with `createRpcSession`. */
    closeRpcSession(sessionId: string): void;
    /** Sends an RPC call to the Lean server. */
    call(request: RpcCallParams): Promise<any>;
    /** Sends an RPC reference release notification to the server. */
    release(request: RpcReleaseParams): void;
}
/**
 * An RPC session.  The session object gives access to all the
 * `@[serverRpcMethod]`s available at the position it is initialized with.
 * Morally it is a fixed set of `@[serverRpcMethod]`s together with the RPC
 * reference state (as identified by the session ID on the wire).
 *
 * `RpcRef`s returned by calls from one `RpcSessionAtPos` may only be passed as
 * arguments to RPC calls *on the same `RpcSessionAtPos` object*.
 * Passing an `RpcRef` from one session to another is unsafe.
 *
 * (The Lean 4 RPC protocol requires every request to specify a position in the
 * file; only `@[serverRpcMethod]` declarations above this position are callable.
 * Implementations of this interface bundle the position.
 * The position and session ID remain the same over the whole lifetime of the
 * `RpcSessionAtPos` object.)
 */
export interface RpcSessionAtPos {
    call<T, S>(method: string, params: T): Promise<S>;
}
declare class RpcSessionForFile {
    uri: DocumentUri;
    sessions: RpcSessions;
    sessionId: Promise<string>;
    /**
     * `failed` stores a fatal exception indicating that the RPC session can no longer be used.
     * For example: the worker crashed, etc.
     */
    failed?: any;
    refsToRelease: RpcPtr<any>[];
    finalizers: FinalizationRegistry<RpcPtr<any>>;
    /** Essentially a cache for {@link at}. See {@link at} for why we need this. */
    sessionsAtPos: Map<string, RpcSessionAtPos>;
    constructor(uri: DocumentUri, sessions: RpcSessions);
    releaseNow(): Promise<void>;
    /** Traverses an object received from the RPC server and registers all contained references
     * for future garbage collection.
     *
     * The function implements a form of "conservative garbage collection" where
     * it treats any subobject `{'p': v}` as a potential reference.  Therefore
     * `p` should not be used as a field name on the Lean side to prevent false
     * positives.
     *
     * It is unclear if the false positives will become a big issue.  Earlier
     * versions of the extension had manually written registration functions for
     * every type, but those are a lot of boilerplate.  If we change back to
     * that approach, we should generate them automatically.
     */
    registerRefs(o: any): void;
    private failWithoutClosing;
    fail(reason: any): void;
    call(pos: TextDocumentPositionParams, method: string, params: any): Promise<any>;
    /** Returns this session "specialized" to a specific position within its file. This is
     * guaranteed to return the same (by reference) object if called multiple times with the same
     * (by deep comparison) position, on the same `RpcSessionForFile`. It can therefore be used
     * as a React dep. */
    at(pos: TextDocumentPositionParams): RpcSessionAtPos;
}
/** Manages RPC sessions for multiple files. */
export declare class RpcSessions {
    iface: RpcServerIface;
    /**
     * Contains the active `RpcSessionForFile` objects.
     * Once an `RpcSessionForFile` is set to failed (e.g. due to a server crash),
     * it is removed from this map.  The `connect` method will then automatically
     * reconnect the next time it is called.
     */
    sessions: Map<DocumentUri, RpcSessionForFile>;
    constructor(iface: RpcServerIface);
    private connectCore;
    /**
     * Returns an `RpcSessionAtPos` for the given position.
     * Calling `connect` multiple times will return the same
     * session (with the same session ID).
     * A new session is only created if a fatal error occurs (i.e., the worker
     * crashes) or the session is closed manually (if the file is closed).
     */
    connect(pos: TextDocumentPositionParams): RpcSessionAtPos;
    closeSessionForFile(uri: DocumentUri): void;
    closeAllSessions(): void;
    dispose(): void;
}
export {};
