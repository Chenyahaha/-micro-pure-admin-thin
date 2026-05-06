<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { PageModal } from '@xingjia/ui';
import { useCrud } from './useCrud';
import { payStatusOptions } from './config';
import PurchaseOrderForm from './form.vue';
import type { PurchaseOrderTableRow } from './data';
import { flattenBatches, sumQty, sumAmount } from './data';

const COL_COUNT = 13;

const { tableData, filteredBatches, searchKeyword, searchPayStatus, modalVisible, modalMode, formData, handleAdd, handleEditBatch, handleEditFromLine, handleDeleteBatch, handleDeleteLine, handleSave } = useCrud();

const formRef = ref<InstanceType<typeof PurchaseOrderForm>>();

/** 与参考页一致：顶部 Tab 按子行「订单状态」筛选批次 */
const statusTab = ref<'all' | '待审核' | '已下单' | '已入库'>('all');

const tabFilteredBatches = computed(() => {
    const list = filteredBatches.value;
    if (statusTab.value === 'all') return list;
    return list.filter(b => b.children.some(l => l.status === statusTab.value));
});

const currentPage = ref(1);
const pageSize = ref(10);

const pagedBatches = computed(() => {
    const list = tabFilteredBatches.value;
    const start = (currentPage.value - 1) * pageSize.value;
    return list.slice(start, start + pageSize.value);
});

const flatTableData = computed(() => flattenBatches(pagedBatches.value));

function spanMethod({ record, columnIndex }: { record: Record<string, unknown>; columnIndex: number }) {
    const r = record as unknown as PurchaseOrderTableRow;
    if (r.rowType === 'parent') {
        if (columnIndex === 0) return { rowspan: 1, colspan: COL_COUNT - 1 };
        if (columnIndex === COL_COUNT - 1) return { rowspan: 1, colspan: 1 };
        return { rowspan: 0, colspan: 0 };
    }
    return { rowspan: 1, colspan: 1 };
}

function statusColor(status: string) {
    if (status === '待审核') return 'orange';
    if (status === '已下单') return 'arcoblue';
    return 'green';
}

function payStatusColor(payStatus: string) {
    if (payStatus === '未付款') return 'red';
    if (payStatus === '部分付款') return 'orange';
    return 'green';
}

function formatAmount(val: number) {
    return '¥ ' + val.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
}

/** 指标：在当前关键词 + 付款 + Tab 条件下统计 */
const summary = computed(() => {
    const batches = tabFilteredBatches.value;
    const lines = batches.flatMap(b => b.children);
    const total = batches.length;
    const pending = lines.filter(r => r.status === '待审核').length;
    const ordered = lines.filter(r => r.status === '已下单').length;
    const received = lines.filter(r => r.status === '已入库').length;
    const totalAmount = lines.reduce((sum, r) => sum + r.amount, 0);
    return { total, pending, ordered, received, totalAmount };
});

/** 本页合计（仅当前分页内的子行） */
const pageSummary = computed(() => {
    const lines = pagedBatches.value.flatMap(b => b.children);
    const qty = lines.reduce((s, l) => s + l.qty, 0);
    const amount = lines.reduce((s, l) => s + l.amount, 0);
    return { qty, amount };
});

function rowClassName(record: unknown) {
    const r = record as PurchaseOrderTableRow;
    return r.rowType === 'parent' ? 'po-row-parent' : 'po-row-child';
}

async function onSave() {
    const errors = await formRef.value?.validate();
    if (errors) return;
    handleSave(formData.value);
}

watch(statusTab, () => {
    currentPage.value = 1;
});
watch([searchKeyword, searchPayStatus], () => {
    currentPage.value = 1;
});

const tableAreaRef = ref<HTMLElement>();
const tableScrollY = ref(400);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    if (!tableAreaRef.value) return;
    resizeObserver = new ResizeObserver(entries => {
        const h = entries[0].contentRect.height;
        tableScrollY.value = Math.max(200, Math.floor(h - 200));
    });
    resizeObserver.observe(tableAreaRef.value);
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});

function shortName(name: string) {
    return name?.trim()?.charAt(0) || '—';
}
</script>

