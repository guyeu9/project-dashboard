# POST 500 错误故障排查指南

## 问题现象

```
POST https://w2zpsddd9x.coze.site/api/data 500 (Internal Server Error)
[ERROR] 数据保存失败 (尝试 1/3): 500
```

## 快速诊断

### 步骤 1：运行诊断工具

```bash
# 在生产环境执行
pnpm run diagnose
```

或者：

```bash
bash scripts/diagnose.sh
```

### 步骤 2：查看诊断结果

诊断工具会检查以下内容：
1. 端口 5000 是否被占用
2. 运行中的 Node.js 进程
3. 环境变量配置
4. 关键文件是否存在
5. 构建产物是否完整
6. 数据文件状态
7. API 端点响应

## 常见原因和解决方案

### 原因 1：运行了 Vite 开发服务器而不是 server.mjs

**症状**：
- 进程列表中包含 `vite.js`
- POST 请求返回 500 错误
- GET 请求可能正常返回

**诊断**：
```bash
ps aux | grep node
# 看到类似：node /path/to/vite/bin/vite.js
```

**解决方案**：

#### 方案 A：使用快速修复脚本（推荐）

```bash
pnpm run fix:production
```

#### 方案 B：手动修复

```bash
# 1. 停止 Vite 进程
pkill -f "node.*vite"

# 2. 启动生产服务器
NODE_ENV=production bash scripts/start.sh

# 3. 验证
pnpm run diagnose
```

#### 方案 C：使用 PM2

```bash
# 1. 停止所有进程
pkill -f "node.*vite\|node.*server.mjs"

# 2. 使用 PM2 启动
pnpm run pm2:start

# 3. 验证
pnpm run pm2:status
```

### 原因 2：dist 目录不存在或构建不完整

**症状**：
- 访问主页返回 404
- 静态资源加载失败

**诊断**：
```bash
ls -la dist/
# 目录不存在或文件数量异常
```

**解决方案**：

```bash
# 重新构建
pnpm run build

# 重启服务器
pnpm run fix:production
```

### 原因 3：数据文件权限问题

**症状**：
- 服务器日志显示权限错误
- 无法写入数据文件

**诊断**：
```bash
ls -la data/
# 检查文件权限
```

**解决方案**：

```bash
# 修复权限
chmod -R 755 data/

# 重启服务器
pnpm run fix:production
```

### 原因 4：数据文件损坏或格式错误

**症状**：
- 服务器日志显示 JSON 解析错误
- API 返回 500 错误

**诊断**：
```bash
cat data/project-data.json | python3 -m json.tool
# 检查 JSON 格式是否正确
```

**解决方案**：

```bash
# 备份旧数据
cp data/project-data.json data/project-data.json.backup

# 创建新的数据文件
cat > data/project-data.json << 'EOF'
{
  "projects": [],
  "tasks": [],
  "taskTypes": [
    {"id": "1", "name": "开发排期", "color": "#1890ff", "enabled": true},
    {"id": "2", "name": "开发联调", "color": "#52c41a", "enabled": true},
    {"id": "3", "name": "测试排期", "color": "#faad14", "enabled": true},
    {"id": "4", "name": "测试联调", "color": "#f5222d", "enabled": true},
    {"id": "5", "name": "产品UAT", "color": "#722ed1", "enabled": true},
    {"id": "6", "name": "上线", "color": "#13c2c2", "enabled": true}
  ],
  "pmos": [],
  "productManagers": [],
  "historyRecords": []
}
EOF

# 重启服务器
pnpm run fix:production
```

### 原因 5：端口被占用

**症状**：
- 服务器启动失败
- 日志显示 EADDRINUSE 错误

**诊断**：
```bash
ss -lptn 'sport = :5000'
```

**解决方案**：

```bash
# 使用快速修复脚本（会自动处理）
pnpm run fix:production

# 或手动停止占用端口的进程
kill $(ss -lptn 'sport = :5000' | grep -o 'pid=[0-9]*' | cut -d= -f2)

# 启动服务器
pnpm run fix:production
```

## 验证修复

### 1. 检查服务器状态

```bash
pnpm run diagnose
```

### 2. 测试 API

```bash
# 测试 GET 请求
curl http://localhost:5000/api/data

# 测试 POST 请求
curl -X POST -H "Content-Type: application/json" \
  -d '{"projects":[], "tasks":[], "taskTypes":[], "pmos":[], "productManagers":[], "historyRecords":[]}' \
  http://localhost:5000/api/data
```

### 3. 查看日志

```bash
# 使用 PM2
pnpm run pm2:logs

# 或直接查看日志文件
tail -f /tmp/server.log
```

## 预防措施

### 1. 使用 PM2 管理进程

```bash
# 启动
pnpm run pm2:start

# 设置开机自启
npx pm2 startup
npx pm2 save
```

### 2. 定期监控

```bash
# 添加到 crontab（每 5 分钟检查一次）
*/5 * * * * cd /path/to/project && bash scripts/monitor.sh >> /tmp/monitor.log 2>&1
```

### 3. 定期备份

```bash
# 备份数据文件
cp data/project-data.json backup/project-data-$(date +%Y%m%d_%H%M%S).json
```

### 4. 监控日志大小

```bash
# 安装日志轮转
npx pm2 install pm2-logrotate

# 配置日志轮转
npx pm2 set pm2-logrotate:max_size 10M
npx pm2 set pm2-logrotate:retain 7
```

## 获取帮助

如果以上方法都无法解决问题：

1. 收集诊断信息：
```bash
pnpm run diagnose > diagnosis-report.txt 2>&1
```

2. 收集服务器日志：
```bash
tail -100 /tmp/server.log > server-log.txt
```

3. 检查系统资源：
```bash
free -h > system-info.txt
df -h >> system-info.txt
```

4. 联系技术支持并提供以上信息

## 附录

### 常用命令速查

| 命令 | 说明 |
|------|------|
| `pnpm run diagnose` | 诊断服务器状态 |
| `pnpm run fix:production` | 快速修复生产环境 |
| `pnpm run pm2:start` | 使用 PM2 启动 |
| `pnpm run pm2:status` | 查看 PM2 状态 |
| `pnpm run pm2:logs` | 查看 PM2 日志 |
| `pnpm run pm2:restart` | 重启 PM2 进程 |
| `pnpm run monitor` | 运行监控脚本 |

### 文件位置

| 文件 | 路径 |
|------|------|
| 服务器日志 | `/tmp/server.log` |
| 数据文件 | `data/project-data.json` |
| PM2 日志 | `/tmp/pm2-project-schedule-*.log` |
| 监控日志 | `/tmp/process-monitor.log` |
