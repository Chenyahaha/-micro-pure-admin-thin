<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

import { PageModal } from '@xingjia/ui';
import { useCrud } from './useCrud';
import { statusOptions } from './config';
import PurchasePlanForm from './form.vue';
import TableGroupHeader from '../components/TableGroupHeader/TableGroupHeader.vue';
import TableColumnConfigDrawer from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';
import { useColumnConfig } from '../components/TableColumnConfigDrawer/useColumnConfig';
import type { TableColumnOption } from '../components/TableColumnConfigDrawer/TableColumnConfigDrawer.vue';

const { tableData, filteredData, searchKeyword, searchStatus, modalVisible, modalMode, formData, handleAdd, handleEdit, handleDelete, handleSave } = useCrud();

const formRef = ref<InstanceType<typeof PurchasePlanForm>>();

function statusColor(status: string) {
    if (status === '待审批') return 'orange';
    if (status === '执行中') return 'arcoblue';
    return 'green';
}

function formatAmount(val: number) {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

const summary = computed(() => {
    const total = tableData.value.length;
    const pending = tableData.value.filter(r => r.status === '待审批').length;
    const executing = tableData.value.filter(r => r.status === '执行中').length;
    const totalBudget = tableData.value.reduce((sum, r) => sum + r.budget, 0);
    return { total, pending, executing, totalBudget };
});

async function onSave() {
    const errors = await formRef.value?.validate();
    if (errors) return;
    handleSave(formData.value);
}

const tableAreaRef = ref<HTMLElement>();
const tableScrollY = ref(400);
let resizeObserver: ResizeObserver | null = null;

const configurableColumns: TableColumnOption[] = [
    { key: 'no', label: '计划编号' },
    { key: 'dept', label: '申请部门' },
    { key: 'item', label: '采购项目' },
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

onMounted(() => {
    if (!tableAreaRef.value) return;
    resizeObserver = new ResizeObserver(entries => {
        const h = entries[0].contentRect.height;
        tableScrollY.value = Math.max(200, Math.floor(h - 120));
    });
    resizeObserver.observe(tableAreaRef.value);
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});
</script>

<template>
    <div class="page-container">
        <div class="page-header">
            <a-grid :cols="4" :col-gap="16" :row-gap="12" class="summary-cards">
                <a-grid-item>
                    <a-card :bordered="false" class="summary-card">
                        <a-statistic title="计划总数" :value="summary.total" :value-style="{ color: 'var(--color-text-1)' }" />
                    </a-card>
                </a-grid-item>
                <a-grid-item>
                    <a-card :bordered="false" class="summary-card">
                        <a-statistic title="待审批" :value="summary.pending" :value-style="{ color: 'rgb(var(--orange-6))' }" />
                    </a-card>
                </a-grid-item>
                <a-grid-item>
                    <a-card :bordered="false" class="summary-card">
                        <a-statistic title="执行中" :value="summary.executing" :value-style="{ color: 'rgb(var(--arcoblue-6))' }" />
                    </a-card>
                </a-grid-item>
                <a-grid-item>
                    <a-card :bordered="false" class="summary-card">
                        <a-statistic title="预算总额(元)" :value="summary.totalBudget" :precision="2" :value-style="{ color: 'rgb(var(--green-6))' }" />
                    </a-card>
                </a-grid-item>
            </a-grid>

            <a-card :bordered="false" class="search-card">
                <a-row :gutter="12" align="center">
                    <a-col :span="8">
                        <a-input-search v-model="searchKeyword" placeholder="搜索计划编号 / 采购项目 / 负责人" allow-clear />
                    </a-col>
                    <a-col :span="4">
                        <a-select v-model="searchStatus" :options="statusOptions" placeholder="状态筛选" allow-clear />
                    </a-col>
                    <a-col :span="12" style="text-align: right">
                        <a-space>
                            <TableColumnConfigDrawer ref="columnConfigRef" :options="configurableColumns" />
                            <a-button type="primary" @click="handleAdd">新建计划</a-button>
                        </a-space>
                    </a-col>
                </a-row>
            </a-card>
        </div>

        <div ref="tableAreaRef" class="table-area">
            <TableGroupHeader :groups="headerGroups" :columns="orderedVisibleColumns" />
            <a-table :data="filteredData" :scroll="{ y: tableScrollY }" :pagination="{ pageSize: 10, showTotal: true, showPageSize: true }" :bordered="{ cell: true }" stripe row-key="id">
                <template #columns>
                    <a-table-column
                        v-for="col in orderedVisibleColumns"
                        :key="col.key"
                        :title="col.label"
                        :data-index="col.key"
                        :width="
                            col.key === 'no'
                                ? 150
                                : col.key === 'dept'
                                  ? 100
                                  : col.key === 'item'
                                    ? 140
                                    : col.key === 'qty'
                                      ? 80
                                      : col.key === 'budget'
                                        ? 130
                                        : col.key === 'owner'
                                          ? 90
                                          : col.key === 'expectDate'
                                            ? 120
                                            : col.key === 'status'
                                              ? 100
                                              : undefined
                        "
                        :align="col.key === 'qty' ? 'center' : col.key === 'budget' ? 'right' : col.key === 'status' ? 'center' : undefined"
                        :fixed="col.fixed || undefined"
                    >
                        <template #cell="{ record }">
                            <span v-if="col.key === 'budget'" class="amount-text">{{ formatAmount(record.budget) }}</span>
                            <a-tag v-else-if="col.key === 'status'" :color="statusColor(record.status)" size="small">{{ record.status }}</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="140" align="center" fixed="right">
                        <template #cell="{ record }">
                            <a-space>
                                <a-link @click="handleEdit(record)">编辑</a-link>
                                <a-popconfirm content="确定删除此计划？" @ok="handleDelete(record)">
                                    <a-link status="danger">删除</a-link>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </a-table-column>
                </template>
            </a-table>
        </div>

        <PageModal v-model:visible="modalVisible" :title="modalMode === 'add' ? '新建采购计划' : '编辑采购计划'" :width="600" :mask="true" :mask-closable="true" :unmount-on-close="true">
            <PurchasePlanForm ref="formRef" :mode="modalMode" v-model="formData" />
            <template #footer>
                <a-space>
                    <a-button @click="modalVisible = false">取消</a-button>
                    <a-button type="primary" @click="onSave">确定</a-button>
                </a-space>
            </template>
        </PageModal>
    </div>
</template>

<style scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
}
.page-header {
    flex-shrink: 0;
    margin-bottom: 12px;
}
.summary-cards {
    margin-bottom: 12px;
}
.summary-card :deep(.arco-card-body) {
    padding: 16px 20px;
}
.search-card {
    border-radius: 8px;
}
.table-area {
    flex: 1;
    min-height: 0;
    background: var(--color-bg-2);
    border-radius: 8px;
    padding: 12px 16px;
}
.amount-text {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-1);
    font-weight: 500;
}

.table-area {
    position: relative;
}
</style>