<template>
    <div class="page-container">
        <div class="stat-bar">
            <div class="stat-item">
                <div class="stat-value">{{ summary.total }}</div>
                <div class="stat-label">采购批次数</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item stat-orange">
                <div class="stat-value">{{ summary.pending }}</div>
                <div class="stat-label">待审核（行）</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item stat-blue">
                <div class="stat-value">{{ summary.ordered }}</div>
                <div class="stat-label">已下单（行）</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item stat-green">
                <div class="stat-value">{{ summary.received }}</div>
                <div class="stat-label">已入库（行）</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item stat-green">
                <div class="stat-value">¥{{ summary.totalAmount.toLocaleString('zh-CN') }}</div>
                <div class="stat-label">明细金额合计</div>
            </div>
        </div>

        <div ref="tableAreaRef" class="table-card">
            <div class="tabs-wrap">
                <a-radio-group v-model="statusTab" type="button" class="status-tabs">
                    <a-radio value="all">全部</a-radio>
                    <a-radio value="待审核">待审核</a-radio>
                    <a-radio value="已下单">已下单</a-radio>
                    <a-radio value="已入库">已入库</a-radio>
                </a-radio-group>
            </div>

            <div class="table-toolbar">
                <a-space :size="12" wrap>
                    <a-input-search v-model="searchKeyword" placeholder="搜索批次号 / 供应商 / SKU / 产品名" allow-clear style="width: 260px" />
                    <a-select v-model="searchPayStatus" :options="payStatusOptions" placeholder="付款状态" allow-clear style="width: 120px" />
                </a-space>
                <a-button type="primary" @click="handleAdd">新增采购订单</a-button>
            </div>

            <div class="table-inner">
                <a-table :data="flatTableData" :scroll="{ x: 1380, y: tableScrollY }" :pagination="false" :bordered="{ cell: true }" :span-method="spanMethod" row-key="key" :row-class="rowClassName">
                    <template #columns>
                        <a-table-column :width="48" align="center" fixed="left">
                            <template #title></template>
                            <template #cell="{ record }">
                                <template v-if="record.rowType === 'parent'">
                                    <div class="parent-strip">
                                        <a-checkbox />
                                        <div class="parent-main">
                                            <a-link class="batch-link">批次号：{{ record.batch.batchNo }}</a-link>
                                            <span class="parent-meta">
                                                <a-avatar :size="24" class="creator-avatar">{{ shortName(record.batch.creator) }}</a-avatar>
                                                <span class="creator-name">{{ record.batch.creator }}</span>
                                            </span>
                                            <span class="parent-meta muted">{{ record.batch.createTime }}</span>
                                            <span class="parent-meta">
                                                合计数量：
                                                <b>{{ sumQty(record.batch) }}</b>
                                            </span>
                                            <span class="parent-meta">
                                                合计金额：
                                                <b class="amt">{{ formatAmount(sumAmount(record.batch)) }}</b>
                                            </span>
                                            <span v-if="record.batch.remark" class="parent-meta remark">备注：{{ record.batch.remark }}</span>
                                        </div>
                                    </div>
                                </template>
                                <a-checkbox v-else />
                            </template>
                        </a-table-column>

                        <a-table-column title="子单号" data-index="no" :width="200" fixed="left">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'" class="cell-strong">{{ record.line.no }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="图片" :width="72" align="center">
                            <template #cell="{ record }">
                                <div v-if="record.rowType === 'child'" class="thumb-wrap"></div>
                            </template>
                        </a-table-column>
                        <a-table-column title="SKU" :min-width="220">
                            <template #cell="{ record }">
                                <div v-if="record.rowType === 'child'" class="product-cell">
                                    <a-link class="sku-link">{{ record.line.sku }}</a-link>
                                </div>
                            </template>
                        </a-table-column>
                        <a-table-column title="产品" :min-width="220">
                            <template #cell="{ record }">
                                <div v-if="record.rowType === 'child'" class="product-cell">
                                    <div class="product-title">{{ record.line.productName }}</div>
                                </div>
                            </template>
                        </a-table-column>

                        <a-table-column title="店铺" data-index="store" :width="150">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'">{{ record.line.store || '—' }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="国家/地区" :width="100">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'">{{ record.line.country || '—' }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="仓库" data-index="warehouse" :width="112">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'">{{ record.line.warehouse }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="数量" :width="72" align="right">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'" class="num">{{ record.line.qty }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="金额" :width="150" align="right">
                            <template #cell="{ record }">
                                <span v-if="record.rowType === 'child'" class="cell-amount">{{ formatAmount(record.line.amount) }}</span>
                            </template>
                        </a-table-column>

                        <a-table-column title="订单状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="statusColor(record.line.status)" size="small">{{ record.line.status }}</a-tag>
                            </template>
                        </a-table-column>

                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="付款状态" :width="92" align="center">
                            <template #cell="{ record }">
                                <a-tag v-if="record.rowType === 'child'" :color="payStatusColor(record.line.payStatus)" size="small">{{ record.line.payStatus }}</a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="操作" :width="150" align="center" fixed="right">
                            <template #cell="{ record }">
                                <a-space v-if="record.rowType === 'parent'">
                                    <a-button type="text" size="mini" @click="handleEditBatch(record.batch)">编辑</a-button>
                                    <a-popconfirm content="确定删除整单及全部明细？" @ok="handleDeleteBatch(record.batch)">
                                        <a-button type="text" size="mini" status="danger">删除</a-button>
                                    </a-popconfirm>
                                </a-space>
                                <!-- <a-space v-else>
                                    <a-button type="text" size="mini" @click="handleEditFromLine(record.batch)">编辑</a-button>
                                    <a-popconfirm content="确定删除该明细行？" @ok="handleDeleteLine(record.batch, record.line)">
                                        <a-button type="text" size="mini" status="danger">删除</a-button>
                                    </a-popconfirm>
                                </a-space> -->
                            </template>
                        </a-table-column>
                    </template>
                </a-table>

                <div class="table-footer-bar">
                    <div class="footer-total">
                        <span class="total-label">本页合计</span>
                        <span class="total-item">
                            数量：
                            <b>{{ pageSummary.qty }}</b>
                        </span>
                        <span class="total-item">
                            金额：
                            <b>{{ formatAmount(pageSummary.amount) }}</b>
                        </span>
                    </div>
                    <a-pagination v-model:current="currentPage" v-model:page-size="pageSize" :total="tabFilteredBatches.length" show-total show-page-size class="pager" />
                </div>
            </div>
        </div>

        <PageModal v-model:visible="modalVisible" :title="modalMode === 'add' ? '新增采购订单' : '编辑采购订单'" :width="900" :height="500" :mask="true" :mask-closable="true" :unmount-on-close="true">
            <PurchaseOrderForm ref="formRef" :mode="modalMode" v-model="formData" />
            <template #footer>
                <a-space>
                    <a-button @click="modalVisible = false">取消</a-button>
                    <a-button type="primary" @click="onSave">保存</a-button>
                </a-space>
            </template>
        </PageModal>
    </div>
</template>

<style scoped>
/* ========== 页面最外层容器 ========== */
/* 控制整个页面的纵向弹性布局，撑满父级高度，子元素间距 12px */
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
    gap: 12px;
}

