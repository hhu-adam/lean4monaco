import { RpcErrorCode, RpcPtr } from './lspTypes';
class RpcSessionForFile {
    constructor(uri, sessions) {
        this.uri = uri;
        this.sessions = sessions;
        this.refsToRelease = [];
        /** Essentially a cache for {@link at}. See {@link at} for why we need this. */
        this.sessionsAtPos = new Map();
        this.sessionId = (async () => {
            try {
                return await sessions.iface.createRpcSession(uri);
            }
            catch (ex) {
                this.failWithoutClosing(ex);
                throw ex;
            }
        })();
        this.sessionId.catch(() => { }); // silence uncaught exception warning
        // Here we hook into the JS GC and send release-reference notifications
        // whenever the GC finalizes a number of `RpcPtr`s. Requires ES2021.
        let releaseTimeout;
        this.finalizers = new FinalizationRegistry(ptr => {
            if (this.failed)
                return;
            this.refsToRelease.push(ptr);
            // We release eagerly instead of delaying when this many refs become garbage
            const maxBatchSize = 100;
            if (this.refsToRelease.length > maxBatchSize) {
                void this.releaseNow();
                clearTimeout(releaseTimeout);
                releaseTimeout = undefined;
            }
            else if (releaseTimeout === undefined) {
                releaseTimeout = window.setTimeout(() => {
                    void this.releaseNow();
                    releaseTimeout = undefined;
                }, 100);
            }
        });
    }
    async releaseNow() {
        const sessionId = await this.sessionId;
        if (this.failed || this.refsToRelease.length === 0)
            return;
        this.sessions.iface.release({
            uri: this.uri,
            sessionId,
            refs: this.refsToRelease,
        });
        this.refsToRelease = [];
    }
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
    registerRefs(o) {
        if (o instanceof Object) {
            if (Object.keys(o).length === 1 && 'p' in o && typeof o.p !== 'object') {
                this.finalizers.register(o, RpcPtr.copy(o));
            }
            else {
                for (const v of Object.values(o))
                    this.registerRefs(v);
            }
        }
        else if (o instanceof Array) {
            for (const e of o)
                this.registerRefs(e);
        }
    }
    failWithoutClosing(reason) {
        this.failed = reason;
        // NOTE(WN): the sessions map is keyed by URI rather than ID and by the time this
        // function executes, a new session for the same file may already have been added.
        // So we should only delete the stored session if it is this one.
        if (this.sessions.sessions.get(this.uri) === this) {
            this.sessions.sessions.delete(this.uri);
        }
    }
    fail(reason) {
        this.failWithoutClosing(reason);
        void this.sessionId.then(id => this.sessions.iface.closeRpcSession(id));
    }
    async call(pos, method, params) {
        const sessionId = await this.sessionId;
        if (this.failed)
            throw this.failed;
        try {
            const result = await this.sessions.iface.call({ method, params, sessionId, ...pos });
            this.registerRefs(result);
            // HACK: most of our types are `T | undefined` so try to return something matching that interface
            if (result === null)
                return undefined;
            return result;
        }
        catch (ex) {
            if (ex?.code === RpcErrorCode.WorkerCrashed ||
                ex?.code === RpcErrorCode.WorkerExited ||
                ex?.code === RpcErrorCode.RpcNeedsReconnect) {
                this.fail(ex);
            }
            throw ex;
        }
    }
    /** Returns this session "specialized" to a specific position within its file. This is
     * guaranteed to return the same (by reference) object if called multiple times with the same
     * (by deep comparison) position, on the same `RpcSessionForFile`. It can therefore be used
     * as a React dep. */
    at(pos) {
        // As JS tradition dictates, we use stringification for deep comparison of `Position`s in a `Map`.
        const posStr = `${pos.position.line}:${pos.position.character}`;
        if (this.sessionsAtPos.has(posStr))
            return this.sessionsAtPos.get(posStr);
        const atPos = { call: (method, params) => this.call(pos, method, params) };
        this.sessionsAtPos.set(posStr, atPos);
        return atPos;
    }
}
/** Manages RPC sessions for multiple files. */
export class RpcSessions {
    constructor(iface) {
        this.iface = iface;
        /**
         * Contains the active `RpcSessionForFile` objects.
         * Once an `RpcSessionForFile` is set to failed (e.g. due to a server crash),
         * it is removed from this map.  The `connect` method will then automatically
         * reconnect the next time it is called.
         */
        this.sessions = new Map();
    }
    connectCore(uri) {
        if (this.sessions.has(uri))
            return this.sessions.get(uri);
        const sess = new RpcSessionForFile(uri, this);
        this.sessions.set(uri, sess);
        return sess;
    }
    /**
     * Returns an `RpcSessionAtPos` for the given position.
     * Calling `connect` multiple times will return the same
     * session (with the same session ID).
     * A new session is only created if a fatal error occurs (i.e., the worker
     * crashes) or the session is closed manually (if the file is closed).
     */
    connect(pos) {
        return this.connectCore(pos.textDocument.uri).at(pos);
    }
    /* Closes the session for the given Uri. */
    closeSessionForFile(uri) {
        void this.sessions.get(uri)?.fail('file closed');
    }
    closeAllSessions() {
        for (const k of [...this.sessions.keys()])
            this.closeSessionForFile(k);
    }
    dispose() {
        this.closeAllSessions();
    }
}
//# sourceMappingURL=rpcSessions.js.map