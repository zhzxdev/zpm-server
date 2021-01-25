import { FastifyPluginAsync } from 'fastify'
import { UserEntity } from '../../../db'
import { tokenStorage } from '../token_storage'
import user from './user'

declare module 'fastify' {
  interface FastifyRequest {
    user: UserEntity
  }
}

const fn: FastifyPluginAsync = async (server) => {
  server.decorateRequest('user', undefined)

  server.addHook('preValidation', async (req) => {
    const token = req.headers['x-access-token']
    if (typeof token !== 'string' || !token) throw server.httpErrors.forbidden()
    const id: string | undefined = tokenStorage.get(token)
    if (!id) throw server.httpErrors.forbidden()
    req.user = await server.manager.findOneOrFail(UserEntity, { id })
  })

  server.get('/', async (req) => {
    return req.user
  })

  await server.register(user, { prefix: '/user' })
}

export default fn
