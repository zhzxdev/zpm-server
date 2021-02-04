import S from 'fluent-json-schema'
import { FastifyPluginAsync } from 'fastify'
import { DeviceEntity } from '../../../db'
import { mergeObj } from '../../../misc/misc'
import { isOnline } from '../../io/device'

const fn: FastifyPluginAsync = async (server) => {
  server.addHook('preValidation', async (req) => {
    if (req.user.level < 1) throw server.httpErrors.forbidden()
  })

  server.get('/', async () => {
    const devices = await server.manager.findAndCount(DeviceEntity, {})
    return devices
  })

  server.post(
    '/',
    {
      schema: {
        body: S.object() //
          .prop('name', S.string())
          .required()
          .prop('ip', S.string())
          .required()
      }
    },
    async (req) => {
      const { name, ip } = <any>req.body
      const device = new DeviceEntity()
      device.name = name
      device.ip = ip

      await server.manager.save(device)
      return device.id
    }
  )

  server.get('/:id', async (req) => {
    const { id } = <any>req.params
    const device = await server.manager.findOneOrFail(DeviceEntity, id)

    return device
  })

  server.get('/:id/online', async (req) => {
    const { id } = <any>req.params
    return isOnline(id)
  })

  server.put(
    '/:id',
    {
      schema: {
        body: S.object() //
          .prop('name', S.string())
          .prop('ip', S.string())
      }
    },
    async (req) => {
      const { id } = <any>req.params
      const device = await server.manager.findOneOrFail(DeviceEntity, id)

      mergeObj(device, <any>req.body, 'name', 'ip')
      await server.manager.save(device)

      return true
    }
  )

  server.delete('/:id', async (req) => {
    const { id } = <any>req.params
    const device = await server.manager.findOneOrFail(DeviceEntity, id)

    await server.manager.remove(device)

    return true
  })
}

export default fn
