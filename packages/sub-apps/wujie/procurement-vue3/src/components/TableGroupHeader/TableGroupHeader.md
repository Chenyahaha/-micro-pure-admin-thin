# TableGroupHeader 表头分组标签

在表格表头顶部显示彩色分组线 + 标签，标识列分组关系。搭配 `useColumnConfig` 使用时，分组位置自动跟随列的显示/隐藏/排序变化，无需手动维护索引。

---

## 1. 基本用法（推荐）

搭配 `useColumnConfig` 使用，分组位置从 `orderedVisibleColumns` 自动推导：

**TypeScript 写法：**

```vue
<script setup lang="ts">
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
import type { TableColumnOption } from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';

const configurableColumns: TableColumnOption[] = [
  { key: 'no', label: '计划编号' },
  {
    groupKey: 'purchasePlan',
    label: '采购计划',
    color: '#005bf5',
    children: [
      { key: 'qty', label: '数量' },
      { key: 'budget', label: '预算(元)' }
    ]
  },
  { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
  <div style="position: relative">
    <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
    <a-table ...>
      <a-table-column
        v-for="col in orderedVisibleColumns"
        :key="col.key"
        :title="col.label"
        :data-index="col.key"
      />
    </a-table>
  </div>
</template>
```

**非 TypeScript 写法：**

```vue
<script setup>
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';

const configurableColumns = [
  { key: 'no', label: '计划编号' },
  {
    groupKey: 'purchasePlan',
    label: '采购计划',
    color: '#005bf5',
    children: [
      { key: 'qty', label: '数量' },
      { key: 'budget', label: '预算(元)' }
    ]
  },
  { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
  <div style="position: relative">
    <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
    <a-table ...>
      <a-table-column
        v-for="col in orderedVisibleColumns"
        :key="col.key"
        :title="col.label"
        :data-index="col.key"
      />
    </a-table>
  </div>
</template>
```

隐藏/显示/拖拽列后，分组线位置自动更新，无需手动干预。

> 组件内部使用了 `lang="ts"`，Vite 会自动编译，你的页面不需要写 `lang="ts"`。如果项目没有 `typescript` 依赖，执行 `npm install -D typescript` 即可。

---

## 2. Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `groups` | `GroupDef[]` | 是 | - | 分组定义数组 |
| `columns` | `VisibleColumn[]` | 否 | - | 当前可见列列表（从 `useColumnConfig` 的 `orderedVisibleColumns` 传入） |
| `leadingColumnCount` | `number` | 否 | `0` | 配置列之前的固定列数（如 checkbox 列 = 1） |

### GroupDef

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `groupKey` | `string` | 是 | 分组唯一标识，与 `TableColumnGroup.groupKey` 对应 |
| `label` | `string` | 是 | 标签文字，如 "采购计划" |
| `color` | `string` | 是 | 颜色值，如 "#005bf5"，同时应用于线和标签 |

---

## 3. leadingColumnCount 说明

当表格在配置列之前有固定列时（如 checkbox 列、展开列），需要通过 `leadingColumnCount` 告知组件偏移量：

```html
<!-- 表格有一个 checkbox 列在配置列之前 -->
<TableGroupHeader
  :groups="headerGroups"
  :columns="orderedVisibleColumns"
  :leading-column-count="1"
/>
```

如果不传此值且存在前置列，分组线位置会偏移。

---

## 4. 注意事项

1. 父容器必须设置 `position: relative`，组件通过向上查找最近的 `position: relative` 元素作为定位容器
2. 组件需放在 `<a-table>` 同级、同一个 `position: relative` 容器内
3. 传入 `columns` 后，组件根据 `groupKey` 匹配可见列，自动计算 th 索引，不再依赖硬编码位置
4. 组件自动监听横向滚动、容器尺寸变化、columns 变化，实时更新标签位置
5. 当某分组的所有子列都被隐藏时，该分组的标签和线也会自动隐藏

---

## 5. 复用到其他 Vue 3 项目

### 5.1 需要复制的文件

- `TableGroupHeader.vue`
- `TableGroupHeader.md`
- 如需分组功能，还需复制 `TableColumnConfigDrawer.vue` + `useColumnConfig.ts`

### 5.2 环境要求

组件内部使用了 `lang="ts"`，需要构建工具支持 TypeScript 编译。

**判断方式：** 查看目标项目 `package.json` 的 `devDependencies` 里是否有 `typescript`。

- **有** — 直接复制使用，无需额外操作
- **没有** — 执行以下命令安装（仅构建时依赖，不影响你写 JS）：

```bash
npm install -D typescript
```

Vite 原生支持 `.vue` 文件里的 `lang="ts"`，即使你项目其他文件都是 `.js`，也会自动编译。

### 5.3 非 TypeScript 项目的写法

如果你的页面不使用 TypeScript，只需去掉 `import type` 和类型标注即可，组件本身不需要改动：

```vue
<script setup>
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';

// 不需要 import type，不需要 : TableColumnOption[] 类型标注
const configurableColumns = [
  { key: 'no', label: '计划编号' },
  {
    groupKey: 'purchasePlan',
    label: '采购计划',
    color: '#005bf5',
    children: [
      { key: 'qty', label: '数量' },
      { key: 'budget', label: '预算(元)' }
    ]
  },
  { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
  <div style="position: relative">
    <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
    <a-table ...>
      <a-table-column
        v-for="col in orderedVisibleColumns"
        :key="col.key"
        :title="col.label"
        :data-index="col.key"
      />
    </a-table>
  </div>
</template>
```

### 5.4 依赖

- Vue 3（`<script setup>`）
- Arco Design Vue（`a-table` 组件）
