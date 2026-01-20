#!/bin/bash

# 生产环境诊断脚本
# 用于检查服务器状态和部署配置
#
# 使用方法:
#   bash scripts/diagnose.sh

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
echo "生产环境诊断工具"
echo "================================================"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "工作目录: $PROJECT_ROOT"
echo "================================================"
echo ""

# 检查端口占用
echo -e "${BLUE}[1/10]${NC} 检查端口 5000 是否被占用..."
if ss -tuln 2>/dev/null | grep -q ":5000[[:space:]]"; then
    echo -e "${GREEN}✓${NC} 端口 5000 正在监听"
    ss -lptn "sport = :5000" 2>/dev/null || echo "  无法获取详细信息"
else
    echo -e "${RED}✗${NC} 端口 5000 未被占用"
fi
echo ""

# 检查进程
echo -e "${BLUE}[2/10]${NC} 检查运行中的 Node.js 进程..."
echo "Node.js 进程列表:"
ps aux | grep -E "node.*vite|node.*server\.mjs" | grep -v grep || echo "  没有找到相关进程"

# 检查是否运行了 Vite
if pgrep -f "node.*vite" > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} 检测到 Vite 开发服务器正在运行"
else
    echo -e "${GREEN}✓${NC} 未检测到 Vite 开发服务器"
fi

# 检查是否运行了 server.mjs
if pgrep -f "node.*server\.mjs" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 检测到 server.mjs 正在运行"
else
    echo -e "${RED}✗${NC} 未检测到 server.mjs"
fi
echo ""

# 检查环境变量
echo -e "${BLUE}[3/10]${NC} 检查环境变量..."
echo "NODE_ENV: ${NODE_ENV:-<未设置>}"
echo "PORT: ${PORT:-<未设置>}"

if [ "$NODE_ENV" = "production" ]; then
    echo -e "${GREEN}✓${NC} NODE_ENV 设置为 production"
else
    echo -e "${YELLOW}⚠${NC} NODE_ENV 未设置为 production"
fi
echo ""

# 检查文件存在性
echo -e "${BLUE}[4/10]${NC} 检查关键文件..."
if [ -f "server.mjs" ]; then
    echo -e "${GREEN}✓${NC} server.mjs 存在"
else
    echo -e "${RED}✗${NC} server.mjs 不存在"
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json 存在"
else
    echo -e "${RED}✗${NC} package.json 不存在"
fi

if [ -f ".coze" ]; then
    echo -e "${GREEN}✓${NC} .coze 存在"
else
    echo -e "${RED}✗${NC} .coze 不存在"
fi
echo ""

# 检查 dist 目录
echo -e "${BLUE}[5/10]${NC} 检查构建产物..."
if [ -d "dist" ]; then
    echo -e "${GREEN}✓${NC} dist 目录存在"
    echo "  文件数量: $(find dist -type f | wc -l)"
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓${NC} index.html 存在"
    else
        echo -e "${RED}✗${NC} index.html 不存在"
    fi
else
    echo -e "${RED}✗${NC} dist 目录不存在"
fi
echo ""

# 检查数据文件
echo -e "${BLUE}[6/10]${NC} 检查数据文件..."
if [ -d "data" ]; then
    echo -e "${GREEN}✓${NC} data 目录存在"
    if [ -f "data/project-data.json" ]; then
        echo -e "${GREEN}✓${NC} project-data.json 存在"
        echo "  文件大小: $(du -h data/project-data.json | cut -f1)"
    else
        echo -e "${YELLOW}⚠${NC} project-data.json 不存在（首次运行会自动创建）"
    fi
else
    echo -e "${YELLOW}⚠${NC} data 目录不存在（首次运行会自动创建）"
fi
echo ""

# 检查启动脚本
echo -e "${BLUE}[7/10]${NC} 检查启动脚本..."
if [ -f "scripts/start.sh" ]; then
    echo -e "${GREEN}✓${NC} scripts/start.sh 存在"
    if [ -x "scripts/start.sh" ]; then
        echo -e "${GREEN}✓${NC} scripts/start.sh 可执行"
    else
        echo -e "${YELLOW}⚠${NC} scripts/start.sh 不可执行"
    fi
else
    echo -e "${RED}✗${NC} scripts/start.sh 不存在"
fi
echo ""

# 检查 .coze 配置
echo -e "${BLUE}[8/10]${NC} 检查 .coze 配置..."
if [ -f ".coze" ]; then
    echo "部署配置:"
    grep -A 2 '\[deploy\]' .coze || echo "  未找到 deploy 配置"
    echo ""
else
    echo -e "${RED}✗${NC} .coze 文件不存在"
fi
echo ""

# 测试 API 健康检查
echo -e "${BLUE}[9/10]${NC} 测试 API 端点..."
if command -v curl > /dev/null 2>&1; then
    echo "测试 GET /api/data:"
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:5000/api/data 2>/dev/null || echo "HTTP_CODE:000")
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    echo "  HTTP 状态码: $http_code"
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} API 正常响应"
    else
        echo -e "${RED}✗${NC} API 响应异常"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl 不可用，跳过 API 测试"
fi
echo ""

# 检查日志
echo -e "${BLUE}[10/10]${NC} 检查日志文件..."
if [ -f "/tmp/server.log" ]; then
    echo -e "${GREEN}✓${NC} 服务器日志存在"
    echo "  最近 5 行:"
    tail -5 /tmp/server.log 2>/dev/null | sed 's/^/    /'
else
    echo -e "${YELLOW}⚠${NC} 服务器日志不存在"
fi
echo ""

# 诊断总结
echo "================================================"
echo -e "${BLUE}诊断总结${NC}"
echo "================================================"

# 判断问题
HAS_VITE=false
HAS_SERVER=false
HAS_DIST=false

if pgrep -f "node.*vite" > /dev/null 2>&1; then
    HAS_VITE=true
fi

if pgrep -f "node.*server\.mjs" > /dev/null 2>&1; then
    HAS_SERVER=true
fi

if [ -d "dist" ]; then
    HAS_DIST=true
fi

# 诊断结果
if [ "$HAS_VITE" = true ] && [ "$HAS_SERVER" = false ]; then
    echo -e "${RED}❌ 问题检测：${NC}"
    echo "  生产环境正在运行 Vite 开发服务器，而不是 server.mjs"
    echo ""
    echo -e "${BLUE}解决方案：${NC}"
    echo "  1. 停止 Vite 进程："
    echo "     pkill -f 'node.*vite'"
    echo ""
    echo "  2. 启动生产服务器："
    echo "     NODE_ENV=production bash scripts/start.sh"
    echo ""
    echo "  3. 或者使用 PM2（推荐）："
    echo "     pnpm run pm2:start"
    echo ""
elif [ "$HAS_SERVER" = true ]; then
    echo -e "${GREEN}✓ 生产环境运行正常${NC}"
    echo "  server.mjs 正在运行"
else
    echo -e "${RED}❌ 问题检测：${NC}"
    echo "  没有找到运行中的服务器进程"
    echo ""
    echo -e "${BLUE}解决方案：${NC}"
    echo "  1. 检查 dist 目录是否存在："
    if [ "$HAS_DIST" = false ]; then
        echo "     缺少 dist 目录，需要先构建："
        echo "     pnpm run build"
    fi
    echo ""
    echo "  2. 启动生产服务器："
    echo "     NODE_ENV=production bash scripts/start.sh"
fi

echo ""
echo "================================================"
echo "诊断完成"
echo "================================================"
