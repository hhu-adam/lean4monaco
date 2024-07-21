import { useEffect, useRef, useState } from 'react'
import './App.css'
import LeanMonacoComponent from './LeanMonaco'
import { LeanMonacoOptions } from 'lean4monaco'

function App() {
  const [options, setOptions] = useState<LeanMonacoOptions>({websocket: {url: 'ws://localhost:8080/'}, vscode: {"editor.theme": "Visual Studio Light"}})

  return (
    <>
      <button
        onClick={() => {setOptions({...options, vscode: {...options.vscode, "editor.theme": "Visual Studio Light"}})}}
        data-cy="theme-light"
      >Light</button>
      <button
        onClick={() => {setOptions({...options, vscode: {...options.vscode, "editor.theme": "Visual Studio Dark"}})}}
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
      <LeanMonacoComponent options={options} />
    </>
  )
}

export default App
