import S from 'fluent-json-schema'
import { FastifyPluginAsync } from 'fastify'
import { LessThanOrEqual } from 'typeorm'
import { UserEntity, UserTokenEntity } from '../../../db'
import { generatePasswordPair, randomBytesAsync } from '../../../misc/crypto'
import { mergeObj } from '../../../misc/misc'

const fn: FastifyPluginAsync = async (server) => {
  server.get('/', async (req) => {
    const users = await server.manager.findAndCount(UserEntity, { where: { level: LessThanOrEqual(req.user.level) } })
    return users
  })

  server.post(
    '/',
    {
      schema: {
        body: S.object()
          .prop('name', S.string())
          .required()
          .prop('login', S.string())
          .required()
          .prop('disabled', S.boolean())
          .required()
          .prop('level', S.integer().minimum(0))
          .required()
          .prop('pass', S.string())
          .required()
      }
    },
    async (req) => {
      const { name, login, disabled, level, pass } = <any>req.body
      if (level >= req.user.level) throw server.httpErrors.forbidden()

      const user = new UserEntity()
      user.name = name
      user.login = login
      user.disabled = disabled
      user.level = level
      const [hash, salt] = await generatePasswordPair(pass)
      user.hash = hash
      user.salt = salt
      await server.manager.save(user)

      return user.id
    }
  )

  server.get('/:id', async (req) => {
    const { id } = <any>req.params
    const user = await server.manager.findOneOrFail(UserEntity, id, { relations: ['tokens'] })
    if (user.level >= req.user.level && user.id !== req.user.id) throw server.httpErrors.forbidden()

    return user
  })

  server.put(
    '/:id',
    {
      schema: {
        body: S.object()
          .prop('name', S.string())
          .prop('login', S.string())
          .prop('disabled', S.boolean())
          .prop('level', S.number().minimum(0))
          .prop('pass', S.string())
      }
    },
    async (req) => {
      const { id } = <any>req.params
      const user = await server.manager.findOneOrFail(UserEntity, id, { relations: ['tokens'] })
      if (user.level >= req.user.level && user.id !== req.user.id) throw server.httpErrors.forbidden()
      const body = <any>req.body
      if ('level' in body && (body.level > req.user.level || (user.id !== req.user.id && body.level === req.user.level)))
        throw server.httpErrors.forbidden()

      mergeObj(user, body, 'name', 'login', 'disabled', 'level')
      if (body.pass) {
        const [hash, salt] = await generatePasswordPair(body.pass)
        user.hash = hash
        user.salt = salt
      }
      await server.manager.save(user)

      return true
    }
  )

  server.delete('/:id', async (req) => {
    const { id } = <any>req.params
    const user = await server.manager.findOneOrFail(UserEntity, id, { relations: ['tokens'] })

    if (user.level >= req.user.level && user.id !== req.user.id) throw server.httpErrors.forbidden()
    if (user.level === 127) throw server.httpErrors.badRequest()

    await server.manager.remove(user)
    return true
  })

  server.post(
    '/:id/token',
    {
      schema: {
        body: S.object().prop('name', S.string()).required()
      }
    },
    async (req) => {
      const { id } = <any>req.params
      const user = await server.manager.findOneOrFail(UserEntity, id, { relations: ['tokens'] })
      if (user.level >= req.user.level && user.id !== req.user.id) throw server.httpErrors.forbidden()

      const token = new UserTokenEntity()
      token.user = user
      const { name } = <any>req.body
      token.name = name
      token.token = (await randomBytesAsync(64)).toString('hex')
      await server.manager.save(token)

      return [token.id, token.token]
    }
  )

  server.delete('/:uid/token/:tid', async (req) => {
    const { uid, tid } = <any>req.params
    const token = await server.manager.findOneOrFail(UserTokenEntity, tid, { relations: ['user'] })
    const user = token.user!
    if (uid !== user!.id) throw server.httpErrors.badRequest()
    if (user.level >= req.user.level && user.id !== req.user.id) throw server.httpErrors.forbidden()

    await server.manager.remove(token)

    return true
  })
}

export default fn
