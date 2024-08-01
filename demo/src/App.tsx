import { useState } from 'react'
import LeanMonacoComponent from './LeanMonaco'
import { LeanMonacoOptions } from 'lean4monaco'
import './App.css'

function App() {

  /* lean-Monaco options. The websocket URL is where the server should listen.
   * To add settings in `vscode` (i.e. for the editor),
   * you can open your settings in VSCode (Ctrl+,), search
   * for the desired setting, select "Copy Setting as JSON" from the "More Actions"
   * menu next to the selected setting, and paste the copied string here.
   */
  const [options, setOptions] = useState<LeanMonacoOptions>({
    websocket: {
      url: 'ws://localhost:8080/'
    },
    vscode: {
      "workbench.colorTheme": "Visual Studio Light",
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
