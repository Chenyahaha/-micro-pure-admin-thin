<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { PageModal } from "@xingjia/ui";
import { useCrud } from "./useCrud";
import { statusOptions } from "./config";
import SupplierForm from "./form.vue";

const {
  tableData,
  filteredData,
  searchKeyword,
  searchStatus,
  modalVisible,
  modalMode,
  formData,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSave,
} = useCrud();

const formRef = ref<InstanceType<typeof SupplierForm>>();

function levelColor(level: string) {
  if (level === "A") return "green";
  if (level === "B") return "arcoblue";
  return "orange";
}

function statusColor(status: string) {
  if (status === "合作中") return "green";
  if (status === "观察期") return "orange";
  return "red";
}

const summary = computed(() => {
  const total = tableData.value.length;
  const cooperating = tableData.value.filter((r) => r.status === "合作中").length;
  const observing = tableData.value.filter((r) => r.status === "观察期").length;
  const levelA = tableData.value.filter((r) => r.level === "A").length;
  return { total, cooperating, observing, levelA };
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
      <a-grid :cols="4" :col-gap="16" :row-gap="12" class="summary-cards">
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="供应商总数" :value="summary.total" :value-style="{ color: 'var(--color-text-1)' }" />
          </a-card>
        </a-grid-item>
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="合作中" :value="summary.cooperating" :value-style="{ color: 'rgb(var(--green-6))' }" />
          </a-card>
        </a-grid-item>
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="观察期" :value="summary.observing" :value-style="{ color: 'rgb(var(--orange-6))' }" />
          </a-card>
        </a-grid-item>
        <a-grid-item>
          <a-card :bordered="false" class="summary-card">
            <a-statistic title="A级供应商" :value="summary.levelA" :value-style="{ color: 'rgb(var(--arcoblue-6))' }" />
          </a-card>
        </a-grid-item>
      </a-grid>

      <a-card :bordered="false" class="search-card">
        <a-row :gutter="12" align="center">
          <a-col :span="8">
            <a-input-search v-model="searchKeyword" placeholder="搜索编码 / 名称 / 联系人" allow-clear />
          </a-col>
          <a-col :span="4">
            <a-select v-model="searchStatus" :options="statusOptions" placeholder="状态筛选" allow-clear />
          </a-col>
          <a-col :span="12" style="text-align: right">
            <a-button type="primary" @click="handleAdd">新增供应商</a-button>
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
          <a-table-column title="供应商编码" data-index="code" :width="120" />
          <a-table-column title="供应商名称" data-index="name" :width="130" />
          <a-table-column title="等级" :width="80" align="center">
            <template #cell="{ record }">
              <a-tag :color="levelColor(record.level)" size="small">{{ record.level }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="品类" data-index="category" :width="110" />
          <a-table-column title="联系人" data-index="contact" :width="90" />
          <a-table-column title="联系电话" data-index="phone" :width="130" />
          <a-table-column title="合作年限" :width="100" align="center">
            <template #cell="{ record }">{{ record.coopYears }} 年</template>
          </a-table-column>
          <a-table-column title="状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag :color="statusColor(record.status)" size="small">{{ record.status }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="140" align="center" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-link @click="handleEdit(record)">编辑</a-link>
                <a-popconfirm content="确定删除此供应商？" @ok="handleDelete(record)">
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
      :title="modalMode === 'add' ? '新增供应商' : '编辑供应商'"
      :width="600"
      :mask="true"
      :mask-closable="true"
      :unmount-on-close="true"
    >
      <SupplierForm ref="formRef" :mode="modalMode" v-model="formData" />
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
</style>
