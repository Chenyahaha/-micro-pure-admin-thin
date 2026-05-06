<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { PageModal } from "@xingjia/ui";
import { useCrud } from "./useCrud";
import SupplierProductForm from "./form.vue";

const {
  tableData,
  filteredData,
  searchKeyword,
  modalVisible,
  modalMode,
  formData,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSave,
} = useCrud();

const formRef = ref<InstanceType<typeof SupplierProductForm>>();

function formatPrice(val: number) {
  return val.toLocaleString("zh-CN", { minimumFractionDigits: 2 });
}

const summary = computed(() => {
  const total = tableData.value.length;
  const supplierCount = new Set(tableData.value.map((r) => r.supplier)).size;
  const avgPrice = tableData.value.length
    ? tableData.value.reduce((sum, r) => sum + r.price, 0) / tableData.value.length
    : 0;
  return { total, supplierCount, avgPrice };
});

async function onSave() {
  const errors = await formRef.value?.validate();
  if (errors) return;
  handleSave(formData.value);
}

const tableAreaRef = ref<HTMLElement>();
const tableScrollY = ref(400);
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!tableAreaRef.value) return;
  resizeObserver = new ResizeObserver((entries) => {
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
      <a-grid :cols="3" :col-gap="16" :row-gap="12" class="summary-cards">
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="产品总数" :value="summary.total" :value-style="{ color: 'var(--color-text-1)' }" />
          </a-card>
        </a-grid-item>
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="供应商数量" :value="summary.supplierCount" :value-style="{ color: 'rgb(var(--arcoblue-6))' }" />
          </a-card>
        </a-grid-item>
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="平均供货价(元)" :value="summary.avgPrice" :precision="2" :value-style="{ color: 'rgb(var(--green-6))' }" />
          </a-card>
        </a-grid-item>
      </a-grid>

      <a-card :bordered="false" class="search-card">
        <a-row :gutter="12" align="center">
          <a-col :span="8">
            <a-input-search v-model="searchKeyword" placeholder="搜索 SKU / 产品名称 / 供应商" allow-clear />
          </a-col>
          <a-col :span="16" style="text-align: right">
            <a-button type="primary" @click="handleAdd">新增产品</a-button>
          </a-col>
        </a-row>
      </a-card>
    </div>

    <div ref="tableAreaRef" class="table-area">
      <a-table
        :data="filteredData"
        :scroll="{ y: tableScrollY }"
        :pagination="{ pageSize: 10, showTotal: true, showPageSize: true }"
        :bordered="false"
        stripe
        row-key="id"
      >
        <template #columns>
          <a-table-column title="SKU" data-index="sku" :width="110" />
          <a-table-column title="供应商" data-index="supplier" :width="120" />
          <a-table-column title="产品名称" data-index="product" :width="160" />
          <a-table-column title="最小起订量" data-index="moq" :width="110" align="center" />
          <a-table-column title="供货价(元)" :width="120" align="right">
            <template #cell="{ record }">
              <span class="amount-text">{{ formatPrice(record.price) }}</span>
            </template>
          </a-table-column>
          <a-table-column title="交期" data-index="leadTime" :width="90" align="center" />
          <a-table-column title="质检合格率" data-index="qualityRate" :width="110" align="center" />
          <a-table-column title="操作" :width="140" align="center" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-popconfirm content="确定删除此产品？" @ok="handleDelete(record)">
                  <a-link status="danger">删除</a-link>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <PageModal
      v-model:visible="modalVisible"
      :title="modalMode === 'add' ? '新增供应商产品' : '编辑供应商产品'"
      :width="600"
      :mask="true"
      :mask-closable="true"
      :unmount-on-close="true"
    >
      <SupplierProductForm ref="formRef" :mode="modalMode" v-model="formData" />
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
</style>
