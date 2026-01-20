# 生产环境部署问题分析

## 最新更新（2024-01-19）

### 问题：POST 500 错误 - 数据保存失败

**错误现象**：
```
[INFO] 从服务端成功加载数据
POST https://w2zpsddd9x.coze.site/api/data 500 (Internal Server Error)
[ERROR] 数据保存失败 (尝试 1/3): 500
```

**根本原因**：
生产环境运行的是 **Vite 开发服务器**（vite.js）而不是生产服务器（server.mjs），导致：
- Vite 开发服务器无法正确处理 POST 请求
- 缺少数据持久化逻辑
- 返回 500 错误

**修复方案**：
1. 停止 Vite 开发服务器
2. 启动生产环境 server.mjs
3. 修改 server.mjs，确保 GET 请求返回默认的 taskTypes

**执行步骤**：
```bash
# 1. 停止 Vite 开发服务器
kill 1518

# 2. 启动生产服务器
nohup node server.mjs > /tmp/server.log 2>&1 &

# 3. 验证服务器状态
ss -lptn 'sport = :5000'

# 4. 测试 API
curl -X POST -H "Content-Type: application/json" -d '{"projects":[], "tasks":[], ...}' http://localhost:5000/api/data
```

**代码修改**：
- `server.mjs:194-233` - 修改 GET 请求处理逻辑，确保 taskTypes 不为空
- 当数据文件不存在或 taskTypes 为空时，返回默认的任务类型配置

---

## 原有问题分析

## 问题现象

生产环境（w2zpsddd9x.coze.site）一直运行的是 **Vite 开发服务器**，而不是生产服务器（server.mjs），导致：
- 缺少详细错误日志
- API 行为不一致
- 无法获取真实错误信息

## 根本原因分析

### 1. 当前配置状态

`.coze` 配置文件看起来是正确的：

```toml
[project]
entrypoint = "index.html"
requires = ["nodejs-24"]

[dev]
build = ["pnpm", "install"]
run = ["pnpm", "dev", "--port", "5000", "--host"]    # 开发环境

[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["node", "server.mjs"]                          # 生产环境
```

### 2. 可能的原因

1. **部署系统配置缓存**：部署系统可能缓存了旧的配置，没有使用最新的 `.coze` 配置
2. **部署流程问题**：部署系统可能没有正确执行 `[deploy].run` 命令
3. **环境变量覆盖**：可能有环境变量覆盖了 `.coze` 配置
4. **需要重新部署**：配置文件修改后需要重新部署才能生效

## 解决方案

### 方案 1：确保生产服务器持续运行（临时方案）

在生产环境手动启动生产服务器：

```bash
# 1. 停止开发服务器
pkill -f "vite"

# 2. 启动生产服务器
nohup node server.mjs > /tmp/server.log 2>&1 &

# 3. 验证服务器状态
ss -lptn 'sport = :5000'
```

### 方案 2：添加启动脚本（推荐）

创建一个启动脚本，确保总是使用正确的服务器：

#### 创建启动脚本

创建文件 `scripts/start.sh`：

```bash
#!/bin/bash

# 检测环境
if [ "$NODE_ENV" = "production" ]; then
  echo "启动生产服务器: server.mjs"
  exec node server.mjs
else
  echo "启动开发服务器: vite"
  exec pnpm dev --port 5000 --host
fi
```

修改 `.coze` 配置：

```toml
[dev]
build = ["pnpm", "install"]
run = ["bash", "scripts/start.sh"]

[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["bash", "scripts/start.sh"]
```

### 方案 3：使用 PM2 管理进程（最佳实践）

使用 PM2 来管理生产进程：

```bash
# 安装 PM2
pnpm add -D pm2

# 创建 PM2 配置文件 ecosystem.config.js
```

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'project-schedule',
    script: 'server.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/tmp/pm2-error.log',
    out_file: '/tmp/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G'
  }]
}
```

修改 `.coze` 配置：

```toml
[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["npx", "pm2", "start", "ecosystem.config.js", "--no-daemon"]
```

### 方案 4：使用 package.json scripts 统一管理

修改 `package.json`：

```json
{
  "scripts": {
    "dev": "vite --port 5000 --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "node server.mjs",
    "deploy:build": "pnpm install && pnpm run build"
  }
}
```

修改 `.coze` 配置：

```toml
[dev]
build = ["pnpm", "install"]
run = ["pnpm", "dev"]

[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["pnpm", "start"]
```

## 生产环境最佳实践

### 1. 健康检查

在 server.mjs 中添加健康检查端点：

```javascript
if (parsedUrl.pathname === '/health') {
  res.statusCode = 200
  res.end('OK')
  return
}
```

### 2. 日志管理

- 使用专门的日志管理工具（如 Winston）
- 日志分级（info, warn, error）
- 日志轮转（避免日志文件过大）

### 3. 进程守护

使用 PM2 或 systemd 确保进程自动重启：

```bash
# PM2 配置
pm2 startup
pm2 save
```

### 4. 监控告警

- 添加监控指标（CPU、内存、响应时间）
- 设置告警规则

## 立即行动

1. **手动修复生产环境**（已完成）
   ```bash
   pkill -f "vite"
   nohup node server.mjs > /tmp/server.log 2>&1 &
   ```

2. **选择长期解决方案**
   - 推荐使用方案 2（启动脚本）或方案 3（PM2）

3. **重新部署项目**
   - 确保使用最新的 `.coze` 配置
   - 验证生产环境运行的是 server.mjs

## 验证清单

- [ ] 生产环境运行的是 `node server.mjs` 而不是 `vite`
- [ ] 可以通过 `/api/data` 正常读写数据
- [ ] 日志文件正常输出
- [ ] 服务可以自动重启（如果使用 PM2）
- [ ] 有健康检查端点
