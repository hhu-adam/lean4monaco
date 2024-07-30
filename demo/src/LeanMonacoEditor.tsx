import { useEffect, useRef, useContext } from 'react'
import { LeanMonacoEditor } from 'lean4monaco'
import { LeanMonacoContext } from './LeanMonaco'

function LeanMonacoEditorComponent({fileName, value}: {fileName: string, value: string}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useContext(LeanMonacoContext)

  useEffect(() => {
    if (leanMonaco) {
      const leanMonacoEditor = new LeanMonacoEditor()
      
      ;(async () => {
          await leanMonaco!.whenReady
          await leanMonacoEditor.start(codeviewRef.current!, fileName, value)
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
