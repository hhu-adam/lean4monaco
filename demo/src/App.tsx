import { useState } from 'react'
import './App.css'
import LeanMonacoComponent from './LeanMonaco'
import { LeanMonacoOptions } from 'lean4monaco'

function App() {
  const [options, setOptions] = useState<LeanMonacoOptions>({websocket: {url: 'ws://localhost:8080/'}, vscode: {"workbench.colorTheme": "Visual Studio Light"}})
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
