import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import admin from "./routes/admin.routes";
import user from "./routes/user.routes";

const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET']

const missing = REQUIRED_ENV.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`❌ Env wajib belum diisi: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();

app.use(cors({
  origin         : process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods        : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders : ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/admin", admin);
app.use("/", user)

app.use((request: Request, response: Response) => {
  response.status(404).json({
    status  : 404,
    message : `Cannot ${request.method} ${request.path}`,
    data    : null
  })
})

app.use((error: any, request: Request, response: Response, next: NextFunction) => {
  const status = error?.status ?? error?.statusCode ?? 500

  if (status >= 500) {
    console.error('❌ Unhandled error:', error)
  }

  response.status(status).json({
    status  : status,
    message : error?.message ?? 'Internal server error',
    data    : null
  })
})

const port     = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST ?? '0.0.0.0'

app.listen(port, hostname, () => {
  console.log(`🚀 Server running on http://${hostname}:${port}`);
});
