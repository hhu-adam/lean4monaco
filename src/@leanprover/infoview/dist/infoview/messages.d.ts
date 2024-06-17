import * as React from 'react';
import { Diagnostic, DocumentUri } from 'vscode-languageserver-protocol';
import { InteractiveDiagnostic } from '@leanprover/infoview-api';
/** Shows the given messages assuming they are for the given file. */
export declare const MessagesList: React.MemoExoticComponent<({ uri, messages }: {
    uri: DocumentUri;
    messages: InteractiveDiagnostic[];
}) => import("react/jsx-runtime").JSX.Element>;
/** Displays all messages for the specified file. Can be paused. */
export declare function AllMessages({ uri: uri0 }: {
    uri: DocumentUri;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Provides a `LspDiagnosticsContext` which stores the latest version of the
 * diagnostics as sent by the publishDiagnostics notification.
 */
export declare function WithLspDiagnosticsContext({ children }: React.PropsWithChildren<{}>): import("react/jsx-runtime").JSX.Element;
/** Embeds a non-interactive diagnostic into the type `InteractiveDiagnostic`. */
export declare function lspDiagToInteractive(diag: Diagnostic): InteractiveDiagnostic;
