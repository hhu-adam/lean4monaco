import * as React from 'react';
export type TooltipProps = React.PropsWithChildren<React.HTMLProps<HTMLDivElement>> & {
    reference: HTMLElement | null;
};
export declare function Tooltip(props_: TooltipProps): React.ReactPortal;
export declare const WithToggleableTooltip: React.ForwardRefExoticComponent<Omit<React.HTMLProps<HTMLSpanElement> & {
    isTooltipShown: boolean;
    hideTooltip: () => void;
    tooltipChildren: React.ReactNode;
}, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** Hover state of an element. The pointer can be
 * - elsewhere (`off`)
 * - over the element (`over`)
 * - over the element with Ctrl or Meta (⌘ on Mac) held (`ctrlOver`)
 */
export type HoverState = 'off' | 'over' | 'ctrlOver';
/** An element which calls `setHoverState` when the hover state of its DOM children changes.
 *
 * It is implemented with JS rather than CSS in order to allow nesting of these elements. When nested,
 * only the smallest (deepest in the DOM tree) {@link DetectHoverSpan} has an enabled hover state. */
export declare const DetectHoverSpan: React.ForwardRefExoticComponent<Omit<React.ClassAttributes<HTMLSpanElement> & React.HTMLAttributes<HTMLSpanElement> & {
    setHoverState: React.Dispatch<React.SetStateAction<HoverState>>;
}, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** Shows a tooltip when the children are hovered over or clicked.
 *
 * An `onClick` middleware can optionally be given in order to control what happens when the
 * hoverable area is clicked. The middleware can invoke `next` to execute the default action
 * which is to pin the tooltip open. */
export declare const WithTooltipOnHover: React.ForwardRefExoticComponent<Omit<Omit<React.HTMLProps<HTMLSpanElement>, "onClick"> & {
    tooltipChildren: React.ReactNode;
    onClick?: ((event: React.MouseEvent<HTMLSpanElement>, next: React.MouseEventHandler<HTMLSpanElement>) => void) | undefined;
}, "ref"> & React.RefAttributes<HTMLSpanElement>>;
