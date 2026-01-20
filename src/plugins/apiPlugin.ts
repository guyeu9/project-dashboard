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
                res.writeHead(200, { 'Content-Type': 'application/json' })
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
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
              return
            }
            
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => {
                body += chunk
              })
              
              req.on('end', () => {
                try {
                  const data = body ? JSON.parse(body) : {}
                  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8')
                  res.writeHead(200, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ ok: true, message: '数据保存成功' }))
                } catch (error) {
                  res.writeHead(400, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: 'BAD_REQUEST', message: '请求数据格式错误' }))
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