# UI 设计标准 - 高级质感设计方案 (Premium UI Specification)

## 核心复用原则

### 1. 颜色即状态/分类
- 赋予每一种颜色一个明确的含义
- 示例：
  - 蓝色渐变（#1890FF → #40A9FF）：激活状态 / 导航选中 / 并行项目
  - 橙色渐变（#FF7A45 → #FFB980）：延期/风险 / 警告
  - 绿色渐变（#52C41A → #95DE64）：待开始 / 计划

### 2. 数据中心化
- 最关键的数字指标占据卡片三分之一以上的面积
- 确保用户进入页面的第一眼焦点是核心数据
- 主要数字字体尺寸：38px，800 weight（Extra Bold）

### 3. 使用定制化渐变
- 避免使用 UI 库的默认渐变色
- 从品牌色的深色版本向浅色版本（或略微偏向另一色相）进行平滑渐变
- 渐变角度：
  - 侧边栏按钮：90度（水平渐变）
  - 数据卡片：135度（对角线渐变，更具动感）
- 渐变示例：
  ```css
  /* 侧边栏按钮 - 蓝色 */
  background: linear-gradient(90deg, #1890FF 0%, #40A9FF 100%);
  /* 数据卡片 - 并行项目 */
  background: linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);
  /* 数据卡片 - 延期/风险 */
  background: linear-gradient(135deg, #FF7A45 0%, #FFB980 100%);
  /* 数据卡片 - 待开始 */
  background: linear-gradient(135deg, #52C41A 0%, #95DE64 100%);
  ```

### 4. 一致的景深
- 所有卡片应用相同的 box-shadow 样式
- 所有激活状态的按钮应用相同的 box-shadow 样式
- 实现统一的“悬浮”界面效果
- 阴影样式：
  - 侧边栏激活项：`box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);`
  - 数据卡片：`box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1);`
  - 功能卡片：`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);`

## I. 卡片尺寸与布局优化 (Card Layout & Sizing)

### 元素与准则

| 元素 | 现有问题 | 高级质感优化方案 | 目的 |
| --- | --- | --- | --- |
| **卡片尺寸** | 卡片高度和宽度占据空间过多 | **减小卡片高度**约 15%~20%（推荐高度：140px） | 提升信息密度，避免空旷感 |
| **圆角** | 较大的圆角（约 12px） | **保持或略微减小圆角**：`border-radius: 10px;` | 保持柔和，但避免圆角过大带来的玩具感 |
| **内容对齐** | 数字和图标分散，缺乏明确的对齐关系 | **左对齐**：数字和标题全部靠左 | 提高扫描效率，更具专业文档感 |
| **图标位置** | 图标偏大，放置在卡片右下角 | **缩小图标**（20px），并放置在**核心数字的右侧/下方** | 使图标成为数据的辅助说明，而非独立的装饰元素 |
| **内边距** | 内边距过大（24px） | **减小内边距**（18px） | 提高信息密度，使卡片更紧凑 |

### 布局结构
1. **标题区域**
   - 字体大小：14px
   - 颜色：rgba(255, 255, 255, 0.8)（渐变背景）或 #666（白色背景）
   - 字体权重：500
   - 底部外边距：12px
   - 对齐方式：左对齐

2. **数据区域**
   - 主要数字：38px，800 weight，使用无衬线字体
   - 数据与图标的布局：使用 flex 布局，数据在左，图标在右，紧凑排列
   - 对齐方式：左对齐

3. **图标设计**
   - 图标尺寸：20px
   - 图标颜色：rgba(255, 255, 255, 0.8)（渐变背景）
   - 位置：与核心数字在同一行，右侧

## II. 颜色与渐变规范 (Color & Gradient)

### 元素与准则

