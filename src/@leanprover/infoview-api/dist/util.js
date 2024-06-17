/** Reduce a `TaggedText` into its text contents without tags. */
export function TaggedText_stripTags(tt) {
    const go = (t) => {
        if ('append' in t)
            return t.append.reduce((acc, t_) => acc + go(t_), '');
        else if ('tag' in t)
            return go(t.tag[1]);
        else if ('text' in t)
            return t.text;
        return '';
    };
    return go(tt);
}
/** Filter out anonymous pretty names from the names list. */
export function InteractiveHypothesisBundle_nonAnonymousNames(ih) {
    return ih.names.filter(x => !x.includes('[anonymous]'));
}
//# sourceMappingURL=util.js.map