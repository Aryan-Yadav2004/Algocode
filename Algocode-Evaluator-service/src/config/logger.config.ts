import  "winston-mongodb" // sirf side-effect import kro

import type {TransformableInfo} from 'logform'
import winston  from "winston"

import serverConfig from './server.config.js'
const allowedTransports  = []


allowedTransports.push(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf((log: TransformableInfo) => `${String(log.timestamp)} [${String(log.level)}]: ${String(log.message)}`)
    )
}))

allowedTransports.push(new winston.transports.MongoDB({
    level: 'error',
    db: serverConfig.LOG_DB_URL,
    collection: 'logs',
}))

allowedTransports.push(new winston.transports.File({
    filename: `app.log`
}))

const logger = winston.createLogger({
    //default formatting
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),

        winston.format.printf((log: TransformableInfo) => `${String(log.timestamp)} [${String(log.level)}]: ${String(log.message)}`)
    ),
    transports: allowedTransports,
})

export default logger