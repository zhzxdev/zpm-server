import { onResponseAsyncHookHandler } from 'fastify'
import { fireLog } from '../db'

export function mergeObj(dest: Record<string, any>, src: Record<string, any>, ...keys: string[]): void {
  for (const key of keys) {
    if (key in src) {
      dest[key] = src[key]
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function stringifyParams(params: any): string {
  if (!params || typeof params !== 'object') return ''
  const keys = Object.keys(params)
  return keys.map((k) => `${k}=${params[k]}`).join(',')
}

export function stringifyStatus(code: number): string {
  return code.toString()
}

export function logOnResponse(scope: string, prefix: string): onResponseAsyncHookHandler {
  const pfx = prefix.length
  return async (req, res) => {
    if (req.user && ['POST', 'PUT', 'DELETE'].includes(req.routerMethod)) {
      await fireLog(
        `${scope}:${req.routerMethod}${req.routerPath.substr(pfx)}`,
        stringifyParams(req.params),
        stringifyStatus(res.statusCode),
        req.user
      )
    }
  }
}
