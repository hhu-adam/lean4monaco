# Font Subsetting Script

This script creates a subset of the NotoColorEmoji font containing only the glyphs used by lean4monaco.

## Usage

```bash
npm run font:subset
```

This reads the glyph list from `emoji-glyphs.json`, subsets the original 23MB font, and outputs a ~7KB font to `src/fonts/NotoColorEmoji-Subset.ttf`.

## Adding New Glyphs

1. Edit `emoji-glyphs.json` and add the emoji character to the `glyphs` array
2. Run `npm run font:subset`
3. Commit the updated `src/fonts/NotoColorEmoji-Subset.ttf`

## Requirements

The original font file must exist at `src/fonts/NotoColorEmoji-Regular.ttf`. If missing, download it from [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Color+Emoji).
