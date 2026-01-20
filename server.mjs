import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { URL } from 'url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const dataFile = path.resolve(rootDir, 'data', 'project-data.json')
const distDir = path.resolve(rootDir, 'dist')
const lockFile = path.resolve(rootDir, 'data', 'data.lock')
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const ensureDataDir = () => {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const readJsonData = () => {
  try {
    if (!fs.existsSync(dataFile)) {
      console.log('[INFO] 数据文件不存在:', dataFile)
      return null
    }
    const content = fs.readFileSync(dataFile, 'utf-8')
    const data = JSON.parse(content)
    
    if (!data || typeof data !== 'object') {
      console.warn('[WARN] 数据文件内容格式错误:', dataFile)
      return null
    }
    
    return data
  } catch (error) {
    console.error('[ERROR] 读取数据文件失败:', dataFile, error.message)
    return null
  }
}

const writeJsonData = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      console.error('[ERROR] 写入数据格式错误')
      return false
    }
    
    ensureDataDir()
    const tempFile = dataFile + '.tmp'
    const content = JSON.stringify(data, null, 2)
    
    fs.writeFileSync(tempFile, content, 'utf-8')
    fs.renameSync(tempFile, dataFile)
    
    console.log('[INFO] 数据保存成功:', dataFile)
    return true
  } catch (error) {
    console.error('[ERROR] 写入数据文件失败:', dataFile, error.message)
    return false
  }
}

const acquireLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      const lockTime = parseInt(fs.readFileSync(lockFile, 'utf-8'))
      const now = Date.now()
      if (now - lockTime < 30000) {
        return false
      }
    }
    fs.writeFileSync(lockFile, Date.now().toString(), 'utf-8')
    return true
  } catch {
    return false
  }
}

const releaseLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile)
    }
  } catch {
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
  res.setHeader('Access-Control-Max-Age', '86400')
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
        sendJson(res, 200, { projects: [], tasks: [], taskTypes: [], pmos: [], productManagers: [], historyRecords: [] })
        return
      }
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'POST') {
      const raw = await getRequestBody(req)
      try {
        const parsed = raw ? JSON.parse(raw) : {}
        
        let retries = 0
        let ok = false
        
        while (retries < MAX_RETRIES && !ok) {
          if (acquireLock()) {
            ok = writeJsonData(parsed)
            releaseLock()
            
            if (ok) {
              sendJson(res, 200, { ok: true, message: '数据保存成功' })
            } else {
              retries++
              if (retries < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
              }
            }
          } else {
            retries++
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            }
          }
        }
        
        if (!ok) {
          sendJson(res, 500, { error: 'WRITE_FAILED', message: '数据保存失败，请稍后重试' })
        }
      } catch {
        sendJson(res, 400, { error: 'BAD_REQUEST', message: '请求数据格式错误' })
      }
      return
    }

    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  serveStaticFile(req, res, parsedUrl)
})

const port = process.env.PORT || 5000

server.listen(port, () => {
  process.stdout.write(`Server is running at http://localhost:${port}\n`)
})
