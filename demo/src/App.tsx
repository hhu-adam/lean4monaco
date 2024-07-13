import { useEffect, useRef } from 'react'
import './App.css'
import { LeanMonaco, LeanMonacoEditor } from 'lean4monaco'

function App() {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const leanMonaco = new LeanMonaco()
    const leanMonacoEditor = new LeanMonacoEditor()
    
    ;(async () => {
        await leanMonaco.start('ws://localhost:8080/')
        leanMonaco.setInfoviewElement(infoviewRef.current)
        await leanMonacoEditor.start(codeviewRef.current!, '/project/test.lean', '#check Nat')
    })()
    
    return () => {
        leanMonacoEditor.dispose()
        leanMonaco.dispose()
    }
  })

  return (
    <>
      <div className='codeview' ref={codeviewRef}></div>
      <div className='infoview' ref={infoviewRef}></div>
    </>
  )
}

export default App