/* ========== 顶部统计栏 ========== */
/* 统计栏外框：横向排列，圆角卡片，带边框 */
.stat-bar {
    display: flex;
    align-items: center;
    background: var(--color-bg-2);
    border-radius: 8px;
    padding: 16px 24px;
    gap: 24px;
    flex-shrink: 0;
    border: 1px solid var(--color-border-2);
}

/* 统计项（如"采购批次数"）：数值在上，标签在下 */
.stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* 统计数值：大号粗体，等宽数字 */
.stat-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text-1);
    font-variant-numeric: tabular-nums;
}

/* 统计标签（如"采购批次数"文字）：小号灰色 */
.stat-label {
    font-size: 12px;
    color: var(--color-text-3);
    line-height: 1;
}

/* 待审核数值：橙色 */
.stat-orange .stat-value {
    color: rgb(var(--orange-6));
}

/* 已下单数值：蓝色 */
.stat-blue .stat-value {
    color: rgb(var(--arcoblue-6));
}

/* 已入库/金额合计数值：绿色 */
.stat-green .stat-value {
    color: rgb(var(--green-6));
}

/* 统计项之间的竖线分隔符 */
.stat-divider {
    width: 1px;
    height: 32px;
    background: var(--color-border-2);
    flex-shrink: 0;
}

/* ========== 表格卡片容器 ========== */
/* 包裹 Tab + 工具栏 + 表格 + 底栏的白色卡片，弹性撑满剩余高度 */
.table-card {
    flex: 1;
    min-height: 0;
    background: var(--color-bg-2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color-border-2);
}

/* ========== Tab 栏 ========== */
/* 状态 Tab 区域（全部/待审核/已下单/已入库），底部带分割线 */
.tabs-wrap {
    padding: 10px;
    flex-shrink: 0;
    border-bottom: 1px solid #e8e8e8;
    background: var(--color-bg-2);
}

