import { FastifyPluginAsync } from 'fastify'
import S from 'fluent-json-schema'
import { UserEntity } from '../../db'
import { APP_VERSION } from '../../misc/constants'
import { randomBytesAsync, verifyPassword } from '../../misc/crypto'
import device from './device'
import { noAdditionalProperties } from './no_additional_properties'
import { tokenStorage } from './token_storage'
import user from './user'

const fn: FastifyPluginAsync = async (server) => {
  await server.register(noAdditionalProperties)

  server.setErrorHandler(async (error) => {
    if (error.name === 'EntityNotFound') {
      return server.httpErrors.badRequest()
    }
    return server.httpErrors.internalServerError()
  })

  server.get('/', async () => {
    return { ver: APP_VERSION }
  })

  server.post(
    '/login',
    {
      schema: {
        body: S.object() //
          .prop('login', S.string().required())
          .prop('pass', S.string().required())
      }
    },
    async (req) => {
      const { login, pass } = <any>req.body
      const user = await server.manager.findOneOrFail(UserEntity, { login }, { select: ['id', 'hash', 'salt'] })
      if (!(await verifyPassword(pass, user.hash, user.salt))) throw server.httpErrors.forbidden()
      const accessToken = (await randomBytesAsync(16)).toString('base64')
      tokenStorage.set(accessToken, user.id)
      return accessToken
    }
  )

  await server.register(device, { prefix: '/device' })
  await server.register(user, { prefix: '/user' })
}

export default fn
