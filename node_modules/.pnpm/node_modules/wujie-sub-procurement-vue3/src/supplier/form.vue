<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { SupplierRow } from "./data";
import { rules, statusOptions, levelOptions, categoryOptions } from "./config";

const props = defineProps<{
  mode: "add" | "edit";
  modelValue: SupplierRow;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: SupplierRow];
}>();

const formRef = ref();

// 本地响应式表单数据，a-form 和 v-model 都绑定此对象
const localForm = reactive<SupplierRow>({ ...props.modelValue });

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
        <a-form-item label="供应商编码" field="code">
          <a-input v-model="localForm.code" placeholder="请输入供应商编码" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="供应商名称" field="name">
          <a-input v-model="localForm.name" placeholder="请输入供应商名称" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="等级" field="level">
          <a-select
            v-model="localForm.level"
            :options="levelOptions"
            placeholder="请选择等级"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="品类" field="category">
          <a-select
            v-model="localForm.category"
            :options="categoryOptions"
            placeholder="请选择品类"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="联系人" field="contact">
          <a-input v-model="localForm.contact" placeholder="请输入联系人" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="联系电话" field="phone">
          <a-input
            v-model="localForm.phone"
            placeholder="请输入手机号"
            :max-length="11"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="合作年限" field="coopYears">
          <a-input-number
            v-model="localForm.coopYears"
            :min="0"
            placeholder="请输入合作年限"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="状态" field="status">
          <a-select
            v-model="localForm.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </a-form-item>
      </a-grid-item>
    </a-grid>
  </a-form>
</template>
