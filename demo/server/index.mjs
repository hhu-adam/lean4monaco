import { WebSocketServer } from 'ws';
import express from 'express'
import * as cp from 'child_process';
import * as url from 'url';
import * as rpc from 'vscode-ws-jsonrpc';
import * as path from 'path'
import * as jsonrpcserver from 'vscode-ws-jsonrpc/server';
import os from 'os'

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express()

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocketServer({ server })

const leanProjectPath = path.join(__dirname, 'LeanProject')

function startServerProcess() {

  const serverProcess = cp.spawn("lean", ["--server"], { cwd: leanProjectPath })

  serverProcess.on('error', error =>
    console.error(`Launching Lean Server failed: ${error}`)
  )

  if (serverProcess.stderr !== null) {
    serverProcess.stderr.on('data', data => {
      console.error(`Lean Server: ${data}`)
    })
  }

  return serverProcess
}

/** Transform client URI to valid file on the server */
function urisToFilenames(prefix, obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === 'uri') {
        obj[key] = obj[key].replace('file://', `file://${prefix}`)
      } else if (key === 'rootUri') {
        obj[key] = obj[key].replace('file://', `file://${prefix}`)
      } else if (key === 'rootPath') {
        obj[key] = path.join(prefix, obj[key])
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        urisToFilenames(prefix, obj[key]);
      }
    }
  }
  return obj;
}

/** Transform server file back into client URI */
function FilenamesToUri(prefix, obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key === 'uri') {
        obj[key] = obj[key].replace(prefix, '')
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        FilenamesToUri(prefix, obj[key]);
      }
    }
  }
  return obj;
}

wss.addListener("connection", function(ws, req) {
    const ps = startServerProcess()
    console.log(`[${new Date()}] Socket opened`)

    const socket = {
        onMessage: (cb) => { ws.on("message", cb) },
        onError: (cb) => { ws.on("error", cb) },
        onClose: (cb) => { ws.on("close", cb) },
        send: (data, cb) => { ws.send(data,cb) }
    }
    const reader = new rpc.WebSocketMessageReader(socket)
    const writer = new rpc.WebSocketMessageWriter(socket)
    const socketConnection = jsonrpcserver.createConnection(reader, writer, () => ws.close())
    const serverConnection = jsonrpcserver.createProcessStreamConnection(ps)
    socketConnection.forward(serverConnection, message => {
        urisToFilenames(leanProjectPath, message)

        console.log(`CLIENT: ${JSON.stringify(message)}`)
        // Here would be the first place we could determine the server OS
        // and modify the data sent.
        // TODO: Maybe it could be an option to search `message` recursively for `uri` fields
        // and use `.replaceAll('\\', '/')` or vice-versa on them.
        // console.log('[demo]: os', os.platform())
        return message;
    })
    serverConnection.forward(socketConnection, message => {
        FilenamesToUri(leanProjectPath, message)

        console.log(`SERVER: ${JSON.stringify(message)}`)
        return message;
    });

    // Sending errors from Lean's stderr to the client
    ps.stderr.on('data', data => {
      // TODO: This might be incorrect, i.e. numbers are chosen at random
      let msg = {
        "jsonrpc":"2.0",
        "id": "1",
        "error": {
          "message": data.toString(),
          "code": "-1"
        }
      }
      console.log(`SERVER: ${JSON.stringify(msg)}`)
      ws.send(JSON.stringify(msg))
    })

    ws.on('close', () => {
      console.log(`[${new Date()}] Socket closed`)
    })

    socketConnection.onClose(() => serverConnection.dispose())
    serverConnection.onClose(() => socketConnection.dispose())
})
