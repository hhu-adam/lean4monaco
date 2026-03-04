import { useRef, useEffect } from 'react'
import LeanMonacoEditorComponent from './LeanMonacoEditor'
import * as path from 'path'
import { disposeLeanMonacoAtom, initLeanMonacoAtom, leanMonacoAtom, leanMonacoOptionsAtom } from './store/editor-atoms';
import { useAtomValue, useSetAtom } from 'jotai';

function LeanMonacoComponent({ numberEditors } : { numberEditors: number}) {
  const infoviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useAtomValue(leanMonacoAtom)
  const LeanMonacoOptions = useAtomValue(leanMonacoOptionsAtom)
  const initLeanMonaco = useSetAtom(initLeanMonacoAtom)
  const disposeLeanMonaco = useSetAtom(disposeLeanMonacoAtom)

  // You need to start one `LeanMonaco` instance once in your application using a `useEffect`
  useEffect(() => {
    initLeanMonaco({ infoviewElement: infoviewRef.current! })
    return disposeLeanMonaco
  }, [LeanMonacoOptions, disposeLeanMonaco, initLeanMonaco])

  return (
    <>
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
