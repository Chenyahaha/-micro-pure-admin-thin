# TableColumnConfigDrawer 使用文档

`TableColumnConfigDrawer` 是一个通用的表格列配置组件，支持：

- 列显示/隐藏
- 已选列拖拽排序
- 列固定（左侧/右侧）
- 恢复默认配置
- 点击确定后统一应用配置

组件文件：`TableColumnConfigDrawer.vue`
组合函数：`useColumnConfig.ts`

---

## 1. 依赖前提

当前组件基于以下技术栈：

- Vue 3 (`<script setup lang="ts">`)
- Arco Design Vue 组件与图标

请确保项目已安装并正确引入 Arco 样式。

---

## 2. 快速接入

### 2.1 最简用法（推荐）

通过 `useColumnConfig` 组合函数，只需定义列 + 一行调用即可：

```vue
<script setup lang="ts">
import TableColumnConfigDrawer from './TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from './TableColumnConfigDrawer/useColumnConfig';

const configurableColumns = [
  { key: 'no', label: '计划编号' },
  { key: 'dept', label: '申请部门' },
  { key: 'qty', label: '数量' },
  { key: 'amount', label: '金额' },
  { key: 'status', label: '状态' }
];

// 一行搞定 ref + orderedVisibleColumns
const { columnConfigRef, orderedVisibleColumns } = useColumnConfig(configurableColumns);
</script>

<template>
  <!-- 放在工具栏合适位置 -->
  <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />

  <!-- 表格列按 orderedVisibleColumns 渲染 -->
  <a-table-column
    v-for="col in orderedVisibleColumns"
    :key="col.key"
    :title="col.label"
    :data-index="col.key"
    :fixed="col.fixed || undefined"
  />
</template>
```

`useColumnConfig` 返回值：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `columnConfigRef` | `Ref<InstanceType<typeof TableColumnConfigDrawer>>` | 绑定到组件的模板 ref |
| `orderedVisibleColumns` | `ComputedRef<(TableColumnOption & { fixed?: 'left' \| 'right' })[]>` | 当前可见且排好序的列列表 |

### 2.2 数据结构

`TableColumnOption`（列定义）：

```ts
interface TableColumnOption {
  key: string;       // 列唯一标识
  label: string;     // 列显示名称
  disabled?: boolean; // 是否禁用勾选（可选）
}
```

`orderedVisibleColumns` 中每项的扩展类型：

```ts
interface VisibleColumn extends TableColumnOption {
  fixed?: 'left' | 'right';  // 不设置或 undefined 表示不固定
}
```

---

## 3. Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `options` | `TableColumnOption[]` | 是 | - | 可配置列项 |
| `title` | `string` | 否 | `列配置` | 抽屉标题 |
| `triggerText` | `string` | 否 | `列配置` | 触发按钮文字 |
| `width` | `number` | 否 | `700` | 抽屉宽度 |

---

## 4. 固定列交互说明

在"已选列"列表中，每项右侧有一个图钉按钮：

- 点击一次：固定到左侧（显示蓝色左边框 + "左" 标签）
- 再点一次：切换为固定到右侧（显示绿色右边框 + "右" 标签）
- 再点一次：取消固定

固定状态通过 `orderedVisibleColumns` 中的 `fixed` 字段传递，绑定到 `<a-table-column :fixed="col.fixed">` 即可生效。

---

## 5. 推荐实践

- `options` 的 `key` 要稳定且唯一，不要用会变化的值。
- 若页面存在"合并单元格"，列数相关逻辑需要跟随可见列动态计算（如 `tableColumnCount = orderedVisibleColumns.length + 固定列数`）。

---

## 6. 常见问题

### Q1：隐藏生效了，但拖拽排序不生效？

通常是因为表格列仍按原始 `configurableColumns` 顺序渲染，请改为按 `orderedVisibleColumns` 顺序渲染。

### Q2：固定列不生效？

需要将 `col.fixed` 传给 `<a-table-column :fixed="col.fixed || undefined">`，否则 Arco Table 不知道哪些列需要固定。

### Q3：为什么最少要保留一列？

组件内部限制不能把所有业务列都隐藏，避免页面不可用。

---

## 7. 在其他项目复用

复制以下三个文件到目标项目同级目录：

- `TableColumnConfigDrawer.vue`
- `useColumnConfig.ts`
- `TableColumnConfigDrawer.md`

然后按"2.1 最简用法"进行使用。
