import S from 'fluent-json-schema'
import { FastifyPluginAsync } from 'fastify'
import { LogEntity } from '../../../db'

const fn: FastifyPluginAsync = async (server) => {
  server.get(
    '/',
    {
      schema: {
        querystring: S.object()
          .prop('skip', S.integer().minimum(0).default(0))
          .prop('take', S.integer().minimum(5).maximum(50).default(15))
      }
    },
    async (req) => {
      const { skip, take } = <any>req.query
      const logs = await server.manager.findAndCount(LogEntity, { order: { ts: 'DESC' }, skip, take, relations: ['user'] })
      for (const log of logs[0]) {
        const user = log.user
        if (user && user.level > req.user.level) {
          delete log.user
        }
      }
      return logs
    }
  )
}

export default fn
