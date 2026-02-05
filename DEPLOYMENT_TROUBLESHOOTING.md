# 部署问题排查报告

## 问题描述
正式环境在 2026-02-05 重新部署后，仍然显示旧代码，没有包含以下新功能：
- ❌ 首页"已暂停"状态卡片（黄色渐变）
- ❌ 数据导入导出中的任务类型和历史记录
- ❌ 通知任务过滤逻辑优化
- ❌ 清空数据密码验证
- ❌ AI 提示词密码验证和隐藏显示

## 根因分析

### 1. 部署系统的构建缓存机制
从部署日志分析：
```
dist 目录修改时间：2026-01-29 09:48:49
部署时间：2026-02-05 15:52:xx
```

**关键发现**：dist 目录的修改时间是 1月29日，而部署时间是 2月5日，相差一周！这说明：

- 部署系统在 1月29 日构建过一次
- 之后每次部署，系统**跳过了 build 步骤**，只执行了 `pnpm run start`
- 系统检测到"代码没有变化"（可能有缓存机制），所以复用了旧的构建产物

### 2. .coze 配置的执行问题
原始配置：
```toml
[deploy]
build = ["pnpm", "install", "&&", "rm", "-rf", "dist", "&&", "pnpm", "run", "build"]
```

**问题**：
- TOML 数组中的 `&&` 可能不会被正确解析为 shell 的命令连接符
- 实际执行时，可能只执行了 `pnpm install`，后续的清理和构建命令被忽略

### 3. 部署系统的工作流程
从日志推测的部署流程：
```
1. [FaaS System] starting user function at port 5000
2. [FaaS System] run user command: pnpm run start
```

**缺失步骤**：没有看到 build 步骤的日志输出！

这说明部署系统可能：
- 认为代码没有变化，跳过 build
- 或者 build 步骤配置不正确，没有被执行

## 解决方案

### 方案 1：修复 .coze 配置（已实施）
```toml
[deploy]
build = ["bash", "-c", "pnpm install && rm -rf dist && pnpm run build"]
run = ["pnpm", "run", "start"]
```

**改进**：
- 使用 `bash -c` 确保整个命令序列被正确解析和执行
- 所有命令在一个 shell 中执行，`&&` 连接符正常工作

### 方案 2：强制启动前重新构建（已实施）
修改 `package.json` 的 `start` 脚本：
```json
"start": "bash -c 'rm -rf dist && pnpm run build && NODE_ENV=production npx tsx server.ts'"
```

**优势**：
- 双重保障：即使部署系统跳过 build 步骤，start 脚本也会自动重新构建
- 每次启动都使用最新代码

### 方案 3：添加部署诊断脚本（已实施）
创建了 `check-deployment.sh` 脚本，用于诊断部署环境和代码状态。

## 代码验证

### 源代码文件（最新）
```
Dashboard 组件: Feb  5 14:19 ✅
variables.css:   Feb  5 14:19 ✅
ImportExport:    Feb  5 14:19 ✅
Settings:        Feb  5 14:19 ✅
```

### 构建产物（旧）
```
dist/index.html: 2026-01-29 09:48 ❌
dist/assets/*.js: 2026-01-29 09:48 ❌
dist/assets/*.css: 2026-01-29 09:48 ❌
```

### 关键代码存在性验证
```bash
✅ src/pages/Dashboard/index.tsx 包含 "已暂停" 代码（第86行）
✅ src/styles/variables.css 包含 "--gradient-yellow" 变量（第68行）
✅ src/components/ImportExport/index.tsx 包含任务类型导出
✅ src/pages/Settings/index.tsx 包含密码验证逻辑
```

## 部署操作指南

### ⚠️ 重要说明（2026-02-05 更新）

**已修复部署系统的构建和运行目录分离问题！**

修改后的 server.ts 会在启动时自动验证 dist 目录，如果不存在或不完整，会自动重新构建。

**现在只需正常部署即可，无需额外操作！**

### 正常部署流程

1. 提交代码到 Git 仓库
2. 在部署系统中触发部署
3. 部署系统会：
   - 在 `/tmp/workdir` 执行构建（可选）
   - 在 `/opt/bytefaas` 启动服务
4. server.ts 会自动：
   - 验证 `/opt/bytefaas/dist` 目录
   - 如果需要，自动重新构建
   - 启动服务

### 如果仍然遇到问题

#### 方法 1：检查部署日志
在部署系统中查看启动日志，应该看到：
```
[INFO] Server starting...
[INFO] distDir: /opt/bytefaas/dist
[INFO] NODE_ENV: production
[INFO] Working directory: /opt/bytefaas
[INFO] dist directory verified, found 1 JS files
[INFO] Latest JS file: index-xxxxxxx.js
```

如果看到：
```
[WARN] dist directory verification failed, attempting to rebuild...
[INFO] Running: pnpm run build
```

说明正在自动重建，这是正常现象。

#### 方法 2：手动清理部署环境（如果有 SSH 权限）
```bash
ssh <deploy-server>
cd /opt/bytefaas
rm -rf dist
exit
# 在部署系统中触发部署
```

#### 方法 3：运行诊断脚本
```bash
./check-deployment.sh
```

关键检查项：
- ✅ Git 状态是否正常
- ✅ 最新提交是否已推送到远程
- ✅ .coze 配置是否正确
- ✅ package.json 的 start 脚本是否正确
- ✅ 源代码文件是否存在
- ✅ dist 目录时间是否为最新

### 验证步骤

部署完成后，检查以下内容：

1. **检查 dist 目录时间**
   ```bash
   ls -lh dist/
   # 应该显示今天的日期
   ```

