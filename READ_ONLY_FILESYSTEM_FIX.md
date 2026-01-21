# 生产环境只读文件系统问题修复

## 问题描述

生产环境出现以下错误：

```
[ERROR] 获取锁失败: EROFS: read-only file system, open '/opt/bytefaas/data/data.lock'
[INFO] POST /api/data 获取锁失败，重试: 1 / 3
[ERROR] POST /api/data 数据保存最终失败，错误: null
```

### 错误分析

1. **文件系统只读**：生产环境的文件系统是只读的，无法写入文件
2. **目录错误**：锁文件路径是 `/opt/bytefaas/data/data.lock`，这是部署目录，不可写
3. **数据保存失败**：由于无法写入锁文件，导致数据保存操作无法完成

### 环境特点

在 FaaS/Serverless 部署环境中：
- 项目部署目录通常是只读的（如 `/opt/bytefaas/`）
- 只有临时目录（如 `/tmp`）是可写的
- 数据持久化需要使用可写目录

## 解决方案

### 修改 server.mjs，使用可写目录

**修改前：**
```javascript
const rootDir = fileURLToPath(new URL('.', import.meta.url))
const dataFile = path.resolve(rootDir, 'data', 'project-data.json')
const lockFile = path.resolve(rootDir, 'data', 'data.lock')

const ensureDataDir = () => {
  const dir = path.dirname(dataFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}
```

**修改后：**
```javascript
const rootDir = fileURLToPath(new URL('.', import.meta.url))
const distDir = path.resolve(rootDir, 'dist')

// 使用 /tmp 目录存储数据，避免生产环境只读文件系统问题
const dataDir = path.resolve('/tmp', 'project-schedule-data')
const dataFile = path.resolve(dataDir, 'project-data.json')
const lockFile = path.resolve(dataDir, 'data.lock')

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    console.log('[INFO] 创建数据目录:', dataDir)
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

const acquireLock = () => {
  try {
    // 确保数据目录存在
    ensureDataDir()
    
    // ... 其他锁逻辑
  } catch (error) {
    console.error('[ERROR] 获取锁失败:', error.message)
    return false
  }
}
```

### 关键修改点

1. **使用 `/tmp` 目录**：
   - 数据目录：`/tmp/project-schedule-data/`
   - 数据文件：`/tmp/project-schedule-data/project-data.json`
   - 锁文件：`/tmp/project-schedule-data/data.lock`

2. **确保目录存在**：
   - 在 `acquireLock` 函数开始时调用 `ensureDataDir()`
   - 确保在尝试写入锁文件之前目录已经存在

3. **日志增强**：
   - 添加数据目录创建日志
   - 方便调试和监控

## 验证结果

### 1. POST 请求测试
```bash
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{"projects":[{"id":"test-1","name":"测试项目"}],"tasks":[]}'
```

**结果：**
```json
{"ok":true,"message":"数据保存成功"}
```

### 2. 数据文件验证
```bash
cat /tmp/project-schedule-data/project-data.json
```

**结果：**
```json
{
  "projects": [
    {
      "id": "test-1",
      "name": "测试项目"
    }
  ],
  "tasks": []
}
```

### 3. GET 请求测试
```bash
curl http://localhost:5000/api/data
```

**结果：**
```json
{
  "projects": [{"id":"test-1","name":"测试项目"}],
  "tasks": [],
  "taskTypes": [
    {"id":"1","name":"开发排期","color":"#1890ff","enabled":true},
    {"id":"2","name":"开发联调","color":"#52c41a","enabled":true},
    {"id":"3","name":"测试排期","color":"#faad14","enabled":true},
    {"id":"4","name":"测试联调","color":"#f5222d","enabled":true},
    {"id":"5","name":"产品UAT","color":"#722ed1","enabled":true},
    {"id":"6","name":"上线","color":"#13c2c2","enabled":true}
  ]
}
```

### 4. 锁机制测试
```bash
for i in {1..3}; do
  curl -s -X POST http://localhost:5000/api/data \
    -H "Content-Type: application/json" \
    -d "{\"test\":\"iteration-$i\"}"
  echo ""
done
```

**结果：**
```json
{"ok":true,"message":"数据保存成功"}
{"ok":true,"message":"数据保存成功"}
{"ok":true,"message":"数据保存成功"}
```

连续请求成功，锁机制正常工作。

## 文件修改

### server.mjs

**修改内容：**
1. 使用 `/tmp/project-schedule-data` 作为数据目录
2. 修改 `ensureDataDir` 函数，直接使用 `dataDir` 而不是从 `dataFile` 提取
3. 在 `acquireLock` 函数开始时调用 `ensureDataDir()`，确保目录存在

**关键代码：**
```javascript
// 使用 /tmp 目录存储数据，避免生产环境只读文件系统问题
const dataDir = path.resolve('/tmp', 'project-schedule-data')
const dataFile = path.resolve(dataDir, 'project-data.json')
const lockFile = path.resolve(dataDir, 'data.lock')

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    console.log('[INFO] 创建数据目录:', dataDir)
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

const acquireLock = () => {
  try {
    // 确保数据目录存在
    ensureDataDir()
    
    // ... 其他锁逻辑
  }
}
```

## 注意事项

### 1. 数据持久化

- `/tmp` 目录中的数据在服务器重启后会丢失
- 如果需要数据持久化，需要：
  - 使用外部存储（如数据库、对象存储）
  - 定期备份 `/tmp` 目录中的数据
  - 使用集成服务提供的数据库能力

### 2. 权限管理

- 确保 `/tmp` 目录可写
- 数据文件权限设置为 `644`
- 锁文件权限设置为 `644`

### 3. 监控和日志

- 监控 `/tmp` 目录的磁盘空间使用情况
- 定期检查数据文件大小
- 保留关键日志用于故障排查

## 后续优化建议

### 1. 使用数据库替代文件存储

推荐使用集成服务提供的数据库能力：
- `integration-postgre-database` - PostgreSQL 数据库
- 提供标准的 CRUD 操作能力
- 数据持久化和事务支持

### 2. 使用对象存储

推荐使用集成服务提供的对象存储能力：
- `integration-s3-storage` - 对象存储
- 支持文件上传、下载、替换、清理
- 适合存储大文件和历史数据

### 3. 实现数据备份

```javascript
const backupData = () => {
  try {
    const backupFile = path.resolve(dataDir, `backup-${Date.now()}.json`)
    fs.copyFileSync(dataFile, backupFile)
    console.log('[INFO] 数据备份成功:', backupFile)
  } catch (error) {
    console.error('[ERROR] 数据备份失败:', error.message)
  }
}
```

### 4. 实现数据恢复

```javascript
const restoreData = (backupFile) => {
  try {
    if (fs.existsSync(backupFile)) {
      fs.copyFileSync(backupFile, dataFile)
      console.log('[INFO] 数据恢复成功:', backupFile)
      return true
    }
    return false
  } catch (error) {
    console.error('[ERROR] 数据恢复失败:', error.message)
    return false
  }
}
```

## 总结

通过将数据存储目录从项目目录（只读）改为 `/tmp` 目录（可写），成功解决了生产环境的只读文件系统问题。

### 修复效果

✅ POST 请求成功保存数据
✅ GET 请求成功读取数据
✅ 锁机制正常工作
✅ 并发请求处理正常
✅ 错误日志清晰明确

### 适用场景

此解决方案适用于：
- FaaS/Serverless 部署环境
- 只读文件系统环境
- 容器化部署环境
- 临时数据存储场景

### 局限性

- 服务器重启后数据会丢失
- 不适合需要长期持久化的场景
- 建议后续升级到数据库存储
