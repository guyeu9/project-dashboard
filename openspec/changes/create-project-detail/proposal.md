# Change: 创建项目详情页功能

## Why
项目详情页是PM日常操作的主战场，需要提供智能甘特图与项目元数据卡片，方便跨部门协作时快速了解项目上下文，支持极速编辑模式提高操作效率。

## What Changes
- **新增** 项目元数据卡片，展示合作方、开发人员、测试人员、联调群链接等关键信息
- **新增** 执行甘特图，支持双击编辑和实时保存
- **新增** 任务列配置功能（任务名、负责人、状态、进度、当日进展）
- **新增** 修改历史记录功能，自动记录谁在何时修改了什么
- **新增** 项目详情页路由和导航功能

## Impact
- **新增规格**: specs/project-detail/spec.md, specs/task-management/spec.md
- **新增组件**: ProjectDetail, ProjectHeader, ExecutionGantt, TaskEditModal, HistoryTracker
- **新增路由**: /project/:id
- **新增API**: /api/projects/:id, /api/projects/:id/tasks, /api/tasks/:id/history