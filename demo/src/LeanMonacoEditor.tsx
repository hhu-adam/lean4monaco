import { useEffect, useRef, useContext } from 'react'
import { LeanMonacoEditor } from 'lean4monaco'
import { LeanMonacoContext } from './LeanMonaco'

function LeanMonacoEditorComponent({fileName, value}: {fileName: string, value: string}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useContext(LeanMonacoContext)

  // You can start multiple `LeanMonacoEditor` instances
  useEffect(() => {
    if (leanMonaco) {
      const leanMonacoEditor = new LeanMonacoEditor()

      ;(async () => {
        await leanMonaco!.whenReady
        console.debug('[demo]: starting editor')
        await leanMonacoEditor.start(codeviewRef.current!, fileName, value)
        console.debug('[demo]: editor started')
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
