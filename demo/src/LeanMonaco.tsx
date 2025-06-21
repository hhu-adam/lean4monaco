import { useEffect, useRef, createContext, useState } from 'react'
import { LeanMonaco, LeanMonacoOptions } from 'lean4monaco'
import LeanMonacoEditorComponent from './LeanMonacoEditor'
import * as path from 'path'

export const LeanMonacoContext = createContext<LeanMonaco|null>(null);

function LeanMonacoComponent({options, numberEditors} : {options: LeanMonacoOptions, numberEditors: number}) {
  const [leanMonaco, setLeanMonaco] = useState<LeanMonaco|null>(null)
  const infoviewRef = useRef<HTMLDivElement>(null)

  // You need to start one `LeanMonaco` instance once in your application using a `useEffect`
  useEffect(() => {
    const _leanMonaco = new LeanMonaco()
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
            fileName={path.join('LeanProject', `Test${i}.lean`)}
            /* note: The sample content here is used for the cypress tests. */
            value={`#check ${i}\ndef f${i} : Nat → Nat := fun x ↦ x + 1\n#print f${i}`}/>
        )}
        <div className='infoview' ref={infoviewRef}></div>
      </LeanMonacoContext.Provider>

      <div>
        <button onClick={() => {
          console.log('[LeanMonaco] restarting Lean')
          leanMonaco?.restart()
        }}>Restart Lean</button>
      </div>
    </>
  )
}

export default LeanMonacoComponent
