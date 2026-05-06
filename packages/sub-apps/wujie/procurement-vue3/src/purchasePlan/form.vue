<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { PurchasePlanRow } from "./data";
import { rules, statusOptions, deptOptions } from "./config";

const props = defineProps<{
  mode: "add" | "edit";
  modelValue: PurchasePlanRow;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: PurchasePlanRow];
}>();

const formRef = ref();

// 本地响应式表单数据，a-form 和 v-model 都绑定此对象
const localForm = reactive<PurchasePlanRow>({ ...props.modelValue });

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
        <a-form-item label="计划编号" field="no">
          <a-input v-model="localForm.no" placeholder="请输入计划编号" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="申请部门" field="dept">
          <a-select
            v-model="localForm.dept"
            :options="deptOptions"
            placeholder="请选择部门"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="采购项目" field="item">
          <a-input v-model="localForm.item" placeholder="请输入采购项目" />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="数量" field="qty">
          <a-input-number
            v-model="localForm.qty"
            :min="1"
            placeholder="请输入数量"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="预算(元)" field="budget">
          <a-input-number
            v-model="localForm.budget"
            :min="0"
            :precision="2"
            placeholder="请输入预算"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
      <a-grid-item>
        <a-form-item label="负责人" field="owner">
          <a-input v-model="localForm.owner" placeholder="请输入负责人" />
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
      <a-grid-item>
        <a-form-item label="期望到货日期" field="expectDate">
          <a-date-picker
            v-model="localForm.expectDate"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 100%"
          />
        </a-form-item>
      </a-grid-item>
    </a-grid>
  </a-form>
</template>
