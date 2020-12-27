export function isTestEnv() {
  const isTestEnv = process.env.NODE_ENV === 'test'
  return isTestEnv
}
