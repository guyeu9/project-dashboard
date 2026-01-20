#!/bin/bash

# 生产环境快速修复脚本
# 用于一键修复生产环境问题
#
# 使用方法:
#   bash scripts/fix-production.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "================================================"
echo "生产环境快速修复工具"
echo "================================================"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"
echo ""

# 步骤 1: 停止所有 Node.js 进程
echo -e "${BLUE}[步骤 1/5]${NC} 停止所有 Node.js 进程..."
pkill -f "node.*vite" 2>/dev/null && echo -e "${GREEN}✓${NC} 已停止 Vite 进程" || echo -e "${YELLOW}⚠${NC} 未找到 Vite 进程"
pkill -f "node.*server.mjs" 2>/dev/null && echo -e "${GREEN}✓${NC} 已停止 server.mjs 进程" || echo -e "${YELLOW}⚠${NC} 未找到 server.mjs 进程"

# 等待进程完全停止
sleep 3

# 检查是否还有进程残留
if pgrep -f "node.*vite\|node.*server.mjs" > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} 进程仍在运行，尝试强制停止..."
    pkill -9 -f "node.*vite\|node.*server.mjs" 2>/dev/null
    sleep 2
fi
echo ""

# 步骤 2: 检查并创建 dist 目录
echo -e "${BLUE}[步骤 2/5]${NC} 检查构建产物..."
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠${NC} dist 目录不存在，开始构建..."
    pnpm run build || {
        echo -e "${RED}✗${NC} 构建失败，请检查错误"
        exit 1
    }
    echo -e "${GREEN}✓${NC} 构建完成"
else
    echo -e "${GREEN}✓${NC} dist 目录已存在"
fi
echo ""

# 步骤 3: 检查并创建 data 目录
echo -e "${BLUE}[步骤 3/5]${NC} 检查数据目录..."
if [ ! -d "data" ]; then
    mkdir -p data
    echo -e "${GREEN}✓${NC} 已创建 data 目录"
else
    echo -e "${GREEN}✓${NC} data 目录已存在"
fi

# 检查数据文件
if [ ! -f "data/project-data.json" ]; then
    echo -e "${YELLOW}⚠${NC} 数据文件不存在，创建默认数据文件..."
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
    echo -e "${GREEN}✓${NC} 已创建默认数据文件"
else
    echo -e "${GREEN}✓${NC} 数据文件已存在"
fi
echo ""

# 步骤 4: 设置环境变量并启动服务器
echo -e "${BLUE}[步骤 4/5]${NC} 启动生产服务器..."
export NODE_ENV=production

# 检查是否使用 PM2
USE_PM2=false
if command -v pm2 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 检测到 PM2，使用 PM2 管理进程"
    USE_PM2=true
fi

if [ "$USE_PM2" = true ]; then
    # 停止旧的 PM2 进程
    npx pm2 stop project-schedule 2>/dev/null || true
    npx pm2 delete project-schedule 2>/dev/null || true
    
    # 启动新进程
    npx pm2 start ecosystem.config.js --env production
    echo -e "${GREEN}✓${NC} 已使用 PM2 启动服务器"
else
    # 直接启动
    nohup node server.mjs > /tmp/server.log 2>&1 &
    SERVER_PID=$!
    echo -e "${GREEN}✓${NC} 已启动服务器（PID: $SERVER_PID）"
fi
echo ""

# 步骤 5: 验证服务是否正常运行
echo -e "${BLUE}[步骤 5/5]${NC} 验证服务状态..."
sleep 5

# 检查端口
if ss -tuln 2>/dev/null | grep -q ":5000[[:space:]]"; then
    echo -e "${GREEN}✓${NC} 端口 5000 正在监听"
else
    echo -e "${RED}✗${NC} 端口 5000 未监听"
    echo ""
    echo "查看日志："
    tail -20 /tmp/server.log 2>/dev/null || echo "日志文件不存在"
    exit 1
fi

# 检查进程
if pgrep -f "node.*server.mjs" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} server.mjs 进程正在运行"
else
    echo -e "${RED}✗${NC} server.mjs 进程未运行"
    echo ""
    echo "查看日志："
    tail -20 /tmp/server.log 2>/dev/null || echo "日志文件不存在"
    exit 1
fi

# 测试 API
if command -v curl > /dev/null 2>&1; then
    echo "测试 API..."
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:5000/api/data 2>/dev/null || echo "HTTP_CODE:000")
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} API 响应正常"
    else
        echo -e "${RED}✗${NC} API 响应异常（HTTP $http_code）"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl 不可用，跳过 API 测试"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✓ 修复完成！${NC}"
echo "================================================"
echo ""
echo "生产环境已成功启动！"
echo ""
echo "常用命令："
if [ "$USE_PM2" = true ]; then
    echo "  查看状态: pnpm run pm2:status"
    echo "  查看日志: pnpm run pm2:logs"
    echo "  重启服务: pnpm run pm2:restart"
    echo "  停止服务: pnpm run pm2:stop"
else
    echo "  查看日志: tail -f /tmp/server.log"
    echo "  停止服务: pkill -f 'node.*server.mjs'"
    echo "  重启服务: bash scripts/fix-production.sh"
fi
echo ""
echo "验证服务器状态："
echo "  pnpm run diagnose"
echo ""
