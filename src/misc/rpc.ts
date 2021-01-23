import { EventEmitter } from 'events'

const ASYNC_TIMEOUT = 10 * 1000 // 10 sec
const MAX_INT32 = 0x7fffffff

function* generateAsyncId(): Generator<number, number, never> {
  for (let i = 0; ; i = (i + 1) & MAX_INT32) yield i
}

interface IRPCAsyncCallMsg {
  asyncId: number
  type: string
  args: any[]
}

interface IRPCAsyncResultMsg {
  asyncId: number
  resolve?: any
  reject?: any
}

interface IRPCEventMsg {
  type: string
  args: any[]
}

export type RPCMsg = IRPCAsyncCallMsg | IRPCAsyncResultMsg | IRPCEventMsg
export type SendFunc = (msg: RPCMsg) => void
export type RPCHandler = (...args: any) => any

function isAsyncMsg(msg: RPCMsg): msg is IRPCAsyncCallMsg | IRPCAsyncResultMsg {
  return 'asyncId' in msg
}

function isAsyncCallMsg(msg: IRPCAsyncCallMsg | IRPCAsyncResultMsg): msg is IRPCAsyncCallMsg {
  return 'type' in msg
}

interface IAsyncState {
  resolve: (result: any) => void
  reject: (reason: any) => void
  timeout: NodeJS.Timeout
}

export class RPCEndpoint extends EventEmitter {
  send
  handlers
  asyncCbs
  asyncTimeouts
  asyncIds

  constructor(send: SendFunc) {
    super()
    this.send = send
    this.handlers = new Map<string, RPCHandler>()
    this.asyncCbs = new Map<number, IAsyncState>()
    this.asyncTimeouts = new Map<number, number>()
    this.asyncIds = generateAsyncId()
  }

  recv(msg: RPCMsg): void {
    if (isAsyncMsg(msg)) {
      if (isAsyncCallMsg(msg)) {
        void this.recvAsyncCallMsg(msg)
      } else {
        this.recvAsyncResultMsg(msg)
      }
    } else {
      super.emit(msg.type, ...msg.args)
    }
  }

  private async recvAsyncCallMsg(msg: IRPCAsyncCallMsg) {
    try {
      const handler = this.handlers.get(msg.type)
      if (!handler) throw new Error('Handler not found')
      const resolve = await Promise.resolve(handler(...msg.args))
      this.send({ asyncId: msg.asyncId, resolve })
    } catch (e) {
      this.send({ asyncId: msg.asyncId, reject: e.message })
    }
  }

  private recvAsyncResultMsg(msg: IRPCAsyncResultMsg) {
    const cb = this.asyncCbs.get(msg.asyncId)
    if (!cb) {
      console.log(`[RPC] Unhandled async result ${msg.asyncId}`)
      return
    }
    clearTimeout(cb.timeout)
    this.asyncCbs.delete(msg.asyncId)
    if ('resolve' in msg) {
      cb.resolve(msg.resolve)
    } else {
      cb.reject(new Error(msg.reject))
    }
  }

  trigger(type: string, ...args: any[]): void {
    this.send({ type, args })
  }

  invoke(type: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const asyncId = this.asyncIds.next().value
      const timeout = setTimeout(() => {
        const cb = this.asyncCbs.get(asyncId)
        if (!cb) {
          console.log(`[RPC] Unhandled async timeout ${asyncId}`)
          return
        }
        this.asyncCbs.delete(asyncId)
        cb.reject(new Error('Timeout'))
      }, ASYNC_TIMEOUT)
      this.asyncCbs.set(asyncId, { resolve, reject, timeout })
      this.send({ asyncId, type, args })
    })
  }

  handle(type: string, handler: RPCHandler): void {
    this.handlers.set(type, handler)
  }

  removeHandler(type: string): void {
    this.handlers.delete(type)
  }
}
