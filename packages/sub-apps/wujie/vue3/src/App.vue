<script setup lang="ts">
import { computed, ref } from "vue";

type Product = {
  id: string;
  name: string;
  category: string;
  status: "在售" | "草稿" | "停售";
  price: number;
  stock: number;
  manager: string;
  updatedAt: string;
  description: string;
};

const products = ref<Product[]>([
  {
    id: "P-1001",
    name: "无线降噪耳机 Pro",
    category: "数码配件",
    status: "在售",
    price: 899,
    stock: 126,
    manager: "张琳",
    updatedAt: "2026-04-29 17:30",
    description: "支持主动降噪、蓝牙5.3，续航 30 小时。",
  },
  {
    id: "P-1002",
    name: "商务双肩包 Lite",
    category: "箱包",
    status: "草稿",
    price: 269,
    stock: 0,
    manager: "王强",
    updatedAt: "2026-04-28 15:10",
    description: "主打轻量化和多仓位设计，适配 15.6 英寸笔记本。",
  },
  {
    id: "P-1003",
    name: "便携咖啡杯 450ml",
    category: "家居日用",
    status: "停售",
    price: 79,
    stock: 12,
    manager: "刘敏",
    updatedAt: "2026-04-27 10:25",
    description: "食品级 316 不锈钢内胆，保温 8 小时。",
  },
]);

const activeId = ref(products.value[0].id);

const activeProduct = computed(() => {
  return (
    products.value.find((item) => item.id === activeId.value) ||
    products.value[0]
  );
});

function statusColor(status: Product["status"]) {
  if (status === "在售") return "green";
  if (status === "草稿") return "arcoblue";
  return "orangered";
}
</script>

<template>
  <div class="page page-popup-container">
    <a-page-header
      title="产品管理"
      subtitle="基于 Arco Descriptions 的产品详情展示"
    />

    <a-select v-model="activeId">
      <a-option v-for="item in products" :key="item.id" :value="item.id">
        {{ item.name }}
      </a-option>
    </a-select>

    <a-grid :cols="24" :col-gap="16" class="content">
      <a-grid-item :span="8">
        <a-card title="产品列表" :bordered="false">
          <a-list>
            <a-list-item
              v-for="item in products"
              :key="item.id"
              :class="['product-item', { active: item.id === activeId }]"
              @click="activeId = item.id"
            >
              <div class="product-head">
                <strong>{{ item.name }}</strong>
                <a-tag :color="statusColor(item.status)">{{
                  item.status
                }}</a-tag>
              </div>
              <div class="product-meta">编号：{{ item.id }}</div>
            </a-list-item>
          </a-list>
        </a-card>
      </a-grid-item>

      <a-grid-item :span="16">
        <a-card title="产品详情" :bordered="false">
          <a-descriptions
            :data="[
              { label: '产品编号', value: activeProduct.id },
              { label: '产品名称', value: activeProduct.name },
              { label: '产品分类', value: activeProduct.category },
              { label: '销售状态', value: activeProduct.status },
              { label: '售价', value: `¥${activeProduct.price}` },
              { label: '库存', value: `${activeProduct.stock}` },
              { label: '产品负责人', value: activeProduct.manager },
              { label: '最后更新时间', value: activeProduct.updatedAt },
              { label: '描述', value: activeProduct.description },
            ]"
            :column="2"
            bordered
            layout="inline-vertical"
          />
        </a-card>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
}

.content {
  margin-top: 12px;
}

.product-item {
  cursor: pointer;
  border-radius: 6px;
  padding: 10px;
}

.product-item.active {
  background: rgb(var(--arcoblue-1));
}

.product-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-meta {
  color: var(--color-text-3);
  margin-top: 4px;
}
</style>
