# API 404 错误修复 - 开发环境 vs 生产环境

## 问题分析

### 症状
- ✅ 新功能都显示了（前端代码已更新）
- ❌ API 返回 404（后端代码有问题）
- ❌ `/api/ai/config` 和 `/api/ai/providers` 不存在

### 根因

**测试环境可能在使用开发模式运行！**

#### 开发模式 vs 生产模式的区别

**开发模式**（`pnpm run dev`）：
- 使用 Vite 开发服务器
- 使用 `apiPlugin.ts` 提供后端 API
- **只支持 `/api/data` 路由**
- 不支持 `/api/ai/config` 和 `/api/ai/providers`

**生产模式**（`pnpm run start`）：
- 使用 `server.ts` 提供后端服务
- 支持 `/api/data`、`/api/ai/config`、`/api/ai/providers` 等所有路由
- 支持数据库操作

### API 路由对比

| API 路由 | 开发模式 | 生产模式 |
|---------|---------|---------|
| `/api/data` | ✅ 支持 | ✅ 支持 |
| `/api/ai/config` | ❌ 不支持 | ✅ 支持 |
| `/api/ai/providers` | ❌ 不支持 | ✅ 支持 |

## 解决方案

### 方案 1：在 apiPlugin 中添加缺失的 API 路由（推荐用于测试环境）

如果测试环境必须使用开发模式，需要在 `apiPlugin.ts` 中添加缺失的 API 路由：

```typescript
// 在 apiPlugin.ts 中添加

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
    // 返回空数组或默认配置
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify([]))
    return
  }

  if (req.method === 'POST') {
    // 保存配置（开发模式可以使用内存存储）
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    })
    return
  }
}

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
    // 返回空数组或默认提供商
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify([]))
    return
  }

  if (req.method === 'POST') {
    // 保存提供商（开发模式可以使用内存存储）
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf-8')
      const data = JSON.parse(body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    })
    return
  }
}
```

### 方案 2：确保测试环境使用生产模式

如果测试环境应该使用生产模式，需要：

1. **检查 .coze 配置**：
   ```toml
   [dev]
   run = ["pnpm", "run", "dev"]  # 开发环境
   
   [deploy]
   run = ["pnpm", "run", "start"]  # 生产环境
   ```

2. **确保测试环境使用正确的运行命令**：
   - 如果测试环境对应 `[deploy]`，应该使用 `pnpm run start`
   - 如果测试环境对应 `[dev]`，应该使用 `pnpm run dev`

3. **在扣子平台检查配置**：
   - 登录扣子平台
   - 找到项目配置
   - 确认测试环境使用的运行命令

## 推荐方案

**对于测试环境，推荐使用方案 1**：

在 `apiPlugin.ts` 中添加缺失的 API 路由，这样：
- ✅ 测试环境可以正常工作
- ✅ 不需要修改部署配置
- ✅ 开发体验更好

## 实施步骤

### 添加 API 路由到 apiPlugin.ts

1. 打开 `src/plugins/apiPlugin.ts`
2. 在 `/api/data` 路由之后，添加 `/api/ai/config` 和 `/api/ai/providers` 路由
3. 保存文件
4. 提交并推送代码
5. 重新部署

### 验证

部署后，检查：
- ✅ `/api/ai/config` 返回 200
- ✅ `/api/ai/providers` 返回 200
- ✅ 不再有 404 错误
- ✅ 不再有 SyntaxError
