/// <reference types="react" />
import { SubexprInfo, TaggedText } from '@leanprover/infoview-api';
export interface InteractiveTextComponentProps<T> {
    fmt: TaggedText<T>;
}
export interface InteractiveTagProps<T> extends InteractiveTextComponentProps<T> {
    tag: T;
}
export interface InteractiveTaggedTextProps<T> extends InteractiveTextComponentProps<T> {
    InnerTagUi: (_: InteractiveTagProps<T>) => JSX.Element;
}
/**
 * Core loop to display {@link TaggedText} objects. Invokes `InnerTagUi` on `tag` nodes in order to support
 * various embedded information, for example subexpression information stored in {@link CodeWithInfos}.
 * */
export declare function InteractiveTaggedText<T>({ fmt, InnerTagUi }: InteractiveTaggedTextProps<T>): import("react/jsx-runtime").JSX.Element;
export type InteractiveCodeProps = InteractiveTextComponentProps<SubexprInfo>;
/** Displays a {@link CodeWithInfos} obtained via RPC from the Lean server. */
export declare function InteractiveCode(props: InteractiveCodeProps): import("react/jsx-runtime").JSX.Element;
