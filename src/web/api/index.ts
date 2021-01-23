import { FastifyPluginAsync } from 'fastify'
import { APP_VERSION } from '../../misc/constants'

const fn: FastifyPluginAsync = async (server) => {
  server.get('/', async () => {
    return { ver: APP_VERSION }
  })
}

export default fn
