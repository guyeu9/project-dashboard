// @ts-nocheck
import fs from 'fs'
import path from 'path'

const rootDir = path.resolve()

export function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/data')) {
          const dataFilePath = path.resolve(rootDir, 'data', 'project-data.json')
          
          try {
            if (req.method === 'GET') {
              if (!fs.existsSync(dataFilePath)) {
                res.writeHead(200, { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                })
                res.end(JSON.stringify({
                  projects: [],
                  tasks: [],
                  taskTypes: [],
                  pmos: [],
                  productManagers: [],
                  historyRecords: []
                }))
                return
              }
              
              const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'))
              res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              })
              res.end(JSON.stringify(data))
              return
            }
            
            if (req.method === 'POST') {
              const chunks = []
              req.on('data', chunk => {
                chunks.push(chunk)
              })
              
              req.on('end', () => {
                try {
                  const body = Buffer.concat(chunks).toString('utf-8')
                  const data = body ? JSON.parse(body) : {}
                  
                  // 确保目录存在
                  const dir = path.dirname(dataFilePath)
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                  }
                  
                  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8')
                  
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  })
                  res.end(JSON.stringify({ ok: true, message: '数据保存成功' }))
                } catch (error) {
                  console.error('[API Plugin] POST 保存失败:', error.message)
                  res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  })
                  res.end(JSON.stringify({ 
                    error: 'INTERNAL_SERVER_ERROR', 
                    message: '服务器内部错误',
                    details: error.message 
                  }))
                }
              })
              return
            }
            
            if (req.method === 'OPTIONS') {
              res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
              })
              res.end()
              return
            }
            
            res.writeHead(405, { 'Content-Type': 'text/plain' })
            res.end('Method Not Allowed')
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: '服务器内部错误' }))
          }
        } else {
          next()
        }
      })
    }
  }
}