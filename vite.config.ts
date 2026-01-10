// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function dataApiPlugin() {
  const dataFile = path.resolve(rootDir, 'data', 'project-data.json')

  const ensureDir = () => {
    const dir = path.dirname(dataFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  const readData = () => {
    try {
      if (!fs.existsSync(dataFile)) {
        return null
      }
      const content = fs.readFileSync(dataFile, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  const writeData = (data: unknown) => {
    try {
      ensureDir()
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8')
    } catch {
    }
  }

  const getRequestBody = (req: any): Promise<string> =>
    new Promise((resolve) => {
      let body = ''
      req.on('data', (chunk: any) => {
        body += chunk
      })
      req.on('end', () => {
        resolve(body)
      })
    })

  return {
    name: 'project-data-api',
    configureServer(server: any) {
      server.middlewares.use('/api/data', (req: any, res: any, next: any) => {
        if (req.method === 'GET') {
          const data = readData()
          if (!data) {
            res.statusCode = 404
            res.end('NOT_FOUND')
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return
        }

        if (req.method === 'POST') {
          getRequestBody(req).then((raw) => {
            try {
              const parsed = raw ? JSON.parse(raw) : {}
              writeData(parsed)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ ok: true }))
            } catch {
              res.statusCode = 400
              res.end('BAD_REQUEST')
            }
          })
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), dataApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
