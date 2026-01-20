#!/bin/bash

# 启动脚本 - 根据环境自动选择正确的服务器

set -e

# 检测环境变量
NODE_ENV=${NODE_ENV:-"development"}

echo "=========================================="
echo "环境: $NODE_ENV"
echo "工作目录: $(pwd)"
echo "=========================================="

if [ "$NODE_ENV" = "production" ]; then
  echo "✓ 启动生产服务器: node server.mjs"
  exec node server.mjs
else
  echo "✓ 启动开发服务器: pnpm dev --port 5000 --host"
  exec pnpm dev --port 5000 --host
fi
