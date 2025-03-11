import { useEffect, useRef, useContext, useState } from 'react'
import { LeanMonacoEditor } from 'lean4monaco'
import { LeanMonacoContext } from './LeanMonaco'
import { RpcSessionAtPos } from 'lean4/src/infoview'
import { LeanClient } from 'lean4/src/leanclient'
import { Uri } from 'vscode'
import { RpcConnectParams } from '@leanprover/infoview-api'

function LeanMonacoEditorComponent({fileName, value}: {fileName: string, value: string}) {
  const codeviewRef = useRef<HTMLDivElement>(null)
  const leanMonaco = useContext(LeanMonacoContext)
  
  const [leanMonacoEditor, setLeanMonacoEditor] = useState<LeanMonacoEditor|null>(null)
  const [client, setClient] = useState<LeanClient | null>(null)
  const [uri, setUri] = useState<Uri | null>(null)
  const [rpcSess, setRpcSess] = useState<RpcSessionAtPos|null>(null)
  
  // You can start multiple `LeanMonacoEditor` instances
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
      if (clients?.[0]) {
        setClient(clients[0])
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
    console.log(uri) // TODO: remove me
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

export default LeanMonacoEditorComponent
