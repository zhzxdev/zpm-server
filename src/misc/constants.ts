import path from 'path'

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..')
export const DATA_DIR = path.join(PROJECT_ROOT, 'data')
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const APP_PACKAGE_JSON = require(path.join(PROJECT_ROOT, 'package.json'))
export const APP_VERSION: string = APP_PACKAGE_JSON.version
