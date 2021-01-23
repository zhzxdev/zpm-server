import fp from 'fastify-plugin'
import { Server } from 'socket.io'
import admin from './admin'

declare module 'fastify' {
  interface FastifyInstance {
    io: Server
  }
}

export default fp(async (server) => {
  const io = new Server(server.server)
  server.decorate('io', io)
  await server.register(admin)
})
