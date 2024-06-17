import { InteractiveHypothesisBundle, TaggedText } from './rpcApi';
/** Reduce a `TaggedText` into its text contents without tags. */
export declare function TaggedText_stripTags<T>(tt: TaggedText<T>): string;
/** Filter out anonymous pretty names from the names list. */
export declare function InteractiveHypothesisBundle_nonAnonymousNames(ih: InteractiveHypothesisBundle): string[];
