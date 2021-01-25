import { FastifyPluginAsync } from 'fastify'
import { Socket } from 'socket.io'
import { DeviceEntity } from '../../db'
import { logger } from '../../misc/logger'
import { RPCEndpoint } from '../../misc/rpc'

interface IDeviceConnection {
  socket: Socket
  rpc: RPCEndpoint
}

interface ISocketMeta {
  deviceId: string
}

const currentConns = new Map<string, IDeviceConnection>()
const socketMetas = new WeakMap<Socket, ISocketMeta>()

const fn: FastifyPluginAsync = async (server) => {
  const nsp = server.io.of('device')
  nsp.use(async (socket, next) => {
    try {
      const { id } = await server.manager.findOneOrFail(DeviceEntity, { ip: socket.handshake.address })
      socketMetas.set(socket, { deviceId: id })
      return next()
    } catch (e) {
      return next(e)
    }
  })

  nsp.on('connection', (socket: Socket) => {
    const { deviceId: id } = socketMetas.get(socket)!

    const rpc = new RPCEndpoint((msg) => socket.emit('rpc', msg))
    socket.on('rpc', rpc.recv.bind(rpc))

    if (currentConns.has(id)) {
      const conn = currentConns.get(id)!
      conn.socket.disconnect(true)
    }
    currentConns.set(id, { socket, rpc })
    logger.info(`[Device IO] Device ${id} connected`)

    socket.on('disconnect', () => {
      logger.info(`[Device IO] Device ${id} disconnected`)
      if (currentConns.get(id)?.socket.id === socket.id) {
        currentConns.delete(id)
      }
    })
  })
}

export default fn

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function invoke(type: string, device: string, ...args: any): Promise<any> {
  const conn = currentConns.get(device)
  if (!conn) throw new Error('Device offline')
  return conn.rpc.invoke(type, ...args)
}
