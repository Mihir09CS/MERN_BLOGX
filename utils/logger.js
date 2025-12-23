const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

/**
 * In serverless environments (Vercel),
 * filesystem is read-only → NO file transports.
 * Only console logging is allowed.
 */

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`
      )
    ),
  }),
];

if (!isProduction) {
  // Local development ONLY
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports,
  exitOnError: false,
});

module.exports = logger;
