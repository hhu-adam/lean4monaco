import { useEffect, useRef, createContext, useState } from 'react'
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'
import LeanMonacoEditorComponent from './LeanMonacoEditor';

export const LeanMonacoContext = createContext<LeanMonaco|null>(null);

function LeanMonacoComponent({options} : {options: LeanMonacoOptions}) {
  const [leanMonaco, setLeanMonaco] = useState<LeanMonaco|null>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const leanMonaco = new LeanMonaco()
    setLeanMonaco(leanMonaco)
    leanMonaco.setInfoviewElement(infoviewRef.current!)
    
    ;(async () => {
        await leanMonaco.start(options)
    })()
    
    return () => {
        leanMonaco.dispose()
    }
  }, [options])

  return (
    <>
      <LeanMonacoContext.Provider value={leanMonaco}>
        <LeanMonacoEditorComponent />
        <div className='infoview' ref={infoviewRef}></div>
      </LeanMonacoContext.Provider>
    </>
  )
}

export default LeanMonacoComponent
