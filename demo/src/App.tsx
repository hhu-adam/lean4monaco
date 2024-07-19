import { useEffect, useRef, useState } from 'react'
import './App.css'
import { LeanMonaco, LeanMonacoEditor, LeanMonacoOptions } from 'lean4monaco'

function App() {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)
  const [options, setOptions] = useState<LeanMonacoOptions>({websocket: {url: 'ws://localhost:8080/'}, vscode: {"editor.theme": "Visual Studio Light"}})

  useEffect(() => {
    const leanMonaco = new LeanMonaco()
    const leanMonacoEditor = new LeanMonacoEditor()
    
    ;(async () => {
        console.log(options)
        await leanMonaco.start(options)
        leanMonaco.setInfoviewElement(infoviewRef.current!)
        await leanMonacoEditor.start(codeviewRef.current!, '/project/test.lean', '#check Nat')
    })()
    
    return () => {
        leanMonacoEditor.dispose()
        leanMonaco.dispose()
    }
  }, [options])

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
      <div className='codeview' ref={codeviewRef}></div>
      <div className='infoview' ref={infoviewRef}></div>
    </>
  )
}

export default App
