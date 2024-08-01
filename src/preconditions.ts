import { OutputChannel } from "vscode";
import { ExtUri } from "./vscode-lean4/vscode-lean4/src/utils/exturi";
import { PreconditionCheckResult } from "./vscode-lean4/vscode-lean4/src/diagnostics/setupNotifs";

export async function checkLean4ProjectPreconditions(
  channel: OutputChannel,
  folderUri: ExtUri,
): Promise<PreconditionCheckResult> {
  return 'Fulfilled'
}