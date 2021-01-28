import { FastifyPluginAsync } from 'fastify'

const fn: FastifyPluginAsync = async (server) => {
  server.get('/', async () => {
    //
  })
}

export default fn
