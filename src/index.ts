import 'reflect-metadata'
import { connectDB } from './db'
import { logger } from './misc/logger'

async function main() {
  await connectDB()
}

main().catch(logger.error.bind(logger))
