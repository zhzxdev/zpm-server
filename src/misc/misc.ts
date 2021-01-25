export function mergeObj(dest: Record<string, any>, src: Record<string, any>, ...keys: string[]): void {
  for (const key of keys) {
    if (key in src) {
      dest[key] = src[key]
    }
  }
}