| 元素 | 准则/参数 | 颜色代码示例 (深色 → 亮色) | 目的 |
| --- | --- | --- | --- |
| **底色背景** | **浅色背景** (推荐) | `#F4F6F9` 或 `#FFFFFF` | 保证卡片的高对比度和“浮”动感 |
| **卡片渐变 (并行)** | 活泼的蓝色 | `linear-gradient(135deg, #1890FF 0%, #40A9FF 100%);` | 强调稳定和专业，保持活泼感 |
| **卡片渐变 (风险)** | 活泼的橙色 | `linear-gradient(135deg, #FF7A45 0%, #FFB980 100%);` | 表达警告，保持活泼感 |
| **卡片渐变 (待开始)** | 活泼的绿色 | `linear-gradient(135deg, #52C41A 0%, #95DE64 100%);` | 强调健康和未来，保持活泼感 |
| **字体颜色** | 核心数据 | `color: #FFFFFF;` | 高对比度，确保易读性 |
| **标题/描述** | 辅助文字 | `color: rgba(255, 255, 255, 0.8);` | 略带透明度，提供层次感 |

## III. 字体与排版规范 (Typography)

### 元素与准则

| 元素 | 准则/参数 | 规范值 | 目的 |
| --- | --- | --- | --- |
| **核心数字 (XXL)** | 字号 & 字重 | `font-size: 38px`；`font-weight: 800` (Extra Bold) | 保持数据焦点，但尺寸更优雅 |
| **卡片标题 (S)** | 字号 & 字重 | `font-size: 14px`；`font-weight: 500` | 清晰描述，不抢数字风头 |
| **字体族** | 统一的现代无衬线体 | `"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif` | 现代、专业、清晰 |
| **对齐方式** | 内容对齐 | 左对齐 | 提高扫描效率，更具专业文档感 |

## IV. 光影与质感规范 (Shadow & Depth)

### 高级光影效果

#### 1. 柔和的外部阴影 (Soft Box-Shadow)
- 增加卡片与背景的景深
- 使用多层阴影，模拟真实世界的光照效果
- 代码示例：
  ```css
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05);
  ```

#### 2. 微妙的内阴影/光泽 (Subtle Inner Shadow)
- 模拟光照下的高光效果
- 在卡片顶部或左上角增加极浅色的内阴影
- 代码示例：
  ```css
  box-shadow: ... , inset 0 1px 0 rgba(255, 255, 255, 0.1);
  ```

#### 3. 图标背景优化
- 避免简单的圆圈
- 可以给图标的背景圆圈增加透明度较高的白色圆环
- 使图标在深色卡片上显得更具光泽和立体感

## V. 侧边栏按钮规范（激活状态）

### 元素与准则

| 元素 | 准则/参数 | CSS 代码参考 | 目的 |
| --- | --- | --- | --- |
| **容器背景** | 浅灰白 | `background-color: #F7F8FA;` | 保持界面干净，突出卡片和按钮。 |
| **圆角** | 统一圆角半径 | `border-radius: 8px;` | 柔和且专业。 |
| **激活状态渐变色** | 蓝色：线性渐变 | `linear-gradient(90deg, #1890FF 0%, #40A9FF 100%);` | 保持活泼感，增强视觉吸引力。 |
| **文字颜色** | 纯白 | `color: #FFFFFF;` | 与深色渐变形成最大、最清晰的对比。 |
| **图标颜色** | 纯白 | `color: #FFFFFF;` | 保持一致性。 |
| **阴影** | 柔和的景深阴影 | `box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);` | 使激活项“浮”起来，增加精致感。 |

## VI. 按钮设计规范

### 尺寸
- 标准按钮高度：36px
- 小型按钮高度：28px
- 大型按钮高度：44px
- 圆角：8px

### 样式
- 主按钮：使用渐变背景
- 次按钮：使用白色背景，带边框
- 悬停效果：轻微缩放（1.02倍）或阴影增强
- 点击效果：轻微凹陷（0.98倍缩放）

### 颜色
- 主按钮：紫色渐变（#6B3FA0 → #9A57D4）
- 警告按钮：深琥珀色渐变（#C25A2C → #F08D4D）
- 成功按钮：绿色渐变（#008B7B → #00C097）

