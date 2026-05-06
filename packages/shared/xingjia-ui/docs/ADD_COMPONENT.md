# 星伽 UI 新增组件教程

## 1）先确定组件归属模块

按功能放到不同目录，便于后续扩展与查找：

- `src/components/feedback`：反馈类（弹窗、通知、抽屉）
- `src/components/form`：表单类（输入、筛选、搜索）
- `src/components/data-display`：数据展示类（卡片、描述、统计）
- `src/components/navigation`：导航类（页签、面包屑、侧栏辅助）

> 没有对应目录就新建，保持命名语义清晰。

## 2）创建组件文件

示例：新增一个表单组件

- `src/components/form/XInputGroup.vue`

## 3）在 `src/index.ts` 导出组件

```ts
export { default as XInputGroup } from "./components/form/XInputGroup.vue"; // 命名导出，便于按需引入
```

如果希望支持插件全局注册，在同文件里追加：

```ts
app.component("XInputGroup", XInputGroup); // 全局注册组件名
```

## 4）处理样式

- 公共样式放到：`src/styles`
- 组件私有样式优先写在组件内部 `<style scoped>`

## 5）更新文档

- 更新 `README.md` 的组件列表
- 在 `docs/USAGE.md` 增加该组件的最小可用示例

## 6）最小验证

- 在任一业务页面引入并渲染新组件
- 确认在“直接复制模式”和“本地依赖模式”都可使用

## 7）推荐模板参考

建议优先参考现有模板组件：

- `PageModal.vue`：局部容器弹窗模板
