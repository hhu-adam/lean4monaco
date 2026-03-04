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
