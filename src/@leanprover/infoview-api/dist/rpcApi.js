/**
 * Defines TS bindings for RPC calls to the Lean server,
 * as well as some utilities which correspond to Lean functions.
 * TODO(WN): One would like to eventually auto-generate the bindings from Lean code.
 * @module
 */
export function getInteractiveGoals(rs, pos) {
    return rs.call('Lean.Widget.getInteractiveGoals', pos);
}
export function getInteractiveTermGoal(rs, pos) {
    return rs.call('Lean.Widget.getInteractiveTermGoal', pos);
}
export function getInteractiveDiagnostics(rs, lineRange) {
    return rs.call('Lean.Widget.getInteractiveDiagnostics', { lineRange });
}
export function InteractiveDiagnostics_msgToInteractive(rs, msg, indent) {
    return rs.call('Lean.Widget.InteractiveDiagnostics.msgToInteractive', {
        msg,
        indent,
    });
}
export function lazyTraceChildrenToInteractive(rs, children) {
    return rs.call('Lean.Widget.lazyTraceChildrenToInteractive', children);
}
export function InteractiveDiagnostics_infoToInteractive(rs, info) {
    return rs.call('Lean.Widget.InteractiveDiagnostics.infoToInteractive', info);
}
export function getGoToLocation(rs, kind, info) {
    return rs.call('Lean.Widget.getGoToLocation', { kind, info });
}
/** Given a position, returns all of the user-widgets on the infotree at this position. */
export function Widget_getWidgets(rs, pos) {
    return rs.call('Lean.Widget.getWidgets', pos);
}
/** Gets the static code for a given widget.
 *
 * We make the assumption that either the code doesn't exist, or it exists and does not change for the lifetime of the widget.
 */
export function Widget_getWidgetSource(rs, pos, hash) {
    return rs.call('Lean.Widget.getWidgetSource', { pos, hash });
}
//# sourceMappingURL=rpcApi.js.map