import { useEffect, useRef, useContext } from 'react'
import { LeanMonacoEditor } from 'lean4monaco'
import { LeanMonacoContext } from './LeanMonaco'

function LeanMonacoEditorComponent({fileName}: {fileName: string}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useContext(LeanMonacoContext)

  useEffect(() => {
    if (leanMonaco) {
      const leanMonacoEditor = new LeanMonacoEditor()
      
      ;(async () => {
          await leanMonaco!.whenReady
          await leanMonacoEditor.start(codeviewRef.current!, fileName, '#check Nat')
      })()
      
      return () => {
          leanMonacoEditor.dispose()
      }
    }
  }, [leanMonaco])

  return (
      <div className='codeview' ref={codeviewRef}></div>
  )
}

export default LeanMonacoEditorComponent