## 实施示例

### 高级质感数据卡片示例
```tsx
// 活泼的蓝色卡片（并行项目）
<Card
  style={{
    background: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)', // 活泼的蓝色渐变
    borderRadius: '10px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
    border: 'none',
    overflow: 'hidden',
    padding: '18px', // 减小内边距
    position: 'relative',
    height: '140px' // 减小高度
  }}
>
  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
    并行项目
  </div>
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
    <Statistic
      value={metrics.parallelProjects}
      valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
    />
    <CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
  </div>
</Card>

// 活泼的橙色卡片（延期/风险）
<Card
  style={{
    background: 'linear-gradient(135deg, #FF7A45 0%, #FFB980 100%)', // 活泼的橙色渐变
    borderRadius: '10px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
    border: 'none',
    overflow: 'hidden',
    padding: '18px', // 减小内边距
    position: 'relative',
    height: '140px' // 减小高度
  }}
>
  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
    延期/风险
  </div>
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
    <Statistic
      value={metrics.delayedOrRisk}
      valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
    />
    <CloseCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
  </div>
</Card>

// 活泼的绿色卡片（待开始）
<Card
  style={{
    background: 'linear-gradient(135deg, #52C41A 0%, #95DE64 100%)', // 活泼的绿色渐变
    borderRadius: '10px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)', // 柔和的多层阴影+内阴影
    border: 'none',
    overflow: 'hidden',
    padding: '18px', // 减小内边距
    position: 'relative',
    height: '140px' // 减小高度
  }}
>
  <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', marginBottom: '12px', fontWeight: '500', textAlign: 'left' }}>
    待开始
  </div>
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
    <Statistic
      value={metrics.pendingProjects}
      valueStyle={{ color: '#fff', fontSize: '38px', fontWeight: '800', fontFamily: '"Inter", "HarmonyOS Sans", "SF Pro Display", sans-serif', textAlign: 'left' }}
    />
    <ClockCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '20px', alignSelf: 'flex-start', marginTop: '8px' }} />
  </div>
</Card>
```

### 侧边栏按钮（激活状态）示例
```css
.custom-vertical-menu .ant-menu-item-selected {
  background: linear-gradient(90deg, #1890FF 0%, #40A9FF 100%) !important;
  color: #FFFFFF !important;
  font-weight: 500 !important;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
  border-radius: 8px;
}
```

### 功能卡片示例
```tsx
<Card
  style={{
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
    padding: '16px'
  }}
>
  {/* 卡片内容 */}
</Card>
```

## 检查清单

在创建或修改卡片、按钮或侧边栏时，请检查以下项目：

- [ ] 侧边栏按钮激活状态是否使用正确的渐变和阴影
- [ ] 卡片圆角是否为 10px
- [ ] 卡片高度是否为 140px 左右
- [ ] 卡片内边距是否为 18px
- [ ] 卡片阴影是否为多层阴影（包含内阴影）
- [ ] 核心数据是否占据三分之一以上面积
- [ ] 核心数字字体是否为 38px，800 weight
- [ ] 颜色是否符合状态/分类定义
- [ ] 是否使用了定制化渐变（135度角度）
- [ ] 图标是否为 20px，位于核心数字右侧
- [ ] 整体布局是否遵循左对齐原则
- [ ] 字体族是否统一使用无衬线字体
- [ ] 文字颜色是否为 rgba(255, 255, 255, 0.8)（渐变背景）

## 高级质感设计公式

$$\text{Premium Card} = \text{Low-Saturation Deep Gradient} + \text{Reduced Height} + \text{Soft Multi-Layer Shadow} + \text{Strict Left Alignment}$$

## 维护说明

- 本设计标准应定期更新，以适应设计趋势和业务需求
- 所有新增侧边栏按钮、卡片和按钮必须遵循本标准
- 现有组件应逐步迁移至本标准
- 设计标准变更时，应通知所有相关开发人员