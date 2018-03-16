import {spawn} from 'child_process'

export const logLevel = {LOG: 'stdout', ERROR: 'stderr'}

class Process {
  /**
   * Creates mysterium_client process handler
   * @constructor
   * @param {{clientBinaryPath,clientConfigPath,runtimeDirectory: string}} config
   */
  constructor (config) {
    this.config = config
  }

  start (port = 4050) {
    this.child = spawn(this.config.clientBinaryPath, [
      '--config-dir', this.config.clientConfigPath,
      '--runtime-dir', this.config.runtimeDirectory,
      '--tequilapi.port', port
    ])
  }

  stop () {
    this.child.kill('SIGTERM')
  }

  /**
   * @param {string} level
   * @param {LogCallback} cb
   */
  on (level, cb) {
    if (!Object.values(logLevel).includes(level) || !this.child[level]) {
      throw new Error(`Unknown logging level: ${level}`)
    }
    this.child[level].on('data', (data) => {
      cb(data.toString())
    })
  }
}

export default Process

/**
 * @callback LogCallback
 * @param {string} data - log line
 */
