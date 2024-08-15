import { useEffect, useRef, createContext, useState } from 'react'
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'
import LeanMonacoEditorComponent from './LeanMonacoEditor'

export const LeanMonacoContext = createContext<LeanMonaco|null>(null);

function LeanMonacoComponent({options, numberEditors} : {options: LeanMonacoOptions, numberEditors: number}) {
  const [leanMonaco, setLeanMonaco] = useState<LeanMonaco|null>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  // You need to start one `LeanMonaco` instance once in your application using a `useEffect`
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
        {[...Array(numberEditors)].map((_x, i) =>
          <LeanMonacoEditorComponent key={i} fileName={`/project/test${i}.lean`} value={`#check ${i}\n#eval (panic "oh no" : Nat)`}/>
        )}
        <div className='infoview' ref={infoviewRef}></div>
      </LeanMonacoContext.Provider>

      <div>
        <button onClick={(ev)=> {
          console.log('restarting Lean')
          leanMonaco?.clientProvider?.getClients().map(client => {client.restart()})
        }}>Restart Lean</button>
      </div>
    </>
  )
}

export default LeanMonacoComponent
