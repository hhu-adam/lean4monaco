import { FVarId, MVarId, SubexprPos } from '@leanprover/infoview-api';
import * as React from 'react';
import { HoverState } from './tooltips';
/**
 * A location within a goal. It is either:
 * - one of the hypotheses; or
 * - (a subexpression of) the type of one of the hypotheses; or
 * - (a subexpression of) the value of one of the let-bound hypotheses; or
 * - (a subexpression of) the goal type. */
export type GoalLocation = {
    hyp: FVarId;
} | {
    hypType: [FVarId, SubexprPos];
} | {
    hypValue: [FVarId, SubexprPos];
} | {
    target: SubexprPos;
};
export declare namespace GoalLocation {
    function isEqual(l1: GoalLocation, l2: GoalLocation): boolean;
    function withSubexprPos(l: GoalLocation, p: SubexprPos): GoalLocation;
}
/**
 * A location within a goal state. It identifies a specific goal together with a {@link GoalLocation}
 * within it.  */
export interface GoalsLocation {
    /** Which goal the location is in. */
    mvarId: MVarId;
    loc: GoalLocation;
}
export declare namespace GoalsLocation {
    function isEqual(l1: GoalsLocation, l2: GoalsLocation): boolean;
    function withSubexprPos(l: GoalsLocation, p: SubexprPos): GoalsLocation;
}
/**
 * An interface available through a React context in components where selecting subexpressions
 * makes sense. Currently this is only the goal state display. There, {@link GoalLocation}s can be
 * selected. */
export interface Locations {
    isSelected: (l: GoalsLocation) => boolean;
    setSelected: (l: GoalsLocation, fn: React.SetStateAction<boolean>) => void;
    /**
     * A template for the location of the current component. It is defined if and only if the current
     * component is a subexpression of a selectable expression. We use
     * {@link GoalsLocation.withSubexprPos} to map this template to a complete location. */
    subexprTemplate?: GoalsLocation;
}
export declare const LocationsContext: React.Context<Locations | undefined>;
type SelectableLocationProps = React.PropsWithoutRef<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>> & {
    locs?: Locations;
    loc?: GoalsLocation;
    alwaysHighlight: boolean;
    setHoverState?: React.Dispatch<React.SetStateAction<HoverState>>;
};
/**
 * A `<span>` with a corresponding {@link GoalsLocation} which can be (un)selected using shift-click.
 * If `locs` or `loc` is `undefined`, selection functionality is turned off. The element is also
 * highlighted when hovered over if `alwaysHighlight` is `true` or `locs` and `loc` are both defined.
 * `setHoverState` is passed through to {@link DetectHoverSpan}. */
export declare function SelectableLocation(props_: SelectableLocationProps): JSX.Element;
export {};
