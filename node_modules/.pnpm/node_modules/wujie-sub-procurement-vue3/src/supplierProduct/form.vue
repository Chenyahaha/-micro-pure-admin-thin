<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { SupplierProductRow } from "./data";
import { rules, supplierOptions, leadTimeOptions } from "./config";

const props = defineProps<{
  mode: "add" | "edit";
  modelValue: SupplierProductRow;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SupplierProductRow];
}>();

const formRef = ref();

// 本地响应式表单数据，a-form 和 v-model 都绑定此对象
const localForm = reactive<SupplierProductRow>({ ...props.modelValue });

// 父组件数据变化时同步到本地
watch(
  () => props.modelValue,
  (val) => Object.assign(localForm, val),
  { deep: true }
);

// 本地数据变化时同步回父组件
watch(
  localForm,
  (val) => emit("update:modelValue", { ...val }),
  { deep: true }
);

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
});
</script>

<template>
  <a-form ref="formRef" :model="localForm" :rules="rules" layout="vertical">
    <a-grid :cols="2" :col-gap="16">
      <a-grid-item>
        <a-form-item label="SKU" field="sku">
          <a-input v-model="localForm.sku" placeholder="请输入SKU" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="供应商" field="supplier">
          <a-select
            v-model="localForm.supplier"
            :options="supplierOptions"
            placeholder="请选择供应商"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="产品名称" field="product">
          <a-input v-model="localForm.product" placeholder="请输入产品名称" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="最小起订量" field="moq">
          <a-input-number
            v-model="localForm.moq"
            :min="1"
            placeholder="请输入起订量"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="供货价(元)" field="price">
          <a-input-number
            v-model="localForm.price"
            :min="0"
            :precision="2"
            placeholder="请输入供货价"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="交期" field="leadTime">
          <a-select
            v-model="localForm.leadTime"
            :options="leadTimeOptions"
            placeholder="请选择交期"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item :span="2">
        <a-form-item label="质检合格率" field="qualityRate">
          <a-input v-model="localForm.qualityRate" placeholder="如 99.3%" />
        </a-form-item>
      </a-grid-item>
    </a-grid>
  </a-form>
</template>
