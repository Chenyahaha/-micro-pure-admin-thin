# TableColumnConfigDrawer 使用文档

表格列配置抽屉，支持列显示/隐藏、拖拽排序、列固定（左/右）、分组拖拽。

组件文件：`TableColumnConfigDrawer.vue`
组合函数：`useColumnConfig.ts`

---

## 1. 快速接入

### 1.0 导入说明

根据你的项目是否使用 TypeScript，有两种写法：

**TypeScript 项目（`<script setup lang="ts">`）**— 三行 import：

```ts
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
import type { TableColumnOption } from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
```

| 导入                      | 作用                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `TableColumnConfigDrawer` | 组件本身，用于在 `<template>` 中渲染 `<TableColumnConfigDrawer>` 标签                              |
| `useColumnConfig`         | 组合函数，一行调用拿到 `columnConfigRef`、`orderedVisibleColumns`、`headerGroups` 三个响应式数据   |
| `type TableColumnOption`  | TypeScript 类型定义，给 `configurableColumns` 加类型标注，提供编辑器检查和自动补全（编译后不存在） |

**非 TypeScript 项目（`<script setup>`）**— 去掉第三行 `import type`，不加类型标注：

```js
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
```

> 组件内部使用了 `lang="ts"`，Vite 会自动编译，你的页面不需要写 `lang="ts"`。如果项目没有 `typescript` 依赖，执行 `npm install -D typescript` 即可。

### 1.1 平面列（无分组）

**TypeScript 写法：**

```vue
<script setup lang="ts">
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
import type { TableColumnOption } from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';

const configurableColumns: TableColumnOption[] = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
    <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />

    <a-table-column v-for="col in orderedVisibleColumns" :key="col.key" :title="col.label" :data-index="col.key" :fixed="col.fixed || undefined" />
</template>
```

**非 TypeScript 写法：**

```vue
<script setup>
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';

const configurableColumns = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
    <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />

    <a-table-column v-for="col in orderedVisibleColumns" :key="col.key" :title="col.label" :data-index="col.key" :fixed="col.fixed || undefined" />
</template>
```

### 1.2 分组列（推荐搭配 TableGroupHeader）

将需要整组拖拽的列放入 `children`，即可实现组头拖拽时整组移动：

**TypeScript 写法：**

```vue
<script setup lang="ts">
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
import type { TableColumnOption } from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';

const configurableColumns: TableColumnOption[] = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
    {
        groupKey: 'purchasePlan',
        label: '采购计划',
        color: '#005bf5',
        children: [
            { key: 'qty', label: '数量' },
            { key: 'budget', label: '预算(元)' }
        ]
    },
    {
        groupKey: 'purchaseOrder',
        label: '采购单',
        color: '#f58718',
        children: [
            { key: 'owner', label: '负责人' },
            { key: 'expectDate', label: '期望到货' }
        ]
    },
    { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
    <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />

    <div style="position: relative">
        <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
        <a-table ...>
            <a-table-column v-for="col in orderedVisibleColumns" :key="col.key" :title="col.label" :data-index="col.key" :fixed="col.fixed || undefined" />
        </a-table>
    </div>
</template>
```

**非 TypeScript 写法：**

```vue
<script setup>
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';

const configurableColumns = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
    {
        groupKey: 'purchasePlan',
        label: '采购计划',
        color: '#005bf5',
        children: [
            { key: 'qty', label: '数量' },
            { key: 'budget', label: '预算(元)' }
        ]
    },
    {
        groupKey: 'purchaseOrder',
        label: '采购单',
        color: '#f58718',
        children: [
            { key: 'owner', label: '负责人' },
            { key: 'expectDate', label: '期望到货' }
        ]
    },
    { key: 'status', label: '状态' }
];

const { columnConfigRef, orderedVisibleColumns, headerGroups } = useColumnConfig(configurableColumns);
</script>

<template>
    <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />

    <div style="position: relative">
        <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
        <a-table ...>
            <a-table-column v-for="col in orderedVisibleColumns" :key="col.key" :title="col.label" :data-index="col.key" :fixed="col.fixed || undefined" />
        </a-table>
    </div>
</template>
```

如果表格有配置列之前的固定列（如 checkbox 列），需传 `leading-column-count`：

```html
<TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" :leading-column-count="1" />
```

