# LeanWeb Font

This font currently only contains 5 glpyphs:

* 🎉: Used for "No Goals"
* ❌, ✅, 💥: Used for instance synthesis debugging
* 🎭: Used in Lean4game as "no goals, but warnings"

The main purpose of this font is to provide overwrites where the glpyhs from
[JuliaMono](https://juliamono.netlify.app/) are not ideal for Lean. E.g. the glyphs "❌✅💥🎉" are
used by `set_option trace.Meta.synthInstance true`, but in JuliaMono some of them are monochromatic,
making it hard to see them. ()

The glyphs in this font are all copied from Google's
[NotoEmojiColor](https://github.com/googlefonts/noto-emoji) and the Software
[Glyphs 3](https://glyphsapp.com/) (trial) was used
to create the font.

## Further plans

Some further symbols used by Lean which are not included in the font yet include:

* ▼▶: used for instance synthesis debugging. (Ideally they should look identical up to rotation)
* ✝: used for inaccessible variables. (should have a slim design)
