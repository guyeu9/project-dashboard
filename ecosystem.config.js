/**
 * PM2 配置文件
 * 用于生产环境进程管理
 *
 * 功能：
 * - 自动重启崩溃的进程
 * - 日志管理和轮转
 * - 内存限制和监控
 * - 零停机重启
 *
 * 使用方法：
 * - 启动: npx pm2 start ecosystem.config.js
 * - 停止: npx pm2 stop project-schedule
 * - 重启: npx pm2 restart project-schedule
 * - 删除: npx pm2 delete project-schedule
 * - 查看日志: npx pm2 logs project-schedule
 * - 查看状态: npx pm2 status
 * - 监控: npx pm2 monit
 */

module.exports = {
  apps: [{
    name: 'project-schedule',           // 应用名称
    script: 'server.mjs',                // 启动脚本
    instances: 1,                        // 实例数量
    exec_mode: 'fork',                   // 执行模式：fork 或 cluster
    autorestart: true,                   // 自动重启
    watch: false,                        // 不监听文件变化（生产环境）
    max_memory_restart: '1G',            // 内存限制，超过自动重启
    
    // 环境变量
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // 日志配置
    error_file: '/tmp/pm2-project-schedule-error.log',
    out_file: '/tmp/pm2-project-schedule-out.log',
    log_file: '/tmp/pm2-project-schedule.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // 时间配置
    min_uptime: '10s',                   // 最小运行时间，低于此时间重启不算稳定
    max_restarts: 10,                    // 1分钟内最大重启次数
    restart_delay: 4000,                 // 重启延迟（毫秒）
    
    // 其他配置
    kill_timeout: 5000,                  // 强制关闭超时时间
    wait_ready: true,                    // 等待应用就绪
    listen_timeout: 10000,               // 启动超时时间
    
    // 健康检查（可选）
    health_check_grace_period: 3000,     // 健康检查宽限期
    
    // 高级配置
    exp_backoff_restart_delay: 100,      // 指数退避重启延迟
    disable_trace: false,                // 启用追踪
    instance_var: 'INSTANCE_ID',         // 实例变量
    
    // 守护进程配置
    pmx: true,                           // 启用 PMX 监控
    automation: false,                   // 禁用自动化
    treekill: true,                      // 杀死整个进程树
    windowsHide: true                    // Windows 下隐藏窗口
  }]
};
