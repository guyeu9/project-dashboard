# Project Context

## Purpose
本项目是一个企业级项目管理与交付效能看板，旨在通过可视化甘特图、智能数据解析和多维度的资源排期，帮助团队实时掌握项目进度、资源分布和潜在风险。

## Tech Stack
- **Frontend Framework**: React 18 (Functional Components + Hooks)
- **UI Component Library**: Ant Design 5.x
- **State Management**: Zustand
- **Date Handling**: Day.js
- **Styling**: CSS Modules + Global Variables
- **Build Tool**: Vite
- **Language**: TypeScript

## Project Conventions

### Code Style
- **Naming**: 
  - 组件使用 PascalCase (如 `MasterGantt`)
  - 函数、变量使用 camelCase
  - 常量使用 UPPER_SNAKE_CASE
- **Components**: 优先使用函数式组件和 Hooks
- **Formatting**: 使用标准 Prettier 配置

### Architecture Patterns
- **Store**: 使用 Zustand 进行全局状态管理 (位于 `src/store/`)
- **Components**: 
  - `src/components/`: 可复用的 UI 组件
  - `src/pages/`: 页面级容器
- **Modals**: 复杂的表单编辑逻辑封装在独立的 Modal 组件中
- **Data Flow**: 单向数据流，通过 Store 进行状态分发和更新

### Testing Strategy
- **Manual Testing**: 核心路径（项目创建、任务编辑、进度更新）的交互验证
- **Diagnostics**: 保持 TypeScript 零错误，及时处理 Linter 警告

## Domain Context
- **Project**: 包含基本信息、风险等级、任务列表。
- **Task**: 最小工作单元，具有起止日期、进度、状态和分配人员。
- **Risk Level**: 1 (低) 到 5 (高)，用于预警。
- **Status**: 待启动、进行中、已交付、已延期。

## Important Constraints
- **Responsiveness**: 甘特图必须支持水平滚动，并保持时间轴对齐。
- **Validation**: 遵循“最小化必填”原则，降低用户输入负担。
- **Performance**: 甘特图渲染需优化，避免大量任务时的卡顿。

## External Dependencies
- **Ant Design Icons**: 图标支持
- **Lucide React**: 辅助图标
