#!/bin/bash

# 部署诊断脚本
# 用于检查部署环境和代码状态

echo "=== 部署诊断工具 ==="
echo ""

echo "1. 检查 Git 状态..."
git status
echo ""

echo "2. 检查最新提交..."
git log --oneline -5
echo ""

echo "3. 检查远程仓库同步状态..."
git log origin/master --oneline -3
echo ""

echo "4. 检查 .coze 配置..."
cat .coze
echo ""

echo "5. 检查 package.json 的 start 脚本..."
grep -A 1 '"start"' package.json
echo ""

echo "6. 检查关键源代码文件是否存在..."
echo "Dashboard 组件:"
ls -lh src/pages/Dashboard/index.tsx 2>&1
echo ""
echo "暂停卡片相关代码:"
grep -n "已暂停" src/pages/Dashboard/index.tsx
echo ""
echo "黄色渐变变量:"
grep -n "gradient-yellow" src/styles/variables.css
echo ""

echo "7. 检查 dist 目录..."
if [ -d "dist" ]; then
  echo "dist 目录存在"
  ls -lh dist/
  echo ""
  echo "dist 目录修改时间:"
  stat dist/ | grep Modify
  echo ""
  echo "index.html 修改时间:"
  stat dist/index.html 2>&1 | grep Modify
  echo ""
  echo "dist/assets 目录内容:"
  ls -lh dist/assets/ 2>&1 | head -10
else
  echo "dist 目录不存在"
fi
echo ""

echo "8. 检查构建配置..."
cat vite.config.ts
echo ""

echo "9. 检查依赖安装..."
if [ -d "node_modules" ]; then
  echo "node_modules 目录存在"
  echo "node_modules 修改时间:"
  stat node_modules/ | grep Modify
else
  echo "node_modules 目录不存在"
fi
echo ""

echo "=== 诊断完成 ==="
echo ""
echo "建议操作："
echo "1. 确保 Git 代码已推送到远程仓库"
echo "2. 在部署系统中触发'重新构建'而不是'重启服务'"
echo "3. 如果支持，在部署系统中清除缓存"
echo "4. 部署后检查 dist 目录的修改时间是否为最新"
