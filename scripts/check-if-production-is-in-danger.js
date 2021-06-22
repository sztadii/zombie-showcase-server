/* eslint-disable no-console */
const fs = require('fs')

function checkIfProductionIsInDanger() {
  if (!fs.existsSync('.env')) return

  const envFile = fs.readFileSync('.env', { encoding: 'utf-8' })
  const isGoogleCredentialsCommented = envFile.includes(
    '#GOOGLE_APPLICATION_CREDENTIALS'
  )
  const isGoogleCredentialsExists = envFile.includes(
    'GOOGLE_APPLICATION_CREDENTIALS'
  )

  if (!isGoogleCredentialsExists || isGoogleCredentialsCommented) return

  console.error('-------')
  console.error('-------')
  console.error('Please keep env GOOGLE_APPLICATION_CREDENTIALS commented')
  console.error(
    'Otherwise you will run e2e tests on production env and all important data will gone'
  )
  console.error('-------')
  console.error('-------')
  process.exit(1)
}

checkIfProductionIsInDanger()
