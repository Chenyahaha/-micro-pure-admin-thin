<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { PurchaseOrderBatch } from './data';
import { createEmptyLine } from './data';
import { rules, statusOptions, payStatusOptions, supplierOptions } from './config';

const props = defineProps<{
    mode: 'add' | 'edit';
    modelValue: PurchaseOrderBatch;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: PurchaseOrderBatch];
}>();

const formRef = ref();
const localForm = reactive<PurchaseOrderBatch>({
    ...props.modelValue,
    children: props.modelValue.children?.length ? [...props.modelValue.children] : [createEmptyLine()]
});

watch(
    () => props.modelValue,
    val => {
        Object.assign(localForm, val);
        localForm.children = val.children?.length > 0 ? [...val.children] : [createEmptyLine()];
    },
    { deep: true }
);

watch(
    localForm,
    val =>
        emit('update:modelValue', {
            ...val,
            children: val.children.map(c => ({ ...c }))
        }),
    { deep: true }
);

function addLine() {
    localForm.children.push(createEmptyLine());
}

function removeLine(index: number) {
    if (localForm.children.length <= 1) return;
    localForm.children.splice(index, 1);
}

defineExpose({
    validate: () => formRef.value?.validate(),
    resetFields: () => formRef.value?.resetFields()
});
</script>

<template>
    <a-form ref="formRef" :model="localForm" :rules="rules" layout="vertical">
        <div class="section-title">主单信息</div>
        <a-grid :cols="2" :col-gap="16">
            <a-grid-item>
                <a-form-item label="批次号 / 主单号" field="batchNo">
                    <a-input v-model="localForm.batchNo" placeholder="如 POG250501001" />
                </a-form-item>
            </a-grid-item>
            <a-grid-item>
                <a-form-item label="供应商" field="supplier">
                    <a-select v-model="localForm.supplier" :options="supplierOptions" placeholder="请选择供应商" />
                </a-form-item>
            </a-grid-item>
            <a-grid-item>
                <a-form-item label="采购员" field="buyer">
                    <a-input v-model="localForm.buyer" placeholder="采购员" />
                </a-form-item>
            </a-grid-item>
            <a-grid-item>
                <a-form-item label="创建人" field="creator">
                    <a-input v-model="localForm.creator" placeholder="与采购员可相同" />
                </a-form-item>
            </a-grid-item>
            <a-grid-item>
                <a-form-item label="下单日期" field="date">
                    <a-date-picker v-model="localForm.date" value-format="YYYY-MM-DD" placeholder="请选择" style="width: 100%" />
                </a-form-item>
            </a-grid-item>
            <a-grid-item>
                <a-form-item label="备注" field="remark">
                    <a-input v-model="localForm.remark" placeholder="主单备注" />
                </a-form-item>
            </a-grid-item>
        </a-grid>

        <div class="section-title row-with-action">
            <span>采购明细</span>
            <a-button type="outline" size="small" @click="addLine">添加明细行</a-button>
        </div>

        <div class="lines-wrap">
            <div v-for="(line, index) in localForm.children" :key="index" class="line-card">
                <div class="line-head">
                    <span class="line-index">第 {{ index + 1 }} 行</span>
                    <a-button v-if="localForm.children.length > 1" type="text" size="mini" status="danger" @click="removeLine(index)">删除此行</a-button>
                </div>
                <a-grid :cols="2" :col-gap="16">
                    <a-grid-item>
                        <a-form-item label="子单号" :field="`children.${index}.no`" :rules="[{ required: true, message: '请输入子单号' }]">
                            <a-input v-model="line.no" placeholder="行编号" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="SKU" :field="`children.${index}.sku`" :rules="[{ required: true, message: '请输入 SKU' }]">
                            <a-input v-model="line.sku" placeholder="SKU" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item :span="2">
                        <a-form-item label="产品名称" :field="`children.${index}.productName`" :rules="[{ required: true, message: '请输入产品名称' }]">
                            <a-input v-model="line.productName" placeholder="产品名称" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="店铺">
                            <a-input v-model="line.store" placeholder="可选" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="国家/地区">
                            <a-input v-model="line.country" placeholder="可选" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="仓库" :field="`children.${index}.warehouse`" :rules="[{ required: true, message: '请输入仓库' }]">
                            <a-input v-model="line.warehouse" placeholder="仓库" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="数量" :field="`children.${index}.qty`" :rules="[{ required: true, message: '请输入数量' }]">
                            <a-input-number v-model="line.qty" :min="0" :precision="0" placeholder="数量" style="width: 100%" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="金额(元)" :field="`children.${index}.amount`" :rules="[{ required: true, message: '请输入金额' }]">
                            <a-input-number v-model="line.amount" :min="0" :precision="2" placeholder="金额" style="width: 100%" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="订单状态">
                            <a-select v-model="line.status" :options="statusOptions" placeholder="状态" />
                        </a-form-item>
                    </a-grid-item>
                    <a-grid-item>
                        <a-form-item label="付款状态">
                            <a-select v-model="line.payStatus" :options="payStatusOptions" placeholder="付款状态" />
                        </a-form-item>
                    </a-grid-item>
                </a-grid>
            </div>
        </div>
    </a-form>
</template>

<style scoped>
.section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
    margin-bottom: 12px;
    margin-top: 8px;
}
.section-title.row-with-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.lines-wrap {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 52vh;
    overflow-y: auto;
    padding-right: 4px;
}
.line-card {
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    padding: 12px 16px;
    background: var(--color-fill-1);
}
.line-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.line-index {
    font-size: 12px;
    color: var(--color-text-3);
}
</style>
