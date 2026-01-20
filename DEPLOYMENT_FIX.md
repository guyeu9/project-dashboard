# 部署配置修复说明

## 问题描述

在一键部署环境中，原有的部署配置无法正常工作，因为：
1. 一键部署环境不支持 bash 脚本执行
2. .coze 文件中的 deploy.run 配置使用了 bash 命令：`["NODE_ENV=production", "bash", "scripts/start.sh"]`
3. 这导致生产环境无法启动，一直报错

## 解决方案

修改 .coze 文件的 deploy.run 配置，直接使用 node 命令运行 server.mjs：

```toml
[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["node", "server.mjs"]
```

## 验证结果

### 1. 服务器启动测试
```bash
node server.mjs
# 输出：Server is running at http://localhost:5000
```

### 2. 端口检测
```bash
ss -lptn 'sport = :5000'
# 输出：LISTEN 0 511 *:5000 *:* users:(("node",pid=xxx,fd=xx))
```

### 3. HTTP 响应测试
```bash
curl -I http://localhost:5000
# 输出：HTTP/1.1 200 OK
```

### 4. API 接口测试
```bash
curl http://localhost:5000/api/data
# 输出：{"projects":[...],"tasks":[...],...}
```

## 关键配置说明

### server.mjs 端口配置
```javascript
const port = process.env.PORT || 5000
```

- 默认使用 5000 端口
- 可通过环境变量 PORT 覆盖端口配置
- 符合一键部署环境的端口要求

### .coze 配置对比

**修改前（不支持）：**
```toml
[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["NODE_ENV=production", "bash", "scripts/start.sh"]
```

**修改后（支持）：**
```toml
[deploy]
build = ["pnpm", "run", "deploy:build"]
run = ["node", "server.mjs"]
```

## 部署流程

1. **构建阶段**
   - 执行 `pnpm run deploy:build`
   - 该脚本会先安装依赖，然后运行 `tsc && vite build`
   - 构建产物生成在 `dist/` 目录

2. **运行阶段**
   - 执行 `node server.mjs`
   - server.mjs 启动 HTTP 服务器，监听 5000 端口
   - 提供 API 接口 (`/api/data`) 和静态文件服务

## 注意事项

1. **不再依赖脚本**：所有功能都集成在 server.mjs 中，无需额外的 shell 脚本
2. **环境变量**：如需设置环境变量，可以在 server.mjs 中直接读取 `process.env`
3. **端口配置**：确保 server.mjs 默认使用 5000 端口，符合一键部署环境要求
4. **构建产物**：确保 `dist/` 目录包含完整的构建产物

## 相关文件

- `.coze` - 部署配置文件（已修改）
- `server.mjs` - 生产环境服务器（无需修改）
- `package.json` - 项目依赖和脚本
- `dist/` - 构建产物目录

## 测试命令

```bash
# 本地测试生产环境
node server.mjs

# 检查端口占用
ss -lptn 'sport = :5000'

# 测试 API 接口
curl http://localhost:5000/api/data

# 测试页面访问
curl http://localhost:5000/
```

## 总结

通过将 deploy.run 配置从复杂的 bash 脚本改为简单的 node 命令，解决了在一键部署环境中无法运行脚本的问题。新的配置：
- ✅ 不依赖 bash 脚本执行
- ✅ 直接使用 node 命令，兼容性更好
- ✅ 端口配置正确（默认 5000）
- ✅ 经过完整测试验证
- ✅ 符合一键部署环境要求
