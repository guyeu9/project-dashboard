# Change: 创建项目全景甘特图功能

## Why
提供一个极简主义的项目联调排期可视化平台，专注于排期可视化与资源调度，帮助团队"按时上线"。当前需要一个多项目聚合的上帝视角，让管理层能够快速了解全公司项目状态。

## What Changes
- **新增** 项目全景仪表板，显示并行项目、延期风险、待开始等核心指标
- **新增** 聚合甘特图，以项目为单位展示时间轴和进度状态
- **新增** 项目状态筛选功能（开发联调、测试联调、上线）
- **新增** 可滑动日期甘特图，支持不同任务类型颜色显示
- **新增** 双击任务编辑功能，弹出任务修改页
- **新增** 北京时区红线标示当前日期
- **新增** 任务类型定义和颜色配置功能

## Impact
- **新增规格**: specs/dashboard/spec.md, specs/gantt/spec.md, specs/task-types/spec.md
- **新增组件**: ProjectDashboard, MasterGantt, TaskEditModal, TaskTypeManager
- **新增路由**: /dashboard, /project/:id, /resource-schedule
- **新增API**: /api/projects, /api/tasks, /api/task-types