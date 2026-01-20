# 部署指南

本文档详细说明了项目的部署流程、环境配置和进程管理。

## 目录

- [系统架构](#系统架构)
- [环境配置](#环境配置)
- [部署方式](#部署方式)
- [进程管理](#进程管理)
- [监控和告警](#监控和告警)
- [故障排查](#故障排查)

---

## 系统架构

### 开发环境 vs 生产环境

| 特性 | 开发环境 | 生产环境 |
|------|---------|---------|
| 服务器 | Vite 开发服务器 | Node.js 生产服务器 (server.mjs) |
| 热更新 | ✅ 支持 | ❌ 不支持 |
| 端口 | 5000 | 5000 |
| 日志 | 控制台输出 | 文件日志 |
| 进程管理 | 手动 | PM2 / 监控脚本 |
| 性能 | 低 | 高 |

### 启动方式

项目使用统一的启动脚本 `scripts/start.sh`，根据 `NODE_ENV` 环境变量自动选择服务器：

```bash
# 开发环境 (NODE_ENV=development)
pnpm dev
# 启动 Vite 开发服务器，支持热更新

# 生产环境 (NODE_ENV=production)
pnpm start
# 启动 Node.js 生产服务器
```

---

## 环境配置

### 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| `NODE_ENV` | 环境模式 | `development` 或 `production` |
| `PORT` | 服务端口 | `5000` |

### 禁用开发服务的方法

#### 方法 1：设置 NODE_ENV=production

```bash
export NODE_ENV=production
pnpm start  # 只会启动 server.mjs
```

#### 方法 2：使用 .coze 配置

`.coze` 配置文件已经配置好，生产环境会自动使用 `NODE_ENV=production`：

```toml
[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["NODE_ENV=production", "bash", "scripts/start.sh"]
```

#### 方法 3：在启动脚本中强制限制

`scripts/start.sh` 已经内置了环境检查逻辑：

```bash
if [ "$NODE_ENV" = "production" ]; then
  # 只启动 server.mjs
  exec node server.mjs
fi
```

---

## 部署方式

### 方式 1：使用 .coze 自动部署（推荐）

Coze CLI 会自动处理构建和部署流程：

```bash
# 初始化项目（已完成）
coze init ${COZE_WORKSPACE_PATH} --template vite

# 本地开发
coze dev  # 自动启动开发服务器（端口 5000）

# 部署到生产环境
# Coze 会自动执行：
# 1. pnpm install
# 2. pnpm run build
# 3. NODE_ENV=production bash scripts/start.sh
```

**部署流程**：

1. **构建阶段**：`pnpm run deploy:build`
   - 安装依赖：`pnpm install`
   - TypeScript 编译：`tsc`
   - Vite 构建：`vite build`
   - 生成 `dist` 目录

2. **运行阶段**：`NODE_ENV=production bash scripts/start.sh`
   - 检查环境变量
   - 验证文件存在性
   - 启动 `server.mjs`
   - 监听 5000 端口

### 方式 2：手动部署

适用于需要完全控制部署流程的场景：

```bash
# 1. 拉取代码
git pull origin main

# 2. 安装依赖
pnpm install

# 3. 构建项目
pnpm run build

# 4. 启动生产服务器
pnpm start
# 或者直接运行
NODE_ENV=production node server.mjs
```

### 方式 3：使用 PM2 部署（推荐用于生产）

PM2 提供了更强大的进程管理和监控功能：

```bash
# 1. 安装 PM2（可选，如果使用 npx 则不需要）
pnpm add -D pm2

# 2. 启动应用
pnpm run pm2:start
# 或使用 npx
npx pm2 start ecosystem.config.js --env production

# 3. 查看状态
pnpm run pm2:status

# 4. 查看日志
pnpm run pm2:logs

# 5. 重启应用
pnpm run pm2:restart

# 6. 停止应用
pnpm run pm2:stop
```

**PM2 优势**：

- ✅ 自动重启崩溃的进程
- ✅ 日志管理和轮转
- ✅ 内存限制和监控
- ✅ 集群模式支持
- ✅ 零停机重启
- ✅ 负载均衡

---

## 进程管理

### 启动脚本 (scripts/start.sh)

启动脚本根据 `NODE_ENV` 自动选择正确的服务器：

```bash
# 开发环境
NODE_ENV=development bash scripts/start.sh
# 启动 Vite 开发服务器

# 生产环境
NODE_ENV=production bash scripts/start.sh
# 启动 server.mjs
```

### 监控脚本 (scripts/monitor.sh)

监控脚本用于检测进程状态并自动重启：

```bash
# 手动运行
bash scripts/monitor.sh

# 添加到 crontab（每分钟检查一次）
* * * * * cd /path/to/project && bash scripts/monitor.sh >> /tmp/monitor.log 2>&1
```

**监控功能**：

- ✅ 检测进程是否运行
- ✅ 检测端口是否监听
- ✅ 自动重启失败的进程
- ✅ 限制重启频率（防止无限重启）
- ✅ 日志记录
- ✅ 锁文件保护（防止重复执行）

### PM2 进程管理

使用 PM2 管理进程（推荐）：

```bash
# 启动
pnpm run pm2:start

# 停止
pnpm run pm2:stop

# 重启
pnpm run pm2:restart

# 删除
pnpm run pm2:delete

# 查看日志
pnpm run pm2:logs

# 查看状态
pnpm run pm2:status

# 实时监控
pnpm run pm2:monit
```

---

## 监控和告警

### 日志文件

| 日志类型 | 文件路径 | 说明 |
|---------|---------|------|
| 服务器日志 | `/tmp/server.log` | server.mjs 输出日志 |
| PM2 日志 | `/tmp/pm2-project-schedule-*.log` | PM2 管理的日志 |
| 监控日志 | `/tmp/process-monitor.log` | 监控脚本日志 |

### 健康检查

#### 手动检查

```bash
# 检查端口是否监听
ss -lptn 'sport = :5000'

# 检查进程是否运行
ps aux | grep "node.*server.mjs"

# 检查 API 是否正常
curl http://localhost:5000/api/data
```

#### 自动检查（监控脚本）

监控脚本会自动进行健康检查：

```bash
# 运行监控脚本
bash scripts/monitor.sh
```

### 告警通知（可选）

可以扩展监控脚本，添加告警功能：

```bash
# 添加邮件告警
if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
  echo "服务重启次数过多" | mail -s "告警：服务异常" admin@example.com
fi
```

---

## 故障排查

### 问题 1：端口被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::5000
```

**解决方案**：

```bash
# 查找占用端口的进程
ss -lptn 'sport = :5000'

# 停止占用端口的进程
kill <PID>

# 或者使用 PM2
pnpm run pm2:stop
```

### 问题 2：进程频繁重启

**症状**：
- 进程不断重启
- 日志显示重启次数过多

**解决方案**：

```bash
# 查看日志
tail -f /tmp/process-monitor.log

# 检查服务器日志
tail -f /tmp/server.log

# 检查内存使用
free -h

# 检查磁盘空间
df -h
```

### 问题 3：API 返回 500 错误

**症状**：
```
POST /api/data 500 (Internal Server Error)
```

**解决方案**：

```bash
# 1. 检查是否运行了正确的服务器
ps aux | grep node

# 2. 如果运行了 Vite，停止它并启动 server.mjs
pkill -f "vite"
pnpm start

# 3. 检查数据文件权限
ls -la data/project-data.json

# 4. 检查磁盘空间
df -h
```

### 问题 4：构建失败

**症状**：
```
TypeScript 编译错误
```

**解决方案**：

```bash
# 1. 清理构建缓存
rm -rf node_modules/.vite
rm -rf dist

# 2. 重新安装依赖
pnpm install

# 3. 检查 TypeScript 错误
pnpm run typecheck

# 4. 重新构建
pnpm run build
```

---

## 最佳实践

### 1. 使用 PM2 管理生产环境

```bash
# 推荐使用 PM2 启动生产环境
pnpm run pm2:start

# 设置开机自启
npx pm2 startup
npx pm2 save
```

### 2. 定期备份数据

```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR="/backup/project-data"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
cp data/project-data.json "$BACKUP_DIR/project-data-$DATE.json"
```

### 3. 监控日志大小

```bash
# 设置日志轮转
npx pm2 install pm2-logrotate

# 配置日志轮转
npx pm2 set pm2-logrotate:max_size 10M
npx pm2 set pm2-logrotate:retain 7
```

### 4. 定期更新依赖

```bash
# 检查过期依赖
pnpm outdated

# 更新依赖
pnpm update
```

---

## 附录

### A. 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发环境 |
| `pnpm start` | 启动生产环境 |
| `pnpm build` | 构建项目 |
| `pnpm run pm2:start` | 使用 PM2 启动 |
| `bash scripts/monitor.sh` | 运行监控脚本 |

### B. 文件结构

```
.
├── scripts/
│   ├── start.sh          # 启动脚本
│   └── monitor.sh        # 监控脚本
├── ecosystem.config.js   # PM2 配置
├── server.mjs           # 生产服务器
├── .coze               # Coze 配置
└── package.json        # 依赖和脚本
```

### C. 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 5000 | 主服务 | 开发和生产环境都使用此端口 |

---

## 联系支持

如有问题，请联系技术支持或查看项目文档。