/* Tab 按钮最小宽度，保证文字居中 */
.status-tabs :deep(.arco-radio-button) {
    min-width: 72px;
    text-align: center;
}

/* ========== 搜索工具栏 ========== */
/* 左侧搜索/筛选，右侧新增按钮，两端对齐 */
.table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    flex-shrink: 0;
    gap: 12px;
    flex-wrap: wrap;
}

/* ========== 表格内容区 ========== */
/* 包裹表格和底栏，弹性撑满，内部滚动 */
.table-inner {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0 8px 12px;
    overflow: hidden;
}

/* 表格整体去除圆角（在卡片内部） */
.table-inner :deep(.arco-table) {
    border-radius: 0;
}

/* 表头单元格：浅灰背景、粗体、边框色 */
.table-inner :deep(.arco-table-th) {
    background: #fafafa;
    font-weight: 600;
    font-size: 13px;
    color: var(--color-text-2);
    border-color: #e8e8e8 !important;
}

/* 所有数据单元格：字号、边框色、垂直居中 */
.table-inner :deep(.arco-table-td) {
    font-size: 13px;
    border-color: #e8e8e8 !important;
    vertical-align: middle;
}

/* ========== 父行/子行行级样式 ========== */
/* 父行（批次行）：浅蓝底色，上下内边距，底部分割线 */
.table-inner :deep(.po-row-parent .arco-table-td) {
    background: #f0f7fc !important;
    border-bottom: 1px solid #e8e8e8;
}

/* 子行（明细行）：白色背景 */
.table-inner :deep(.po-row-child .arco-table-td) {
    background: #ffffff !important;
}

/* ========== 父行内部布局 ========== */
/* 父行整条内容：横向排列，checkbox + 批次信息 */
.parent-strip {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

/* 父行批次信息区：弹性占满，内容可换行 */
.parent-main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 20px;
    line-height: 1.5;
}

/* 批次号链接：加粗，略大字号 */
.batch-link {
    font-weight: 600;
    font-size: 14px;
}

/* 父行元信息标签（创建人、时间、合计等）：行内弹性，小间距 */
.parent-meta {
    font-size: 13px;
    color: var(--color-text-1);
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* 父行次要信息（如时间）：灰色 */
.parent-meta.muted {
    color: var(--color-text-3);
}

/* 父行备注：最大宽度限制，超长省略 */
.parent-meta.remark {
    color: var(--color-text-2);
    max-width: 280px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 父行金额数值：等宽数字 */
.parent-meta .amt {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-1);
}

/* 创建人头像：蓝底蓝字 */
.creator-avatar {
    background: rgb(var(--arcoblue-2));
    color: rgb(var(--arcoblue-6));
    font-size: 12px;
}

/* 创建人姓名 */
.creator-name {
    font-size: 13px;
}

/* ========== 子行图片列 ========== */
/* 图片缩略图外层：居中 */
.thumb-wrap {
    display: flex;
    justify-content: center;
}

/* 图片缩略图：44x44，圆角，带边框 */
.thumb {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid #e8e8e8;
}

/* 图片占位符：灰白渐变底 */
.thumb-placeholder {
    background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
}

/* ========== 子行 SKU/产品列 ========== */
/* 产品信息单元格：纵向排列，SKU 和产品名上下 */
.product-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* 产品名称文字 */
.product-title {
    color: var(--color-text-1);
    line-height: 1.4;
}

/* SKU 链接：小字号 */
.sku-link {
    font-size: 12px;
}

/* ========== 子行通用样式 ========== */
/* 子单号：加粗 */
.cell-strong {
    font-weight: 600;
    color: var(--color-text-1);
}

/* 金额：等宽粗体 */
.cell-amount {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: var(--color-text-1);
}

/* 数量：等宽数字 */
.num {
    font-variant-numeric: tabular-nums;
}

/* ========== 表格底栏 ========== */
/* 底栏：左侧合计，右侧分页，顶部分割线 */
.table-footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 10px 8px 4px;
    border-top: 1px solid #e8e8e8;
    margin-top: 0;
    background: var(--color-bg-2);
}

/* 底栏合计信息：横向排列 */
.footer-total {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 13px;
    color: var(--color-text-2);
}

/* "本页合计"标签：加粗 */
.total-label {
    font-weight: 600;
    color: var(--color-text-1);
}

/* 合计数值：等宽数字，深色 */
.total-item b {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-1);
}

/* 分页器：推到右侧 */
.pager {
    margin-left: auto;
}
</style>
