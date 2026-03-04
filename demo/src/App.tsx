import { useEffect, useRef, useState } from 'react'
import { LeanMonacoComponent } from './LeanMonacoComponent'
import './App.css'
import { leanMonacoOptionsAtom } from './store/editor-atoms'
import { useAtom } from 'jotai'

function App() {

  const monacoRef = useRef<HTMLDivElement>(null)
  const [options, setOptions] = useAtom(leanMonacoOptionsAtom)

  // state to keep track of the number of open editors
  const [numberEditors, setNumberEditors] = useState(1)

  // Set the `mainContainer` of the monaco editor.
  useEffect(() => {
    setOptions({...options, htmlElement:monacoRef.current ?? undefined})
  }, [monacoRef])

  return (
    <>
      <div className="controls">
        <button
          onClick={() => {setOptions({...options, vscode: {...options.vscode, "workbench.colorTheme": "Visual Studio Light"}})}}
          data-cy="theme-light"
        >Light</button>
        <button
          onClick={() => {setOptions({...options, vscode: {...options.vscode, "workbench.colorTheme": "Visual Studio Dark"}})}}
          data-cy="theme-dark"
        >Dark</button>
        <button
          onClick={() => {setOptions({...options, vscode: {...options.vscode, "lean4.input.leader": "\\"}})}}
          data-cy="leader-backslash"
        >Input Leader "\"</button>
        <button
          onClick={() => {setOptions({...options, vscode: {...options.vscode, "lean4.input.leader": ","}})}}
          data-cy="leader-comma"
        >Input Leader ","</button>
        <input type="number" min="1" max="3"
          value={numberEditors}
          data-cy="number-editors"
          onChange={(event) => {
            setNumberEditors(parseInt(event.target.value));
          }}
        />
      </div>
      <div id="lean4monaco-wrapper" ref={monacoRef} >
        <LeanMonacoComponent numberEditors={numberEditors} />
      </div>
    </>
  )
}

export default App
