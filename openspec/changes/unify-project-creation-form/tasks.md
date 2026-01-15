# 任务分解：统一新建项目表单

## 任务列表

### 任务 1：修改 ProjectEditModal 组件接口

**描述**：为 ProjectEditModal 添加可选的 `onProjectCreated` 回调属性，用于在创建新项目成功后触发回调。

**文件**：`src/components/ProjectEditModal/index.tsx`

**具体步骤**：
1. 在 `ProjectEditModalProps` 接口中添加 `onProjectCreated?: (project: Project) => void` 属性
2. 在 `handleOk` 方法中，当创建新项目成功后（`isEditMode` 为 false），调用 `onProjectCreated(newProject)`
3. 确保回调是可选的，不传递时行为不变

**验证方法**：
- ✅ 组件可以正常编译，没有 TypeScript 错误
- ✅ 现有的 ProjectManagement 页面"新建项目"功能不受影响
- ✅ 当传递 `onProjectCreated` 回调时，创建项目后会正确触发

---

### 任务 2：修改 SmartParser 组件 - 移除简化模态框

**描述**：移除 SmartParser 中的简化新建项目模态框相关代码。

**文件**：`src/components/SmartParser/index.tsx`

**具体步骤**：
1. 移除以下状态变量：
   - `newProjectModalVisible`
   - `newProjectName`
   - `newProjectDescription`
2. 移除简化的新建项目模态框（第 413-460 行）
3. 移除 `isNewProjectMode` 相关逻辑（因为不再需要区分新建项目和导入到现有项目）
4. 简化 `handleConfirmImport` 方法，移除新建项目的分支逻辑

**验证方法**：
- ✅ 组件可以正常编译，没有 TypeScript 错误
- ✅ 移除的代码不会影响其他功能

---

### 任务 3：修改 SmartParser 组件 - 集成 ProjectEditModal

**描述**：在 SmartParser 中使用 ProjectEditModal 组件替代简化的模态框。

**文件**：`src/components/SmartParser/index.tsx`

**具体步骤**：
1. 导入 `ProjectEditModal` 组件
2. 添加状态：
   - `editModalVisible`：控制 ProjectEditModal 的显示
   - `editingProject`：当前编辑的项目（新建时为 null）
3. 修改"新建项目"按钮的点击事件，打开 ProjectEditModal
4. 添加 `handleProjectCreated` 回调方法：
   - 接收新创建的项目对象
   - 将解析的任务导入到新项目
   - 显示成功消息
   - 关闭模态框并清空解析结果
5. 在组件底部渲染 ProjectEditModal

**验证方法**：
- ✅ 点击"新建项目"按钮时，弹出完整的项目表单
- ✅ 用户可以在表单中填写所有项目信息
- ✅ 点击"保存"后，成功创建项目并自动导入解析的任务
- ✅ 创建的项目包含用户填写的完整信息

---

### 任务 4：更新 SmartParser 的导入确认逻辑

**描述**：简化导入确认逻辑，因为不再需要区分新建项目和导入到现有项目。

**文件**：`src/components/SmartParser/index.tsx`

**具体步骤**：
1. 修改导入确认模态框，移除"新建项目"相关的显示逻辑
2. 只保留"导入到现有项目"的选项
3. 或者，完全移除导入确认模态框，直接在"导入甘特图"按钮点击时弹出项目选择器

**验证方法**：
- ✅ 导入到现有项目的功能正常工作
- ✅ 用户可以选择目标项目并导入任务

---

### 任务 5：测试验证

**描述**：全面测试新建项目并导入任务的完整流程。

**测试场景**：

1. **场景 1：SmartParser 新建项目并导入任务**
   - 在 SmartParser 页面输入排期文本
   - 点击"解析"按钮
   - 点击"新建项目"按钮
   - 填写完整的项目信息（名称、负责人、产品经理、PMO、团队成员、日期等）
   - 点击"保存"
   - 验证：项目创建成功，任务导入成功，项目信息完整

2. **场景 2：SmartParser 导入到现有项目**
   - 在 SmartParser 页面输入排期文本
   - 点击"解析"按钮
   - 点击"导入甘特图"按钮
   - 选择现有项目
   - 点击"确认导入"
   - 验证：任务成功导入到选定的项目

3. **场景 3：ProjectManagement 新建项目**
   - 在 ProjectManagement 页面点击"新建项目"按钮
   - 填写项目信息
   - 点击"保存"
   - 验证：项目创建成功，功能不受影响

4. **场景 4：表单验证**
   - 在 SmartParser 新建项目时，不填写项目名称
   - 点击"保存"
   - 验证：显示必填字段错误提示

5. **场景 5：取消操作**
   - 在 SmartParser 新建项目时，填写部分信息
   - 点击"取消"
   - 验证：模态框关闭，不创建项目，不导入任务

**验证方法**：
- ✅ 所有测试场景通过
- ✅ 没有控制台错误
- ✅ 用户体验流畅

---

## 任务优先级

- **高优先级**：任务 1、2、3（核心功能实现）
- **中优先级**：任务 4（优化导入流程）
- **高优先级**：任务 5（测试验证）

## 预计时间

- 任务 1：30 分钟
- 任务 2：20 分钟
- 任务 3：40 分钟
- 任务 4：20 分钟
- 任务 5：30 分钟
- **总计**：约 2 小时