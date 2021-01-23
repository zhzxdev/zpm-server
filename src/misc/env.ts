import dotenv from 'dotenv'

dotenv.config()

export const ENV_IS_DEV = process.env.NODE_ENV === 'development'
