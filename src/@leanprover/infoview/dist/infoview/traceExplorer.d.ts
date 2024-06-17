/**
 * Traces of any substantial compilation or elaboration process are usually extremely verbose,
 * which makes them slow (or even infeasible) to pretty-print and difficult to understand.
 * Instead, we provide a "TraceExplorer" UI which allows users to lazily expand trace subtrees,
 * and (TODO) execute search queries.
 *
 * @module
 */
import { MsgEmbed } from '@leanprover/infoview-api';
import { InteractiveTextComponentProps } from './interactiveCode';
export declare function InteractiveMessage({ fmt }: InteractiveTextComponentProps<MsgEmbed>): import("react/jsx-runtime").JSX.Element;
