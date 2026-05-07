# TableGroupHeader 表头分组标签

在表格表头顶部显示彩色分组线 + 标签，用于标识列分组关系。

## 基本用法

```vue
<template>
    <div class="table-area" style="position: relative">
        <TableGroupHeader :groups="groups" />
        <a-table ... />
    </div>
</template>

<script setup>
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';

const groups = [
    { label: '采购计划', color: '#005bf5', fromTh: 3, toTh: 4 },
    { label: '采购单', color: '#f58718', fromTh: 5, toTh: 6 },
];
</script>
```

## Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| groups | `GroupDef[]` | 是 | 分组定义数组 |

### GroupDef

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| label | `string` | 是 | 标签文字，如 "采购计划" |
| color | `string` | 是 | 颜色值，如 "#005bf5"，同时应用于线和标签 |
| fromTh | `number` | 是 | 起始列索引（0-based） |
| toTh | `number` | 是 | 结束列索引（0-based，包含） |

## 注意事项

1. 父容器必须设置 `position: relative`，组件通过向上查找最近的 `position: relative` 元素作为定位容器
2. 组件需放在 `<a-table>` 同级、同一个 `position: relative` 容器内
3. `fromTh` / `toTh` 为 th 元素的索引（从 0 开始），不是列的 dataIndex
4. 组件自动监听横向滚动和容器尺寸变化，实时更新标签位置
