import S from 'fluent-json-schema'
import { FastifyPluginAsync } from 'fastify'
import { call } from '../../io/device'

const fn: FastifyPluginAsync = async (server) => {
  const registerDeviceOper = (name: string, minLevel = 1, schema: any = S.object()) => {
    server.post(
      `/device/:id/${name}`,
      {
        schema: {
          body: schema
        }
      },
      async (req) => {
        if (req.user.level < minLevel) throw server.httpErrors.forbidden()
        const { id } = <any>req.params
        return await call(name, id, <any>req.body)
      }
    )
  }
  registerDeviceOper('ping', 0)
  registerDeviceOper('screenshot', 1)
  registerDeviceOper('killps', 1)
}

export default fn
