import { WebSocketServer } from 'ws';
import express from 'express'
import * as cp from 'child_process';
import * as url from 'url';
import * as rpc from 'vscode-ws-jsonrpc';
import * as path from 'path'
import * as jsonrpcserver from 'vscode-ws-jsonrpc/server';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const app = express()

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new WebSocketServer({ server })

function startServerProcess() {

  const serverProcess = cp.spawn("lake", ["serve", "--"], { cwd: path.join(__dirname, 'LeanProject') })

  serverProcess.on('error', error =>
    console.error(`Launching Lean Server failed: ${error}`)
  )

  if (serverProcess.stderr !== null) {
    serverProcess.stderr.on('data', data =>
      console.error(`Lean Server: ${data}`)
    )
  }
  return serverProcess
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
        // console.log(`CLIENT: ${JSON.stringify(message)}`)
        return message;
    })
    serverConnection.forward(socketConnection, message => {
        // console.log(`SERVER: ${JSON.stringify(message)}`)
        return message;
    });

    ws.on('close', () => {
      console.log(`[${new Date()}] Socket closed`)
    })

    socketConnection.onClose(() => serverConnection.dispose())
    serverConnection.onClose(() => socketConnection.dispose())
})
