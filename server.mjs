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
      console.error('[ERROR] 写入数据格式错误:', data)
      return false
    }
    
    ensureDataDir()
    const tempFile = dataFile + '.tmp'
    
    // 检查数据是否可以序列化
    let content
    try {
      content = JSON.stringify(data, null, 2)
    } catch (serializeError) {
      console.error('[ERROR] 数据序列化失败:', serializeError.message)
      return false
    }
    
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
      const age = now - lockTime
      if (age < 30000) {
        console.log('[INFO] 锁文件存在且未过期，等待中... 剩余时间:', 30000 - age, 'ms')
        return false
      }
      console.log('[INFO] 锁文件已过期（', age, 'ms），删除并重新获取')
      try {
        fs.unlinkSync(lockFile)
      } catch (unlinkError) {
        console.error('[ERROR] 删除过期锁文件失败:', unlinkError.message)
      }
    }
    fs.writeFileSync(lockFile, Date.now().toString(), 'utf-8')
    console.log('[INFO] 成功获取锁')
    return true
  } catch (error) {
    console.error('[ERROR] 获取锁失败:', error.message)
    return false
  }
}

const releaseLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile)
      console.log('[INFO] 成功释放锁')
    }
  } catch (error) {
    console.error('[ERROR] 释放锁失败:', error.message)
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
        sendJson(res, 200, {
          projects: [],
          tasks: [],
          taskTypes: [
            { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
            { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
            { id: '3', name: '测试排期', color: '#faad14', enabled: true },
            { id: '4', name: '测试联调', color: '#f5222d', enabled: true },
            { id: '5', name: '产品UAT', color: '#722ed1', enabled: true },
            { id: '6', name: '上线', color: '#13c2c2', enabled: true }
          ],
          pmos: [],
          productManagers: [],
          historyRecords: []
        })
        return
      }
      
      // 确保 taskTypes 存在，如果为空则提供默认值
      if (!Array.isArray(data.taskTypes) || data.taskTypes.length === 0) {
        data.taskTypes = [
          { id: '1', name: '开发排期', color: '#1890ff', enabled: true },
          { id: '2', name: '开发联调', color: '#52c41a', enabled: true },
          { id: '3', name: '测试排期', color: '#faad14', enabled: true },
          { id: '4', name: '测试联调', color: '#f5222d', enabled: true },
          { id: '5', name: '产品UAT', color: '#722ed1', enabled: true },
          { id: '6', name: '上线', color: '#13c2c2', enabled: true }
        ]
      }
      
      sendJson(res, 200, data)
      return
    }

    if (req.method === 'POST') {
      const raw = await getRequestBody(req)
      console.log('[INFO] POST /api/data 收到请求，原始数据长度:', raw.length)
      
      try {
        const parsed = raw ? JSON.parse(raw) : {}
        console.log('[INFO] POST /api/data 解析后的数据结构:', {
          projectsCount: Array.isArray(parsed.projects) ? parsed.projects.length : 'N/A',
          tasksCount: Array.isArray(parsed.tasks) ? parsed.tasks.length : 'N/A',
          taskTypesCount: Array.isArray(parsed.taskTypes) ? parsed.taskTypes.length : 'N/A',
          hasData: !!parsed
        })
        
        let retries = 0
        let ok = false
        let lastError = null
        
        while (retries < MAX_RETRIES && !ok) {
          if (acquireLock()) {
            try {
              ok = writeJsonData(parsed)
              if (ok) {
                console.log('[INFO] POST /api/data 数据保存成功')
              } else {
                console.error('[ERROR] POST /api/data writeJsonData 返回 false')
                lastError = 'WRITE_OPERATION_FAILED'
              }
            } catch (writeError) {
              console.error('[ERROR] POST /api/data writeJsonData 抛出异常:', writeError.message)
              lastError = writeError.message
            } finally {
              releaseLock()
            }
            
            if (ok) {
              sendJson(res, 200, { ok: true, message: '数据保存成功' })
            } else {
              retries++
              console.log('[INFO] POST /api/data 保存失败，重试:', retries, '/', MAX_RETRIES)
              if (retries < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
              }
            }
          } else {
            retries++
            console.log('[INFO] POST /api/data 获取锁失败，重试:', retries, '/', MAX_RETRIES)
            if (retries < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            }
          }
        }
        
        if (!ok) {
          console.error('[ERROR] POST /api/data 数据保存最终失败，错误:', lastError)
          sendJson(res, 500, { error: 'WRITE_FAILED', message: '数据保存失败，请稍后重试', details: lastError })
        }
      } catch (parseError) {
        console.error('[ERROR] POST /api/data JSON 解析失败:', parseError.message)
        sendJson(res, 400, { error: 'BAD_REQUEST', message: '请求数据格式错误', details: parseError.message })
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
