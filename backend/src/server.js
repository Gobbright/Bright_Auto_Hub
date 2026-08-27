import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { adminErrorHandler, getHomepageData, registerAdminApi, seedAdminData } from './adminApi.js'
import { registerPublicApi } from './publicApi.js'

const app = express()
const defaultClientOrigins = [
  'https://www.brightautohub.gobrightglobal.com',
  'https://brightautohub.gobrightglobal.com',
  'http://localhost:5173',
  'http://localhost:4173',
]
const allowedOrigins = new Set([
  ...defaultClientOrigins,
  ...(process.env.CLIENT_URL?.split(',') || []),
].map((origin) => origin.trim()).filter(Boolean))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin ${origin}`))
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '4mb' }))

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'GoAuto Admin API', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', databaseName: mongoose.connection.name || 'goautomobile' }))
app.get('/api/home', async (_request, response, next) => {
  try { response.json(await getHomepageData()) } catch (error) { next(error) }
})

registerPublicApi(app)
registerAdminApi(app)
app.use(adminErrorHandler)

const port = Number(process.env.PORT) || 5000
const start = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goautomobile')
  await seedAdminData()
  app.listen(port, () => console.log(`Bright Auto Hub API running on port ${port}`))
}

start().catch((error) => {
  console.error('Unable to start GOAUTOMOBILE API:', error.message)
  process.exit(1)
})
