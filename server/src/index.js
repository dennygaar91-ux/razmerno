import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import constructorRouter from './routes/constructor.routes.js'

const app = express()
const port = process.env.PORT ?? 4000

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'razmerno-server' })
})

app.use('/api/constructor', constructorRouter)

app.use((req, res) => {
  res.status(404).json({ ok: false, code: 'NOT_FOUND', message: 'Route not found' })
})

app.use((error, req, res, next) => {
  console.error(error)
  res.status(error.status ?? 500).json({
    ok: false,
    code: error.code ?? 'SERVER_ERROR',
    message: error.message ?? 'Internal server error',
    fields: error.fields ?? undefined,
  })
})

app.listen(port, () => {
  console.log(`Razmerno server started on http://localhost:${port}`)
})