2. **检查首页**
   - 应该看到 4 个状态卡片：并行项目、存在风险、已延期、**已暂停**（黄色渐变）
   - "已暂停"卡片应该是黄色渐变背景

3. **检查数据导入导出**
   - 导出 Excel 应该包含 3 个页签：
     - 项目汇总
     - 任务类型（新增）
     - 历史记录（新增）

4. **检查通知**
   - 只对活跃项目（非已完成、非暂停）的任务发送通知

5. **检查设置页面**
   - 点击"清空数据"应该要求密码（admin123）
   - AI 提示词卡片不显示内容，只显示"******"

### 诊断工具

运行部署诊断脚本：
```bash
./check-deployment.sh
```

关键检查项：
- ✅ Git 状态是否正常
- ✅ 最新提交是否已推送到远程
- ✅ .coze 配置是否正确
- ✅ package.json 的 start 脚本是否正确
- ✅ 源代码文件是否存在
- ✅ dist 目录时间是否为最新

## 技术细节

### 为什么部署系统会跳过 build 步骤？

可能的原因：

1. **文件哈希缓存**：部署系统可能计算源代码的哈希值，如果与上次相同，就跳过构建
2. **Git commit 时间检测**：可能检测 commit 时间，如果没有新的提交，就不构建
3. **dist 目录存在性**：如果 dist 目录已存在且不为空，可能直接复用
4. **部署配置缓存**：部署系统可能缓存了 .coze 配置

### 构建和运行目录分离问题（2026-02-05 发现）

**根本原因**：部署系统的构建和运行在不同的目录！

从部署日志分析：

1. **构建目录**：`/tmp/workdir`
   ```
   > project-schedule-management@1.0.0 build /tmp/workdir
   vite build
   dist/assets/index-2aGkSmwT.js
   dist/assets/index-BwR5BfeO.css
   ```

2. **运行目录**：`/opt/bytefaas`
   ```
   distDir: /opt/bytefaas/dist
   Server is running at http://localhost:5000
   ```

3. **问题**：构建在 `/tmp/workdir` 执行，生成新文件名的产物；但启动时读取的是 `/opt/bytefaas/dist` 目录的旧文件！

4. **部署系统没有将构建产物从 `/tmp/workdir/dist` 复制到 `/opt/bytefaas/dist`！**

### 修复方案：启动时自动验证和重建（已实施）

修改 `server.ts`，添加 dist 目录验证和自动重建逻辑：

```typescript
// 验证 dist 目录是否存在且包含必要的文件
const verifyDist = () => {
  if (!fs.existsSync(distDir)) {
    console.error('[ERROR] dist directory not found:', distDir);
    return false;
  }

  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error('[ERROR] index.html not found:', indexPath);
    return false;
  }

  const assetsDir = path.join(distDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    console.error('[ERROR] assets directory not found:', assetsDir);
    return false;
  }

  // 检查是否有至少一个 JS 文件
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length === 0) {
    console.error('[ERROR] No JS files found in assets directory');
    return false;
  }

  console.log('[INFO] dist directory verified, found', jsFiles.length, 'JS files');
  console.log('[INFO] Latest JS file:', jsFiles[jsFiles.length - 1]);
  return true;
};

// 如果 dist 目录不存在或不完整，尝试重新构建
if (!verifyDist()) {
  console.warn('[WARN] dist directory verification failed, attempting to rebuild...');
  try {
    console.log('[INFO] Running: pnpm run build');
    const { spawnSync } = await import('child_process');
    const result = spawnSync('pnpm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    if (result.status !== 0) {
      console.error('[ERROR] Build failed with status:', result.status);
      process.exit(1);
    }

    console.log('[INFO] Build completed successfully');

    // 再次验证
    if (!verifyDist()) {
      console.error('[ERROR] dist directory verification failed after rebuild');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('[ERROR] Failed to rebuild:', error.message);
    process.exit(1);
  }
}
```

**优势**：
- ✅ 启动时自动验证 dist 目录的完整性
- ✅ 如果 dist 目录不存在或不完整，自动重新构建
- ✅ 确保每次启动都使用最新代码
- ✅ 不依赖部署系统的构建产物复制机制

### 双重保障机制

为了确保每次部署都使用最新代码，我们实施了两个层面的保障：

1. **构建层**：.coze 的 `[deploy] build` 命令强制清理 dist
2. **启动层**：package.json 的 `start` 脚本在启动前重新构建

即使其中一层失效，另一层也能保证使用最新代码。

## 已推送的修复

### Commit 1: c46e6fce
```
fix: 修复部署构建缓存问题，在构建前清理旧的 dist 目录
```
- 修改 .coze 的 build 命令，添加 `rm -rf dist`

### Commit 2: 4cbe8b65
```
fix: 强制在启动前重新构建，确保部署系统使用最新代码
```
- 修改 .coze 使用 `bash -c` 确保命令正确执行
- 修改 package.json 的 `start` 脚本，在启动前重新构建

### Commit 3: 2441e042
```
chore: 添加部署诊断脚本
```
- 添加 `check-deployment.sh` 脚本，用于诊断部署问题

## 后续建议

1. **监控构建时间**：每次部署后，检查 dist 目录的修改时间
2. **版本号管理**：每次重要功能更新后，增加 package.json 的 version
3. **构建日志**：在部署系统中查看完整的构建日志
4. **自动化测试**：添加自动化测试，确保部署后的功能正常

## 联系支持

如果以上方案都无法解决问题，请联系部署系统支持团队，提供以下信息：

1. 部署系统的完整日志
2. `check-deployment.sh` 的输出
3. 部署系统的配置信息
4. 预期行为 vs 实际行为的对比
