import { LogLevel } from './types'

const LOG_FUNCTION: { [key: number]: Function } = {
  // eslint-disable-next-line no-console
  [LogLevel.DEBUG]: console.log,
  // eslint-disable-next-line no-console
  [LogLevel.INFO]: console.info || console.log,
  // eslint-disable-next-line no-console
  [LogLevel.WARN]: console.warn || console.log,
  // eslint-disable-next-line no-console
  [LogLevel.ERROR]: console.error || console.log
}

let logLevelCurrent: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.INFO

export function setLogLevel(logLevelNew: LogLevel): void {
  logLevelCurrent = logLevelNew
}

export function log(level: LogLevel, message: string): void {
  if (logLevelCurrent <= level) {
    LOG_FUNCTION[level](`[web3-react]: ${message}`)
  }
}
