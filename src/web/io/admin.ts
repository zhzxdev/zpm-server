import { FastifyPluginAsync } from 'fastify'

const fn: FastifyPluginAsync = async (server) => {
  const io = server.io
  io.use((socket, next) => {
    console.log(socket.handshake.auth)
    next()
  })
}

export default fn
