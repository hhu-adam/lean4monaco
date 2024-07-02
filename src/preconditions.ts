import { OutputChannel } from "vscode";
import { ExtUri } from "./monaco-lean4/vscode-lean4/src/utils/exturi";
import { PreconditionCheckResult } from "./monaco-lean4/vscode-lean4/src/diagnostics/setupNotifs";

export async function checkLean4ProjectPreconditions(
    channel: OutputChannel,
    folderUri: ExtUri,
): Promise<PreconditionCheckResult> {
    return 'Fulfilled';
}