import 'reflect-metadata'
import { connectDB } from './db'
import { logger } from './misc/logger'
import { startWebService } from './web'

async function main() {
  await connectDB()
  await startWebService()
}

main().catch(logger.error.bind(logger))
