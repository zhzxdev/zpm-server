import path from 'path'
import { pathExists } from 'fs-extra'
import { DATA_DIR } from '../misc/constants'
import { runMitigations } from './mitigations'
import { createConnection } from 'typeorm'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { entities, setKV } from './entities'
import { logger } from '../misc/logger'

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
  await setKV('db_ver', '0.0.0')
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
