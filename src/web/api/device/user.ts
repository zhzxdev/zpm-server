import { FastifyPluginAsync } from 'fastify'
import { UserEntity } from '../../../db'
import { logOnResponse } from '../../../misc/misc'
import { tokenStorage } from '../token_storage'

const fn: FastifyPluginAsync = async (server) => {
  server.addHook('onResponse', logOnResponse('device', '/api/device/user'))

  server.addHook('preValidation', async (req) => {
    const token = req.headers['x-access-token']
    if (typeof token !== 'string' || !token) throw server.httpErrors.forbidden('Invalid token')

    const id: string | undefined = tokenStorage.get(token)
    if (!id) throw server.httpErrors.forbidden('Invalid token')

    req.user = await server.manager.findOneOrFail(UserEntity, { id })
    if (req.user.disabled) throw server.httpErrors.forbidden('User is disabled')
  })
}

export default fn
