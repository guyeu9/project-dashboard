# 部署后 API 404 错误排查

## 问题描述

部署后出现以下错误：

```
Warning: Instance created by `useForm` is not connected to any Form element. Forget to pass `form` prop?

Failed to load system prompt from database:
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON

Failed to load providers from database:
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON

Failed to save default providers to database:
Error: API POST /ai/providers failed: 404
```

## 根因分析

### 错误信息解读

1. **SyntaxError: Unexpected token '<'**
   - API 返回了 HTML（`<!doctype`）而不是 JSON
   - 这通常意味着返回了 404 页面

2. **API POST /ai/providers failed: 404**
   - `/api/ai/providers` 路由不存在
   - 返回 404 状态码

### 可能的原因

1. **部署系统使用了旧版本的 server.ts**
   - 旧版本没有实现 `/api/ai/config` 和 `/api/ai/providers` 路由
   - 所有 API 请求都会返回 404（HTML 页面）

2. **server.ts 没有被正确复制到运行环境**
   - 部署系统可能没有复制 server.ts 文件
   - 或者复制了旧版本的 server.ts

3. **依赖文件没有被正确复制**
   - `aiConfigManager.ts`、`aiProviderManager.ts` 等依赖文件缺失
   - 导致 API 路由无法正常工作

## 排查步骤

### 1. 检查部署日志

在部署系统的日志中查找：

```
[INFO] Server starting...
[INFO] distDir: /opt/bytefaas/dist
[INFO] NODE_ENV: production
[INFO] Working directory: /opt/bytefaas
[INFO] dist directory verified, found 1 JS files
[INFO] Latest JS file: index-xxxxxxx.js
```

**如果缺少验证日志**，说明使用的是旧版本的 server.ts！

### 2. 检查服务器日志

在服务器日志中查找：

```
[ERROR] GET /api/ai/config 失败
[ERROR] GET /api/ai/providers 失败
```

**如果完全没有这些日志**，说明请求没有到达 server.ts！

### 3. 检查文件是否存在

如果有 SSH 访问权限，检查：

```bash
# 检查 server.ts 是否存在
ls -la /opt/bytefaas/server.ts

# 检查依赖文件是否存在
ls -la /opt/bytefaas/src/storage/database/aiConfigManager.ts
ls -la /opt/bytefaas/src/storage/database/aiProviderManager.ts
ls -la /opt/bytefaas/src/api/dataApi.js

# 检查 server.ts 中的 API 路由
grep -n "api/ai/config" /opt/bytefaas/server.ts
grep -n "api/ai/providers" /opt/bytefaas/server.ts
```

### 4. 检查 API 路由

在浏览器中直接访问：

```
https://your-domain.com/api/ai/config
https://your-domain.com/api/ai/providers
```

**如果返回 404 HTML 页面**，说明路由不存在！

## 预期的正确行为

### 正常的部署日志

```
[INFO] Server starting...
[INFO] distDir: /opt/bytefaas/dist
[INFO] NODE_ENV: production
[INFO] Working directory: /opt/bytefaas
[INFO] dist directory verified, found 1 JS files
[INFO] Latest JS file: index-xxxxxxx.js
Server is running at http://localhost:5000
```

### 正常的 API 响应

访问 `/api/ai/config` 应该返回：

```json
[]
```

或包含配置项的 JSON 数组。

访问 `/api/ai/providers` 应该返回：

```json
[]
```

或包含提供商的 JSON 数组。

## 解决方案

### 方案 1：强制重新部署（推荐）

1. **在部署系统中找到"强制重新部署"选项**
2. **点击"清除缓存"**（如果有）
3. **触发部署**

### 方案 2：手动清理部署环境（如果有 SSH 权限）

```bash
# SSH 登录到部署服务器
ssh <deploy-server>

# 停止服务
cd /opt/bytefaas
pkill -f "npx tsx server.ts"

# 删除所有文件
rm -rf dist server.ts src

# 退出 SSH
exit

# 在部署系统中重新部署
```

### 方案 3：验证 .coze 配置

确保 `.coze` 文件配置正确：

```toml
[project]
# 注意：不应该有 entrypoint = "index.html"
requires = ["nodejs-24"]

[deploy]
build = ["pnpm", "install", "&&", "pnpm", "run", "build"]
run = ["pnpm", "run", "start"]
```

### 方案 4：检查 Git 提交

确保最新的 commit 已推送到远程：

```bash
git log --oneline -3
git log origin/master --oneline -3
```

本地和远程应该一致。

## 已知的修复

### Commit f8e25ee8

```
fix: 移除 .coze entrypoint，在 build 步骤中执行 vite build
```

**修改内容**：
1. 移除 `entrypoint = "index.html"`
2. 在 build 步骤中执行 `pnpm run build`

**修复的问题**：
- 部署系统不再将项目识别为静态网站
- 会复制所有文件（包括 server.ts 和 src 目录）
- 确保 API 路由正常工作

## 验证修复

部署完成后，检查：

1. **首页功能**：
   - ✅ 显示"已暂停"状态卡片
   - ✅ 数据导入导出包含任务类型和历史记录
   - ✅ 通知过滤逻辑正常

2. **API 功能**：
   - ✅ `/api/ai/config` 返回 JSON
   - ✅ `/api/ai/providers` 返回 JSON
   - ✅ `/api/data` 返回 JSON

3. **设置页面**：
   - ✅ AI 配置可以加载和保存
   - ✅ 不再有 404 错误

## 联系支持

如果以上方案都无法解决问题，请联系部署系统支持团队，提供以下信息：

1. 部署日志（完整）
2. 服务器日志（完整）
3. `check-deployment.sh` 的输出
4. 部署系统的配置信息
5. 预期行为 vs 实际行为的对比

## 相关文档

- `DEPLOYMENT_TROUBLESHOOTING.md` - 完整的排查和操作指南
- `DEPLOYMENT_ROOT_CAUSE_ANALYSIS.md` - 详细的根因分析
- `check-deployment.sh` - 自动化诊断脚本
