import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { URL } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const dataFile = path.resolve(rootDir, 'data', 'project-data.json')
const distDir = path.resolve(rootDir, 'dist')

const ensureDataDir = () => {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const readJsonData = () => {
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

const writeJsonData = (data) => {
  try {
    ensureDataDir()
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

const getRequestBody = (req) =>
  new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
  })

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

const serveStaticFile = (req, res, parsedUrl) => {
  let pathname = parsedUrl.pathname
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const filePath = path.join(distDir, decodeURIComponent(pathname))

  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  }

  const contentType = mimeTypes[ext] || 'application/octet-stream'

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      res.statusCode = 200
      res.setHeader('Content-Type', contentType)
      const stream = fs.createReadStream(filePath)
      stream.on('error', () => {
        res.statusCode = 500
        res.end('Internal Server Error')
      })
      stream.pipe(res)
      return
    }

    const indexPath = path.join(distDir, 'index.html')
    fs.stat(indexPath, (indexErr, indexStats) => {
      if (!indexErr && indexStats.isFile()) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        fs.createReadStream(indexPath).pipe(res)
      } else {
        res.statusCode = 404
        res.end('Not Found')
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`)

  if (parsedUrl.pathname === '/api/data') {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET') {
      const data = readJsonData()
      if (!data) {
        sendJson(res, 404, { error: 'NOT_FOUND' })
        return
      }
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'POST') {
      const raw = await getRequestBody(req)
      try {
        const parsed = raw ? JSON.parse(raw) : {}
        const ok = writeJsonData(parsed)
        if (!ok) {
          sendJson(res, 500, { error: 'WRITE_FAILED' })
          return
        }
        sendJson(res, 200, { ok: true })
      } catch {
        sendJson(res, 400, { error: 'BAD_REQUEST' })
      }
      return
    }

    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  serveStaticFile(req, res, parsedUrl)
})

const port = process.env.PORT || 4173

server.listen(port, () => {
  process.stdout.write(`Server is running at http://localhost:${port}\n`)
})

