import dotenv from 'dotenv'

dotenv.config()

export const ENV_IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
