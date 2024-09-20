import { useEffect, useRef, createContext, useState } from 'react'
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'
import LeanMonacoEditorComponent from './LeanMonacoEditor'

export const LeanMonacoContext = createContext<LeanMonaco|null>(null);

function LeanMonacoComponent({options, numberEditors} : {options: LeanMonacoOptions, numberEditors: number}) {
  const [leanMonaco, setLeanMonaco] = useState<LeanMonaco|null>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  // You need to start one `LeanMonaco` instance once in your application using a `useEffect`
  useEffect(() => {
    var _leanMonaco = new LeanMonaco()
    setLeanMonaco(_leanMonaco)
    _leanMonaco.setInfoviewElement(infoviewRef.current!)


    ;(async () => {
      await _leanMonaco.start(options)
      console.debug('[demo]: leanMonaco started')
    })()

    return () => {
      _leanMonaco.dispose()
    }
  }, [options])

  return (
    <>
      <LeanMonacoContext.Provider value={leanMonaco}>
        {[...Array(numberEditors)].map((_x, i) =>
          <LeanMonacoEditorComponent
            key={i}
            // fileName: must be a valid file inside the Lean project
            // (or lake does not read the `leanOptions` in the `lakefile`), AND
            // must be inside a folder, i.e. 'LeanProject.lean' does not work (monaco bug?) :(
            fileName={`LeanProject/Test${i}.lean`}
            value={`#check ${i}\ndef f : Nat → Nat := fun x ↦ x + 1\n#print f`}/>
        )}
        <div className='infoview' ref={infoviewRef}></div>
      </LeanMonacoContext.Provider>

      <div>
        <button onClick={(_ev)=> {
          console.log('[LeanMonaco] restarting Lean')
          leanMonaco?.clientProvider?.getClients().map(client => {client.restart()})
        }}>Restart Lean</button>
      </div>
    </>
  )
}

export default LeanMonacoComponent