---

## 2. 类型定义

### TableColumnItem（叶子列）

```ts
interface TableColumnItem {
    key: string;
    label: string;
    disabled?: boolean;
}
```

### TableColumnGroup（分组）

```ts
interface TableColumnGroup {
    groupKey: string; // 组唯一标识
    label: string; // 组名称（显示在组头 checkbox 和 TableGroupHeader 标签上）
    color: string; // 组颜色（用于 TableGroupHeader 线/标签渲染）
    children: TableColumnItem[]; // 组内子列
}
```

### TableColumnOption（联合类型）

```ts
type TableColumnOption = TableColumnItem | TableColumnGroup;
```

### VisibleColumn（输出类型）

```ts
interface VisibleColumn extends TableColumnItem {
    fixed?: 'left' | 'right';
    groupKey?: string; // 所属组标识（有值表示该列属于某个分组）
    groupLabel?: string; // 所属组名称
    groupColor?: string; // 所属组颜色
}
```

---

## 3. useColumnConfig 返回值

| 名称                    | 类型                                                                | 说明                                                   |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| `columnConfigRef`       | `Ref<InstanceType<typeof TableColumnConfigDrawer>>`                 | 绑定到组件的模板 ref                                   |
| `orderedVisibleColumns` | `ComputedRef<VisibleColumn[]>`                                      | 当前可见且排好序的列（平面列表，可直接 v-for）         |
| `headerGroups`          | `ComputedRef<{ groupKey: string; label: string; color: string }[]>` | 从 options 中提取的分组定义，直接传给 TableGroupHeader |

---

## 4. Props

| 名称          | 类型                  | 必填 | 默认值   | 说明                               |
| ------------- | --------------------- | ---- | -------- | ---------------------------------- |
| `options`     | `TableColumnOption[]` | 是   | -        | 可配置列项，支持平面列和分组列混合 |
| `title`       | `string`              | 否   | `列配置` | 抽屉标题                           |
| `triggerText` | `string`              | 否   | `列配置` | 触发按钮文字                       |
| `width`       | `number`              | 否   | `700`    | 抽屉宽度                           |

---

## 5. 分组交互说明

### 左侧"全部列"面板

- 分组显示为**组头 checkbox**（带颜色圆点）+ 缩进的子列 checkbox
- 勾选组头 → 整组全选；取消组头 → 整组全取消
- 部分子列选中时组头显示 indeterminate 状态

### 右侧"已选列"面板

- **组头行**：可拖拽、可固定，显示组名 + 颜色圆点 + 子列数量
- **子列行**：不可单独拖拽或固定，缩进显示在组头下方
- 拖拽组头 → 整组（含所有子列）一起移动
- 固定组头 → 整组一起固定到左/右侧

### 无分组列

行为与之前完全一致：可单独拖拽、可单独固定。

---

## 6. 固定列交互

点击图钉按钮循环切换：不固定 → 左侧 → 右侧 → 不固定。

- 分组列：点击组头的图钉，整组一起切换固定状态
- 平面列：点击单列的图钉，仅该列切换

---

## 7. 复用到其他 Vue 3 项目

### 7.1 需要复制的文件

- `TableColumnConfigDrawer.vue`
- `useColumnConfig.ts`
- `TableColumnConfigDrawer.md`

### 7.2 环境要求

组件内部使用了 `lang="ts"`，需要构建工具支持 TypeScript 编译。

**判断方式：** 查看目标项目 `package.json` 的 `devDependencies` 里是否有 `typescript`。

- **有** — 直接复制使用，无需额外操作
- **没有** — 执行以下命令安装（仅构建时依赖，不影响你写 JS）：

```bash
npm install -D typescript
```

Vite 原生支持 `.vue` 文件里的 `lang="ts"`，即使你项目其他文件都是 `.js`，也会自动编译。

### 7.3 非 TypeScript 项目的写法

如果你的页面不使用 TypeScript，只需去掉 `import type` 和类型标注即可，组件本身不需要改动：

```vue
<script setup>
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';

// 不需要 import type，不需要 : TableColumnOption[] 类型标注
const configurableColumns = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
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
```

### 7.4 依赖

- Vue 3（`<script setup>`）
- Arco Design Vue（`a-drawer`、`a-checkbox`、`a-button` 等组件 + 图标）
