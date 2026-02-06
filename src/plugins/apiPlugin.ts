// @ts-nocheck
import { getAllData, saveAllData } from '../api/dataApi.js'

export function apiPlugin() {
  return {
    name: 'api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 测试端点：直接返回收到的数据
        if (req.url?.startsWith('/api/test')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
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
                console.log('[API Test] 收到的数据:', JSON.stringify(data, null, 2).substring(0, 1000))
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({
                  message: '收到数据',
                  data: data
                }))
              } catch (error) {
                console.error('[API Test] 错误:', error.message)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error.message }))
              }
            })
            return
          }
        }

        if (req.url?.startsWith('/api/data')) {
          // 设置 CORS 头
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

          try {
            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              res.end()
              return
            }

            if (req.method === 'GET') {
              const data = await getAllData()
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
              return
            }

            if (req.method === 'POST') {
              const chunks = []
              req.on('data', chunk => {
                chunks.push(chunk)
              })

              req.on('end', async () => {
                try {
                  const body = Buffer.concat(chunks).toString('utf-8')

                  const data = body ? JSON.parse(body) : {}

                  const result = await saveAllData(data)
                  console.log('[API Plugin] 保存成功')
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(result))
                } catch (error) {
                  console.error('[API Plugin] POST 保存失败:', error.message)
                  console.error('[API Plugin] 错误堆栈:', error.stack)
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({
                    error: 'INTERNAL_SERVER_ERROR',
                    message: '服务器内部错误',
                    details: error.message
                  }))
                }
              })
              return
            }

            res.statusCode = 405
            res.setHeader('Content-Type', 'text/plain')
            res.end('Method Not Allowed')
          } catch (error) {
            console.error('[API Plugin] 错误:', error.message)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: '服务器内部错误', details: error.message }))
          }
        }

        // AI 配置 API
        if (req.url?.startsWith('/api/ai/config')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method === 'GET') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify([]))
            return
          }

          if (req.method === 'POST') {
            const chunks = []
            req.on('data', chunk => chunks.push(chunk))
            req.on('end', () => {
              try {
                const body = Buffer.concat(chunks).toString('utf-8')
                const data = JSON.parse(body)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error.message }))
              }
            })
            return
          }

          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        // AI 服务提供商 API
        if (req.url?.startsWith('/api/ai/providers')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method === 'GET') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify([]))
            return
          }

          if (req.method === 'POST') {
            const chunks = []
            req.on('data', chunk => chunks.push(chunk))
            req.on('end', () => {
              try {
                const body = Buffer.concat(chunks).toString('utf-8')
                const data = JSON.parse(body)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(data))
              } catch (error) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: error.message }))
              }
            })
            return
          }

          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        next()
      })
    }
  }
}
