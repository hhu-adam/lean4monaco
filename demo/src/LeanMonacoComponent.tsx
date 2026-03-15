import { useRef, useEffect } from 'react'
import { LeanMonacoEditorComponent } from './LeanMonacoEditorComponent'
import * as path from 'path'
import { leanMonacoAtom, leanMonacoOptionsAtom } from './store/editor-atoms';
import { useAtom, useAtomValue } from 'jotai';
import { LeanMonaco } from 'lean4monaco';

/**
 * Demo component with an infoview and multiple editors.
 */
export function LeanMonacoComponent({ numberEditors } : { numberEditors: number}) {
  const infoviewRef = useRef<HTMLDivElement>(null)
  const [leanMonaco, setLeanMonaco] = useAtom(leanMonacoAtom)
  const leanMonacoOptions = useAtomValue(leanMonacoOptionsAtom)

  // You need to start one `LeanMonaco` instance once in your application using a `useEffect`
  useEffect(() => {
    const _leanMonaco = new LeanMonaco()
    setLeanMonaco(_leanMonaco)
    _leanMonaco.setInfoviewElement(infoviewRef.current!)

    ;(async () => {
      await _leanMonaco.start(leanMonacoOptions)
      console.debug('[demo]: leanMonaco started')
    })()

    return () => {
      leanMonaco?.dispose()
    }
  }, [leanMonacoOptions, setLeanMonaco])

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
          value={`#check ${i}\ndef f${i} : Nat → Nat := fun x ↦ x + 1\n#print f${i}\n#check "🎉❌✅💥▼▶🎭✝⏳🟡💡🐙🔍🏁"`}/>
      )}
      <div className='infoview' ref={infoviewRef} />
      <div>
        <button onClick={() => {
          console.log('[LeanMonaco] restarting Lean')
          leanMonaco?.restart()
        }}>Restart Lean</button>
      </div>
    </>
  )
}
