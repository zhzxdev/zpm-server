import path from 'path'
import { pathExists } from 'fs-extra'
import { DATA_DIR } from '../misc/constants'
import { runMitigations } from './mitigations'
import { createConnection, getManager } from 'typeorm'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { entities, setKV, UserEntity } from './entities'
import { logger } from '../misc/logger'
import { generatePasswordPair } from '../misc/crypto'

export * from './entities'

const DB_PATH = path.join(DATA_DIR, 'main.db')

const defaultConnectionOptions: SqliteConnectionOptions = {
  type: 'sqlite',
  database: DB_PATH,
  entities
}

async function isDBInited(): Promise<boolean> {
  return pathExists(DB_PATH)
}

async function initDatabase() {
  logger.info('Initializing Database')
  const manager = getManager()
  const now = Date.now()
  await setKV('db_ver', '0.0.0')
  const [hash, salt] = await generatePasswordPair('123456')
  await manager.insert(UserEntity, { name: 'admin', login: 'admin', disabled: false, hash, salt, level: 127, created: now })
  logger.info('Inserted default user admin:123456')
}

export async function connectDB(): Promise<void> {
  if (await isDBInited()) {
    await createConnection(defaultConnectionOptions)
  } else {
    await createConnection({
      ...defaultConnectionOptions,
      synchronize: true
    })
    await initDatabase()
  }
  await runMitigations()
  logger.info('Database is ready')
}
