import * as React from 'react';
/** Returns `[node, isVisible]`. Attach `node` to the dom element you care about as `<div ref={node}>...</div>` and
 * `isVisible` will change depending on whether the node is visible in the viewport or not. */
export declare function useIsVisible(): [(element: HTMLElement) => void, boolean];
interface DetailsProps {
    initiallyOpen?: boolean;
    children: [React.ReactNode, ...React.ReactNode[]];
    setOpenRef?: (_: React.Dispatch<React.SetStateAction<boolean>>) => void;
}
/** Like `<details>` but can be programatically revealed using `setOpenRef`. */
export declare function Details({ initiallyOpen, children: [summary, ...children], setOpenRef }: DetailsProps): JSX.Element;
export {};
