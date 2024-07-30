import { useEffect, useRef, createContext, useState } from 'react'
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'
import LeanMonacoEditorComponent from './LeanMonacoEditor';

export const LeanMonacoContext = createContext<LeanMonaco|null>(null);

function LeanMonacoComponent({options, numberEditors} : {options: LeanMonacoOptions, numberEditors: number}) {
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
        {[...Array(numberEditors)].map((x, i) =>
          <LeanMonacoEditorComponent key={i} fileName={`/project/test${i}.lean`} value={`#check ${i}`}/>
        )}
        <div className='infoview' ref={infoviewRef}></div>
      </LeanMonacoContext.Provider>
    </>
  )
}

export default LeanMonacoComponent
