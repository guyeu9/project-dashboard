# Change: 创建资源排期热力图功能

## Why
需要一个专门的资源视图来识别人员瓶颈和空闲资源，通过热力图形式直观展示每个人的任务堆积情况，帮助PM快速发现谁忙不过来、谁还有空档。

## What Changes
- **新增** 资源排期热力图页面，Y轴显示人员列表，X轴显示日期
- **新增** 任务堆积可视化，用数字或颜色深度表示并行任务数量
- **新增** 点击格子查看当天所有任务列表功能
- **新增** 侧边滑出面板展示任务详情
- **新增** 瓶颈识别算法，自动标红过载人员
- **新增** 资源排期导航菜单项

## Impact
- **新增规格**: specs/resource-schedule/spec.md, specs/bottleneck-detection/spec.md
- **新增组件**: ResourceHeatmap, TaskStackPanel, BottleneckIndicator
- **新增路由**: /resource-schedule
- **新增API**: /api/resources/schedule, /api/resources/bottlenecks