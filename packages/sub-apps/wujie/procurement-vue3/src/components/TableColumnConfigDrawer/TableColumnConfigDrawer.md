# TableColumnConfigDrawer 使用文档

`TableColumnConfigDrawer` 是一个通用的表格列配置组件，支持：

- 列显示/隐藏
- 已选列拖拽排序
- 列固定（左侧/右侧）
- 恢复默认配置
- 点击确定后统一应用配置

组件文件：`TableColumnConfigDrawer.vue`

---

## 1. 依赖前提

当前组件基于以下技术栈：

- Vue 3 (`<script setup lang="ts">`)
- Arco Design Vue 组件与图标

请确保项目已安装并正确引入 Arco 样式。

---

## 2. 快速接入

### 2.1 引入组件

```vue
<script setup lang="ts">
import { ref } from 'vue';
import TableColumnConfigDrawer from './TableColumnConfigDrawer/TableColumnConfigDrawer.vue';

const configurableColumns = [
  { key: 'no', label: '子单号' },
  { key: 'sku', label: 'SKU' },
  { key: 'productName', label: '产品' },
  { key: 'qty', label: '数量' },
  { key: 'amount', label: '金额' }
];

// 默认全部显示，顺序即初始表格顺序
const columnConfig = ref(configurableColumns.map(item => ({ key: item.key })));
</script>

<template>
  <TableColumnConfigDrawer
    v-model="columnConfig"
    :options="configurableColumns"
  />
</template>
```

### 2.2 数据结构

`modelValue` 的类型为 `ColumnConfigItem[]`：

```ts
interface ColumnConfigItem {
  key: string;
  fixed?: 'left' | 'right';  // 不设置或 undefined 表示不固定
}
```

### 2.3 表格按配置渲染（关键）

拖拽排序和固定列是否生效，取决于你是否按 `columnConfig` 渲染列。

```ts
const orderedVisibleColumns = computed(() =>
  columnConfig.value
    .map(item => {
      const col = configurableColumns.find(c => c.key === item.key);
      return col ? { ...col, fixed: item.fixed } : null;
    })
    .filter(Boolean)
);
```

在模板中绑定 `fixed`：

```html
<a-table-column
  v-for="col in orderedVisibleColumns"
  :key="col.key"
  :fixed="col.fixed || undefined"
  ...
/>
```

---

## 3. Props / Emits

### Props

| 名称 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `ColumnConfigItem[]` | 是 | - | 当前已选列配置（key、fixed、顺序） |
| `options` | `TableColumnOption[]` | 是 | - | 可配置列项 |
| `title` | `string` | 否 | `列配置` | 抽屉标题 |
| `triggerText` | `string` | 否 | `列配置` | 触发按钮文字 |
| `width` | `number` | 否 | `500` | 抽屉宽度 |

`TableColumnOption`：

```ts
interface TableColumnOption {
  key: string;
  label: string;
  disabled?: boolean;
}
```

`ColumnConfigItem`：

```ts
interface ColumnConfigItem {
  key: string;
  fixed?: 'left' | 'right';
}
```

### Emits

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `ColumnConfigItem[]` | 点击"确定"后回传最终列配置（含 fixed 和顺序） |

---

## 4. 固定列交互说明

在"已选列"列表中，每项右侧有一个图钉按钮：

- 点击一次：固定到左侧（显示蓝色左边框 + "左" 标签）
- 再点一次：切换为固定到右侧（显示绿色右边框 + "右" 标签）
- 再点一次：取消固定

固定状态会通过 `ColumnConfigItem.fixed` 传递给父组件，父组件需将其绑定到 `<a-table-column :fixed="col.fixed">` 上。

---

## 5. 推荐实践

- `options` 的 `key` 要稳定且唯一，不要用会变化的值。
- 建议把 `columnConfig` 持久化到本地（如 `localStorage`），提升用户体验。
- 若页面存在"合并单元格"，列数相关逻辑需要跟随可见列动态计算。

---

## 6. 常见问题

### Q1：隐藏生效了，但拖拽排序不生效？

通常是因为表格列仍按原始 `configurableColumns` 顺序渲染。
请改为按 `columnConfig` 顺序组装后再渲染（见 2.3）。

### Q2：固定列不生效？

需要将 `ColumnConfigItem.fixed` 传给 `<a-table-column :fixed="col.fixed">`，否则 Arco Table 不知道哪些列需要固定。

### Q3：为什么最少要保留一列？

组件内部限制 `draft` 不能为空，避免用户把所有业务列都隐藏后页面不可用。

---

## 7. 在其他项目复用

最简单方式：复制以下两个文件到目标项目同级目录：

- `TableColumnConfigDrawer.vue`
- `TableColumnConfigDrawer.md`

然后按"2. 快速接入"进行使用。
