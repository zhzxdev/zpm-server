import { readdirSync } from 'fs-extra'
import path from 'path'
import semver from 'semver'
import { getKVOrFail, setKV } from '../entities'
import { logger } from '../../misc/logger'

interface IMitigation {
  version: string
  handler: () => Promise<void>
}

const mitigations: IMitigation[] = readdirSync(__dirname)
  .filter((x) => x.endsWith('.js'))
  .map((x) => x.substr(0, x.length - 3))
  .filter((x) => semver.valid(x))
  .sort(semver.compare)
  .map((x) => ({
    version: x,
    handler: require(path.join(__dirname, x + '.js'))
  }))

export async function runMitigations(): Promise<void> {
  logger.info('Running mitigations')
  for (const { version, handler } of mitigations) {
    const currentVersion = await getKVOrFail<string>('db_ver')
    if (semver.lt(currentVersion, version)) {
      logger.info(`Mitigating from ${currentVersion} to ${version}`)
      await handler()
      await setKV('db_ver', version)
    }
  }
}
