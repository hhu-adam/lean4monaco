import { RpcSessionAtPos } from '@leanprover/infoview-api';
import * as React from 'react';
import type { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import { DocumentPosition } from './util';
/** Manages a Lean RPC connection by providing an {@link RpcSessionsContext} to the children. */
export declare function WithRpcSessions({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useRpcSessionAtTdpp(pos: TextDocumentPositionParams): RpcSessionAtPos;
export declare function useRpcSessionAtPos(pos: DocumentPosition): RpcSessionAtPos;
export declare const RpcContext: React.Context<RpcSessionAtPos>;
