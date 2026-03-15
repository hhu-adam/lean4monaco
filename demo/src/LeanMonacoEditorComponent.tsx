import { useEffect, useRef, useState } from 'react'
import { LeanMonacoEditor, RpcSessionAtPos, LeanClient } from 'lean4monaco'
import { Uri } from 'vscode'
import { RpcConnectParams } from '@leanprover/infoview-api'
import { useAtomValue } from 'jotai'
import { leanMonacoAtom } from './store/editor-atoms'

/**
 * Demo component with with an editor. You can start multiple `LeanMonacoEditor` instances.
 */
export function LeanMonacoEditorComponent({fileName, value}: {fileName: string, value: string}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useAtomValue(leanMonacoAtom)

  const [leanMonacoEditor, setLeanMonacoEditor] = useState<LeanMonacoEditor|null>(null)
  const [client, setClient] = useState<LeanClient | null>(null)
  const [uri, setUri] = useState<Uri | null>(null)
  const [rpcSess, setRpcSess] = useState<RpcSessionAtPos|null>(null)

  // Start the editor
  useEffect(() => {
    if (leanMonaco) {
      const leanMonacoEditor = new LeanMonacoEditor()

      ;(async () => {
        await leanMonaco!.whenReady
        console.debug('[demo]: starting editor')
        await leanMonacoEditor.start(codeviewRef.current!, fileName, value)
        console.debug('[demo]: editor started')
        setLeanMonacoEditor(leanMonacoEditor)
      })()

      return () => {
        leanMonacoEditor.dispose()
      }
    }
  }, [leanMonaco, fileName, value])

  // RPC example: wait until there is a `client`
  useEffect(() => {
    const updateClient = () => {
      const clients = leanMonaco?.clientProvider?.getClients()
      const firstClient: LeanClient | null = clients?.[0] ?? null
      if (firstClient) {
        setClient(firstClient)
        return true
      }
      return false
    }
    updateClient()
    const interval = setInterval(() => {
      // try to get `client` until successful
      if (updateClient()) {
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [leanMonaco?.clientProvider])

  // RPC example: wait until the `uri` is defined
  useEffect(() => {
    console.log('connecting to RPC')
    console.log(`client: ${client}`)
    console.log(`uri: ${uri}`)
    if (client && uri) {
    client.sendRequest('$/lean/rpc/connect', {uri: uri.toString()} as RpcConnectParams).then(result => {
      const sessionId = result.sessionId
      console.debug(`session id: ${sessionId}`)
      const _rpcSess = new RpcSessionAtPos(client, sessionId, uri.toString())
      setRpcSess(_rpcSess)
    })} else {console.log(`not ready: ${uri}, ${client}`)}
  }, [client, uri])

  // RPC example: start new rpc session using `uri` and `client`
  useEffect(() => {
    const updateUri = () => {
      const model = leanMonacoEditor?.editor?.getModel()
      if (model?.uri) {
        setUri(model.uri)
        return true
      }
      return false
    }
    updateUri()
    const interval = setInterval(() => {
      // try to get `uri` until successful
      if (updateUri()) {
        clearInterval(interval)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [leanMonacoEditor?.editor, uri])

  return <>
    <div className='codeview' ref={codeviewRef}></div>
    <button onClick={() => {
      if (!rpcSess) {
        console.warn('rpc session does not exist yet.')
        return
      }
      // RPC example: send an RPC request
      // (There is also `rpcSess.client.sendNotification`)
      rpcSess.client.sendRequest('$/lean/rpc/call',
        { method: "Lean.Widget.getInteractiveDiagnostics",
          params: {lineRange: {start: 0, end: 1}},
          textDocument: {uri: rpcSess.uri},
          position: {line: 0, character: 0},
          sessionId: rpcSess.sessionId
        }
      ).then(result => {
        console.log("Got an answer to the Rpc request!")
        console.debug(result)
      }).catch(reason => {
        console.error(`Rpc request failed!`)
        console.debug(reason)
      })
    }}>Sample Rpc Request</button>
    <button onClick={() => {
      if (!rpcSess) {
        console.warn('rpc session does not exist yet.')
        return
      }
      // RPC example: send an RPC notification which the server does not understand:
      // the server will return an error.
      rpcSess.client.sendNotification('lean4monaco/not/existing/notification', {})
    }}>Sample Rpc Notification</button>
  </>
}
