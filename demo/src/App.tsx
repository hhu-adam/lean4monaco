import { useState } from 'react'
import LeanMonacoComponent from './LeanMonaco'
import { LeanMonacoOptions } from 'lean4monaco'
import './App.css'

function App() {

  const [options, setOptions] = useState<LeanMonacoOptions>({
    websocket: {
      url: 'ws://localhost:8080/'
    },
    vscode: {
      // The default options are defined in `LeanMonaco.start` and can be overwritten here.
      // See docstring of `LeanMonacoOptions`!
      // For example:
      // "editor.wordWrap": false,
    }
  })

  // state to keep track of the number of open editors
  const [numberEditors, setNumberEditors] = useState(1)

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
      <LeanMonacoComponent options={options} numberEditors={numberEditors} />
    </>
  )
}

export default App
