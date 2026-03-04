import { atom } from "jotai";
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'

const socketUrl = 'ws://' + window.location.hostname + ':8080/'

export const leanMonacoOptionsAtom = atom<LeanMonacoOptions>({
  websocket: {
    url: socketUrl
  },
  vscode: {
    // The default options are defined in `LeanMonaco.start` and can be overwritten here.
    // See docstring of `LeanMonacoOptions`!
    // For example:
    // "editor.wordWrap": false,
  }
})

/** The unique leanMonaco instance for the entire application */
export const leanMonacoAtom = atom<LeanMonaco|null>(null)

/** Method to initialise leanMonaco */
export const initLeanMonacoAtom = atom(
  null,
  async (get, set, { infoviewElement } : { infoviewElement: HTMLDivElement}) => {
    const previous = get(leanMonacoAtom)
    previous?.dispose()
    const options = get(leanMonacoOptionsAtom)
    const leanMonaco = new LeanMonaco()
    leanMonaco.setInfoviewElement(infoviewElement)
    await leanMonaco.start(options)
    console.debug('[demo]: leanMonaco started')
    set(leanMonacoAtom, leanMonaco)
  }
)

/** Method to discard the leanMonaco instance */
export const disposeLeanMonacoAtom = atom(
  null,
  (get, set) => {
    const leanMonaco = get(leanMonacoAtom)
    if (leanMonaco) {
      leanMonaco.dispose()
      set(leanMonacoAtom, null)
    }
  }
)
