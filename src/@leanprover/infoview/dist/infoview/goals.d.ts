import { InfoviewActionKind, InteractiveGoal, InteractiveGoals } from '@leanprover/infoview-api';
import * as React from 'react';
export declare function goalsToString(goals: InteractiveGoals): string;
interface GoalFilterState {
    /** If true reverse the list of hypotheses, if false present the order received from LSP. */
    reverse: boolean;
    /** If true show hypotheses that have isType=True, otherwise hide them. */
    showType: boolean;
    /** If true show hypotheses that have isInstance=True, otherwise hide them. */
    showInstance: boolean;
    /** If true show hypotheses that contain a dagger in the name, otherwise hide them. */
    showHiddenAssumption: boolean;
    /** If true show the bodies of let-values, otherwise hide them. */
    showLetValue: boolean;
}
interface GoalProps {
    goal: InteractiveGoal;
    filter: GoalFilterState;
    additionalClassNames: string;
}
/**
 * Displays the hypotheses, target type and optional case label of a goal according to the
 * provided `filter`. */
export declare const Goal: React.MemoExoticComponent<(props: GoalProps) => import("react/jsx-runtime").JSX.Element>;
interface FilteredGoalsProps {
    /** Components to render in the header. */
    headerChildren: React.ReactNode;
    /**
     * When this is `undefined`, the component will not appear at all but will remember its state
     * by virtue of still being mounted in the React tree. When it does appear again, the filter
     * settings and collapsed state will be as before. */
    goals?: InteractiveGoals;
    /** Whether or not to display the number of goals. */
    displayCount: boolean;
    /** Whether the list of goals should be expanded on first render. */
    initiallyOpen: boolean;
    /** If specified, the display will be toggled (collapsed/expanded) when this action is requested
     * by the user. */
    togglingAction?: InfoviewActionKind;
}
/**
 * Display goals together with a header containing the provided children as well as buttons
 * to control how the goals are displayed.
 */
export declare const FilteredGoals: React.MemoExoticComponent<({ headerChildren, goals, displayCount, initiallyOpen, togglingAction }: FilteredGoalsProps) => import("react/jsx-runtime").JSX.Element>;
export {};
