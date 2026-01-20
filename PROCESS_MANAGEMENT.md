# 进程管理部署总结

本文档总结了进程管理部署方案的实施和测试结果。

## 完成的工作

### 1. 创建启动脚本（scripts/start.sh）

**功能**：
- 根据 `NODE_ENV` 环境变量自动选择正确的服务器
- 开发环境：启动 Vite 开发服务器（支持热更新）
- 生产环境：启动 Node.js 生产服务器（server.mjs）
- 环境检查和错误处理

**使用方法**：
```bash
# 开发环境
pnpm dev

# 生产环境
pnpm start
NODE_ENV=production bash scripts/start.sh
```

### 2. 创建 PM2 配置（ecosystem.config.js）

**功能**：
- 自动重启崩溃的进程
- 日志管理和轮转
- 内存限制（1G）
- 健康检查
- 详细的配置选项

**使用方法**：
```bash
# 启动
pnpm run pm2:start

# 停止
pnpm run pm2:stop

# 重启
pnpm run pm2:restart

# 查看日志
pnpm run pm2:logs
```

### 3. 创建监控脚本（scripts/monitor.sh）

**功能**：
- 检测进程是否运行
- 检测端口是否监听
- 自动重启失败的进程
- 限制重启频率（防止无限重启）
- 日志记录
- 锁文件保护（防止重复执行）

**使用方法**：
```bash
# 手动运行
bash scripts/monitor.sh

# 添加到 crontab（每分钟检查一次）
* * * * * cd /path/to/project && bash scripts/monitor.sh >> /tmp/monitor.log 2>&1
```

### 4. 更新配置文件

#### .coze 配置更新
```toml
[dev]
build = ["pnpm", "install"]
run = ["bash", "scripts/start.sh"]

[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["NODE_ENV=production", "bash", "scripts/start.sh"]
```

#### package.json 更新
添加了以下脚本：
- `start` - 启动生产服务器
- `pm2:start` - 使用 PM2 启动
- `pm2:stop` - 停止 PM2
- `pm2:restart` - 重启 PM2
- `pm2:logs` - 查看日志
- `pm2:status` - 查看状态
- `monitor` - 运行监控脚本

### 5. 创建部署文档

- **DEPLOYMENT_GUIDE.md** - 详细的部署指南
- **DEPLOYMENT.md** - 生产环境部署问题分析

## 测试结果

### 1. 启动脚本测试

✅ **测试通过**
- 开发环境正确启动 Vite
- 生产环境正确启动 server.mjs
- 环境变量识别正确

### 2. 监控脚本测试

✅ **测试通过**
- 成功检测进程停止
- 自动重启失败的服务
- 日志记录正常
- 颜色输出正常（终端显示颜色，文件不显示颜色）

### 3. API 功能测试

✅ **测试通过**
- GET 请求正常返回数据
- POST 请求正常保存数据
- 数据持久化正常

## 禁用开发服务的方法

### 方法 1：设置 NODE_ENV=production

```bash
export NODE_ENV=production
pnpm start  # 只会启动 server.mjs
```

### 方法 2：使用 .coze 配置

`.coze` 配置文件已经配置好，生产环境会自动使用 `NODE_ENV=production`：

```toml
[deploy]
run = ["NODE_ENV=production", "bash", "scripts/start.sh"]
```

### 方法 3：启动脚本强制限制

`scripts/start.sh` 已经内置了环境检查逻辑：

```bash
if [ "$NODE_ENV" = "production" ]; then
  # 只启动 server.mjs
  exec node server.mjs
fi
```

## 推荐部署方式

### 生产环境（推荐使用 PM2）

```bash
# 使用 PM2 启动
pnpm run pm2:start

# 设置开机自启
npx pm2 startup
npx pm2 save
```

### 开发环境

```bash
# 直接使用 Coze CLI
coze dev
```

## 文件结构

```
.
├── scripts/
│   ├── start.sh              # 启动脚本
│   └── monitor.sh            # 监控脚本
├── ecosystem.config.js       # PM2 配置
├── server.mjs               # 生产服务器
├── .coze                   # Coze 配置（已更新）
├── package.json            # 依赖和脚本（已更新）
├── DEPLOYMENT_GUIDE.md     # 部署指南
└── DEPLOYMENT.md          # 部署问题分析
```

## 后续优化建议

1. **添加告警功能**
   - 集成邮件或钉钉告警
   - 进程重启时发送通知

2. **日志管理**
   - 使用 PM2 日志轮转
   - 定期清理旧日志

3. **健康检查**
   - 添加 HTTP 健康检查端点
   - 监控脚本定期检查服务可用性

4. **性能监控**
   - 使用 PM2 监控 CPU 和内存使用
   - 设置性能告警阈值

5. **自动化部署**
   - 集成 CI/CD 流程
   - 自动化测试和部署

## 常见问题

### Q: 为什么监控脚本显示颜色代码？

A: 之前版本的脚本在日志文件中也显示了颜色代码，已修复。现在只在终端输出时显示颜色。

### Q: 如何验证生产环境运行的是正确的服务器？

A: 使用以下命令：
```bash
ps aux | grep node
# 应该看到 "node server.mjs" 而不是 "vite"
```

### Q: PM2 和监控脚本可以同时使用吗？

A: 不建议。PM2 已经内置了自动重启功能，不需要额外的监控脚本。

## 联系支持

如有问题，请参考 DEPLOYMENT_GUIDE.md 获取详细信息。
