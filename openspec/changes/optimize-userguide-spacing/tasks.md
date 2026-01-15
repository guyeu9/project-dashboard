# 优化使用说明页面间距任务分解

## 任务列表

### 1. 调整头部卡片与内容卡片之间的间距
- **描述**：修改`.guide-header-card`的`margin-bottom`属性，从24px减少到16px
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查头部卡片与下方内容卡片之间的间距是否为16px

### 2. 调整内容卡片之间的间距
- **描述**：修改`.guide-content`的`gap`属性，从24px减少到16px
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查各个内容卡片之间的间距是否为16px

### 3. 调整卡片内部Space组件的尺寸
- **描述**：将所有`Space`组件的`size`属性从`large`改为`middle`
- **文件**：`src/pages/UserGuide/index.tsx`
- **验证**：检查卡片内部各区块之间的间距是否减小

### 4. 减少功能区块的内边距
- **描述**：修改`.function-overview`、`.function-detail`、`.function-steps`、`.function-tips`、`.function-notes`的`padding`属性，从16px减少到12px
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查各个功能区块的内边距是否为12px

### 5. 减少区块header的底部外边距
- **描述**：修改`.overview-header`、`.detail-header`、`.steps-header`、`.tips-header`、`.notes-header`的`margin-bottom`属性，从16px/12px减少到12px/8px
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查各个区块header与内容之间的间距是否减小

### 6. 减少段落的底部外边距
- **描述**：修改`.guide-section p`的`margin-bottom`属性，从16px减少到12px
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查段落之间的间距是否为12px

### 7. 调整分隔线样式
- **描述**：为Divider组件添加自定义样式，减少其上下间距
- **文件**：`src/pages/UserGuide/index.css`
- **验证**：检查分隔线上下间距是否减小

## 验证方法
1. 打开使用说明页面，视觉检查页面布局是否更紧凑
2. 使用浏览器开发者工具测量各元素间距，确保符合设计要求
3. 在不同屏幕尺寸下测试，确保响应式设计正常
4. 检查页面可读性和视觉层次结构是否保持良好