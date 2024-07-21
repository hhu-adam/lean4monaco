import { useEffect, useRef } from 'react'
import { LeanMonaco, LeanMonacoEditor, LeanMonacoOptions } from 'lean4monaco'

function LeanMonacoComponent({options} : {options: LeanMonacoOptions}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const leanMonaco = new LeanMonaco()
    const leanMonacoEditor = new LeanMonacoEditor()
    
    ;(async () => {
        await leanMonaco.start(options)
        leanMonaco.setInfoviewElement(infoviewRef.current!)
        await leanMonacoEditor.start(codeviewRef.current!, `/project/test${Math.random()}.lean`, '#check Nat', options.vscode!["editor.theme"]!)
    })()
    
    return () => {
        leanMonacoEditor.dispose()
        leanMonaco.dispose()
    }
  }, [options])

  return (
    <>
      <div className='codeview' ref={codeviewRef}></div>
      <div className='infoview' ref={infoviewRef}></div>
    </>
  )
}

export default LeanMonacoComponent
