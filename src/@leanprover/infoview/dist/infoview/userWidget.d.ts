import * as React from 'react';
import { InteractiveGoal, InteractiveTermGoal, RpcSessionAtPos, UserWidgetInstance } from '@leanprover/infoview-api';
import { GoalsLocation } from './goalLocation';
import { DocumentPosition } from './util';
/**
 * Fetch source code from Lean and dynamically import it as a JS module.
 *
 * The source must hash to `hash` (in Lean) and must have been annotated with `@[widget]`
 * or `@[widget_module]` at some point before `pos`. */
export declare function importWidgetModule(rs: RpcSessionAtPos, pos: DocumentPosition, hash: string): Promise<any>;
export interface DynamicComponentProps {
    pos: DocumentPosition;
    hash: string;
    props: any;
}
/**
 * Use {@link importWidgetModule} to import a module which must `export default` a React component,
 * and render that with `props`. Errors in the component are caught in an error boundary. */
export declare function DynamicComponent(props_: React.PropsWithChildren<DynamicComponentProps>): import("react/jsx-runtime").JSX.Element;
interface PanelWidgetDisplayProps {
    pos: DocumentPosition;
    goals: InteractiveGoal[];
    termGoal?: InteractiveTermGoal;
    selectedLocations: GoalsLocation[];
    widget: UserWidgetInstance;
}
/** Props that every infoview panel widget receives as input to its `default` export. */
export interface PanelWidgetProps {
    /** Cursor position in the file at which the widget is being displayed. */
    pos: DocumentPosition;
    /** The current tactic-mode goals. */
    goals: InteractiveGoal[];
    /** The current term-mode goal, if any. */
    termGoal?: InteractiveTermGoal;
    /** Locations currently selected in the goal state. */
    selectedLocations: GoalsLocation[];
}
export declare function PanelWidgetDisplay({ pos, goals, termGoal, selectedLocations, widget }: PanelWidgetDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
