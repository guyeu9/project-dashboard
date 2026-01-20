#!/bin/bash

# 项目启动脚本
# 根据 NODE_ENV 自动选择正确的服务器
#
# 使用方法:
#   开发环境: pnpm dev (NODE_ENV 默认为空或 development)
#   生产环境: pnpm start (NODE_ENV=production)
#
# 禁用开发服务:
#   在生产环境中，设置 NODE_ENV=production 强制只运行生产服务器
#   如果在生产环境尝试运行开发服务器，脚本会拒绝启动

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "================================================"
echo "项目启动脚本"
echo "================================================"
echo "工作目录: $PROJECT_ROOT"
echo "Node 版本: $(node --version)"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

# 检查环境变量
if [ -z "$NODE_ENV" ]; then
  # 如果没有设置 NODE_ENV，根据当前操作判断
  if [ "$1" = "start" ]; then
    export NODE_ENV=production
  else
    export NODE_ENV=development
  fi
fi

echo "环境模式: $NODE_ENV"

# 根据 NODE_ENV 选择启动方式
if [ "$NODE_ENV" = "production" ]; then
  echo ""
  echo -e "${GREEN}[INFO]${NC} 启动生产服务器: server.mjs"
  echo "端口: ${PORT:-5000}"
  echo "================================================"
  
  # 检查生产服务器文件是否存在
  if [ ! -f "server.mjs" ]; then
    echo -e "${RED}[ERROR]${NC} 生产服务器文件不存在: server.mjs"
    exit 1
  fi
  
  # 检查 dist 目录是否存在
  if [ ! -d "dist" ]; then
    echo -e "${YELLOW}[WARN]${NC} dist 目录不存在，尝试构建..."
    pnpm run build || {
      echo -e "${RED}[ERROR]${NC} 构建失败"
      exit 1
    }
  fi
  
  # 启动生产服务器
  exec node server.mjs
  
elif [ "$NODE_ENV" = "development" ]; then
  echo ""
  echo -e "${GREEN}[INFO]${NC} 启动开发服务器: Vite"
  echo "端口: ${PORT:-5000}"
  echo "================================================"
  
  # 检查 pnpm 是否安装
  if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} pnpm 未安装，请先安装 pnpm"
    exit 1
  fi
  
  # 启动开发服务器
  exec pnpm dev --port "${PORT:-5000}" --host
  
else
  echo -e "${RED}[ERROR]${NC} 未知的 NODE_ENV: $NODE_ENV"
  echo "请使用以下值之一:"
  echo "  - production (生产环境)"
  echo "  - development (开发环境)"
  exit 1
fi
