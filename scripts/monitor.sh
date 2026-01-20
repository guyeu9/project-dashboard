#!/bin/bash

# 进程监控脚本
# 用于监控 server.mjs 进程，检测到进程停止时自动重启
#
# 使用方法：
#   - 手动运行: bash scripts/monitor.sh
#   - 定时任务: 添加到 crontab
#
# Crontab 配置示例（每分钟检查一次）：
#   * * * * * cd /path/to/project && bash scripts/monitor.sh >> /tmp/monitor.log 2>&1

set -e

# 配置
APP_NAME="project-schedule"
PORT=5000
MAX_RESTARTS=5          # 最大重启次数
RESTART_INTERVAL=60     # 重启间隔（秒）
LOG_FILE="/tmp/process-monitor.log"
PID_FILE="/tmp/${APP_NAME}.pid"
LOCK_FILE="/tmp/${APP_NAME}.monitor.lock"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否支持颜色输出
if [ -t 1 ]; then
    USE_COLOR=true
else
    USE_COLOR=false
fi

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 带颜色的日志函数（只在终端输出颜色）
log_info() {
    local msg="[INFO] $1"
    if [ "$USE_COLOR" = true ]; then
        echo "${GREEN}${msg}${NC}" | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${msg}" | tee -a "$LOG_FILE"
    fi
}

log_warn() {
    local msg="[WARN] $1"
    if [ "$USE_COLOR" = true ]; then
        echo "${YELLOW}${msg}${NC}" | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${msg}" | tee -a "$LOG_FILE"
    fi
}

log_error() {
    local msg="[ERROR] $1"
    if [ "$USE_COLOR" = true ]; then
        echo "${RED}${msg}${NC}" | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${msg}" | tee -a "$LOG_FILE"
    fi
}

log_success() {
    local msg="[SUCCESS] $1"
    if [ "$USE_COLOR" = true ]; then
        echo "${GREEN}${msg}${NC}" | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${msg}" | tee -a "$LOG_FILE"
    fi
}

# 检查锁文件，防止重复执行
check_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null)
        if ps -p "$lock_pid" > /dev/null 2>&1; then
            log "监控进程已在运行（PID: $lock_pid），退出"
            exit 0
        else
            log "清理过期锁文件"
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
}

# 清理函数
cleanup() {
    rm -f "$LOCK_FILE"
}

# 退出时清理
trap cleanup EXIT

# 检查锁文件
check_lock

log "=========================================="
log "开始监控进程"
log "=========================================="

# 检查进程是否运行
check_process() {
    # 方法1：检查端口
    if ss -tuln 2>/dev/null | grep -q ":${PORT}[[:space:]]" | grep -q LISTEN; then
        return 0
    fi
    
    # 方法2：检查进程名
    if pgrep -f "node.*server.mjs" > /dev/null 2>&1; then
        return 0
    fi
    
    return 1
}

# 获取进程 PID
get_process_pid() {
    # 优先使用端口号查找
    local pid=$(ss -lptn "sport = :${PORT}" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2)
    if [ -n "$pid" ]; then
        echo "$pid"
        return
    fi
    
    # 如果没找到，使用进程名查找
    pgrep -f "node.*server.mjs" | head -n 1
}

# 检查进程健康状态
check_health() {
    local url="http://localhost:${PORT}/api/data"
    
    # 发送健康检查请求
    if command -v curl > /dev/null 2>&1; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5 || echo "000")
        if [ "$status_code" = "200" ]; then
            log "健康检查通过（HTTP $status_code）"
            return 0
        else
            log_warn "健康检查失败（HTTP $status_code）"
            return 1
        fi
    else
        log_warn "curl 不可用，跳过健康检查"
        return 0
    fi
}

# 启动进程
start_process() {
    log "启动进程: node server.mjs"
    
    # 检查文件是否存在
    if [ ! -f "server.mjs" ]; then
        log_error "server.mjs 文件不存在"
        return 1
    fi
    
    # 检查 dist 目录
    if [ ! -d "dist" ]; then
        log_warn "dist 目录不存在，尝试构建..."
        pnpm run build || {
            log_error "构建失败"
            return 1
        }
    fi
    
    # 后台启动进程
    nohup node server.mjs > /tmp/server.log 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$PID_FILE"
    
    log "进程已启动（PID: $new_pid）"
    
    # 等待进程启动
    sleep 5
    
    # 检查是否成功启动
    if check_process; then
        log_success "进程启动成功"
        return 0
    else
        log_error "进程启动失败"
        return 1
    fi
}

# 检查重启频率
check_restart_rate() {
    if [ -f "$PID_FILE.restart_count" ]; then
        local count=$(cat "$PID_FILE.restart_count" 2>/dev/null || echo "0")
        local last_time=$(cat "$PID_FILE.restart_time" 2>/dev/null || echo "0")
        local current_time=$(date +%s)
        local time_diff=$((current_time - last_time))
        
        # 如果距离上次重启超过 RESTART_INTERVAL，重置计数器
        if [ "$time_diff" -gt "$RESTART_INTERVAL" ]; then
            echo "1" > "$PID_FILE.restart_count"
            echo "$current_time" > "$PID_FILE.restart_time"
            log "重置重启计数器"
            return 0
        fi
        
        # 如果重启次数超过限制
        if [ "$count" -ge "$MAX_RESTARTS" ]; then
            log_error "重启次数超过限制（$MAX_RESTARTS），停止自动重启"
            return 1
        fi
        
        # 增加计数
        echo "$((count + 1))" > "$PID_FILE.restart_count"
        log "重启计数: $((count + 1))/$MAX_RESTARTS"
    else
        echo "1" > "$PID_FILE.restart_count"
        echo "$(date +%s)" > "$PID_FILE.restart_time"
    fi
    
    return 0
}

# 主监控逻辑
main() {
    if check_process; then
        local pid=$(get_process_pid)
        log_info "进程正常运行（PID: $pid)"
        
        # 可选：进行健康检查
        # if check_health; then
        #     log_info "服务健康状态良好"
        # else
        #     log_warn "服务健康检查失败，但进程仍在运行"
        # fi
    else
        log_warn "进程未运行，尝试重启"
        
        # 检查重启频率
        if check_restart_rate; then
            if start_process; then
                log_success "进程重启成功"
            else
                log_error "进程重启失败，请检查日志"
                return 1
            fi
        else
            log_error "重启频率过高，停止自动重启"
            return 1
        fi
    fi
    
    return 0
}

# 执行主逻辑
main
exit_code=$?

log "监控完成（退出码: $exit_code）"
log "=========================================="

exit $exit_code
