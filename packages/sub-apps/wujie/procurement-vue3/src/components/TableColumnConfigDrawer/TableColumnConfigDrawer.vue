<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IconSettings, IconPushpin, IconClose } from '@arco-design/web-vue/es/icon';

export interface TableColumnOption {
    key: string;
    label: string;
    disabled?: boolean;
}

export interface ColumnConfigItem {
    key: string;
    fixed?: 'left' | 'right';
}

const props = withDefaults(
    defineProps<{
        options: TableColumnOption[];
        title?: string;
        triggerText?: string;
        width?: number;
    }>(),
    {
        title: '列配置',
        triggerText: '列配置',
        width: 700
    }
);

const columnConfig = ref<ColumnConfigItem[]>(props.options.map(item => ({ key: item.key })));

watch(
    () => props.options,
    val => {
        columnConfig.value = val.map(item => ({ key: item.key }));
    }
);

const orderedVisibleColumns = computed(() =>
    columnConfig.value
        .map(item => {
            const col = props.options.find(c => c.key === item.key);
            return col ? { ...col, fixed: item.fixed } : null;
        })
        .filter(Boolean) as (TableColumnOption & { fixed?: 'left' | 'right' })[]
);

defineExpose({ orderedVisibleColumns, columnConfig });

const visible = ref(false);
const draft = ref<ColumnConfigItem[]>([]);
const draggingKey = ref<string>('');
const dragOverKey = ref<string>('');

const optionMap = computed(() => new Map(props.options.map(item => [item.key, item])));
const enabledOptions = computed(() => props.options.filter(item => !item.disabled));
const enabledKeys = computed(() => enabledOptions.value.map(item => item.key));
const selectedOptions = computed(() => draft.value.map(item => ({ ...item, option: optionMap.value.get(item.key) })).filter(item => item.option) as (ColumnConfigItem & { option: TableColumnOption })[]);

watch(visible, val => {
    if (val) {
        draft.value = columnConfig.value
            .filter(item => optionMap.value.has(item.key))
            .map(item => ({ key: item.key, fixed: item.fixed }));
    }
});

function isSelected(key: string) {
    return draft.value.some(item => item.key === key);
}

function toggleOption(key: string, checked: boolean | (string | number | boolean)[]) {
    if (Array.isArray(checked)) return;
    if (checked) {
        if (!draft.value.some(item => item.key === key)) draft.value.push({ key });
        return;
    }
    draft.value = draft.value.filter(item => item.key !== key);
}

function unfix(key: string) {
    const item = draft.value.find(i => i.key === key);
    if (!item) return;
    item.fixed = undefined;
    reorderDraft();
}

function cycleFixed(key: string) {
    const item = draft.value.find(i => i.key === key);
    if (!item) return;
    if (!item.fixed) item.fixed = 'left';
    else if (item.fixed === 'left') item.fixed = 'right';
    else item.fixed = undefined;
    reorderDraft();
}

function reorderDraft() {
    const left = draft.value.filter(i => i.fixed === 'left');
    const middle = draft.value.filter(i => !i.fixed);
    const right = draft.value.filter(i => i.fixed === 'right');
    draft.value = [...left, ...middle, ...right];
}

function handleReset() {
    draft.value = enabledKeys.value.map(key => ({ key }));
}

function handleApply() {
    if (draft.value.length === 0) return;
    reorderDraft();
    columnConfig.value = draft.value.map(item => ({ key: item.key, fixed: item.fixed }));
    visible.value = false;
}

function onDragStart(key: string) {
    draggingKey.value = key;
}

function onDrop(targetKey: string) {
    const from = draft.value.findIndex(item => item.key === draggingKey.value);
    const to = draft.value.findIndex(item => item.key === targetKey);
    if (from < 0 || to < 0 || from === to) return;
    const next = [...draft.value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    draft.value = next;
    dragOverKey.value = '';
}
</script>

<template>
    <a-button type="outline" @click="visible = true">
        <template #icon>
            <IconSettings />
        </template>
        {{ triggerText }}
    </a-button>

    <a-drawer v-model:visible="visible" :title="title" :width="width" unmount-on-close>
        <div class="column-config-panel">
            <div class="column-config-actions">
                <span class="title-meta">可选列 {{ enabledKeys.length }}</span>
                <a-link @click="handleReset">恢复默认</a-link>
            </div>

            <div class="column-config-main">
                <div class="column-config-box">
                    <div class="column-config-box-title">全部列</div>
                    <div class="column-config-list">
                        <a-checkbox v-for="item in options" :key="item.key" :model-value="isSelected(item.key)" :disabled="item.disabled" @change="val => toggleOption(item.key, val)">
                            {{ item.label }}
                        </a-checkbox>
                    </div>
                </div>

                <div class="column-config-box">
                    <div class="column-config-box-title">已选列（拖拽排序，点击图钉固定）</div>
                    <div class="selected-list">
                        <div
                            v-for="(item, index) in selectedOptions"
                            :key="item.key"
                            class="selected-item"
                            :class="{
                                'is-drag-over': dragOverKey === item.key,
                                'is-fixed-left': item.fixed === 'left',
                                'is-fixed-right': item.fixed === 'right'
                            }"
                            draggable="true"
                            @dragstart="onDragStart(item.key)"
                            @dragenter.prevent="dragOverKey = item.key"
                            @dragleave.prevent="dragOverKey = ''"
                            @dragover.prevent
                            @drop.prevent="onDrop(item.key)"
                        >
                            <span class="drag-handle" aria-hidden="true"></span>
                            <span class="selected-index">{{ index + 1 }}</span>
                            <span class="selected-label">{{ item.option.label }}</span>
                            <a-tooltip :content="!item.fixed ? '固定到左侧' : item.fixed === 'left' ? '固定到右侧' : '取消固定'">
                                <span class="pin-btn" :class="{ 'is-active': !!item.fixed }" @click.stop="cycleFixed(item.key)">
                                    <IconPushpin />
                                </span>
                            </a-tooltip>
                            <span v-if="item.fixed" class="fixed-tag">{{ item.fixed === 'left' ? '左' : '右' }}</span>
                            <span v-if="item.fixed" class="unfix-btn" @click.stop="unfix(item.key)">
                                <IconClose />
                            </span>
                        </div>
                        <div v-if="selectedOptions.length === 0" class="selected-empty">请至少选择一列</div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <a-space>
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" :disabled="draft.length === 0" @click="handleApply">确定</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>

<style scoped>
.column-config-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
}

.column-config-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 12px;
    border-bottom: 1px solid var(--color-border-1);
}

.title-meta {
    font-size: 13px;
    color: var(--color-text-3);
}

.column-config-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    min-height: 0;
    flex: 1;
}

.column-config-box {
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    padding: 14px 14px 12px;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-2);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.column-config-box-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 8px;
    color: var(--color-text-1);
    border-bottom: 1px solid var(--color-border-1);
    position: relative;
    padding-left: 10px;
}

.column-config-box-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 10px;
    width: 3px;
    border-radius: 2px;
    background: rgb(var(--arcoblue-6));
}

.column-config-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    overflow: auto;
    padding: 2px 2px 4px;
}

.selected-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: auto;
    padding: 2px 2px 4px;
}

.selected-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: var(--color-fill-1);
    cursor: move;
    transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
    user-select: none;
}

.selected-item:hover {
    background: rgb(var(--arcoblue-1));
    border-color: rgb(var(--arcoblue-3));
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.selected-item.is-drag-over {
    border-color: rgb(var(--arcoblue-5));
    background: rgb(var(--arcoblue-2));
    box-shadow: 0 0 0 2px rgba(var(--arcoblue-6), 0.15);
}

.selected-item.is-fixed-left {
    border-left: 3px solid rgb(var(--arcoblue-6));
    border-radius: 6px 6px 6px 3px;
    background: rgba(var(--arcoblue-1), 0.6);
}

.selected-item.is-fixed-right {
    border-right: 3px solid rgb(var(--green-6));
    border-radius: 6px 3px 3px 6px;
    background: rgba(var(--green-1), 0.6);
}

.unfix-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-4);
    flex-shrink: 0;
    transition: all 0.2s;
    font-size: 10px;
}
.unfix-btn:hover {
    color: rgb(var(--red-6));
    background: rgb(var(--red-1));
}

.selected-label {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--color-text-1);
}

.pin-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-4);
    flex-shrink: 0;
    transition: all 0.2s;
}

.pin-btn:hover {
    color: rgb(var(--arcoblue-6));
    background: rgb(var(--arcoblue-1));
}

.pin-btn.is-active {
    color: #fff;
    background: rgb(var(--arcoblue-6));
}

.fixed-tag {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 8px;
    line-height: 16px;
    flex-shrink: 0;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.selected-item.is-fixed-left .fixed-tag {
    color: rgb(var(--arcoblue-6));
    background: rgb(var(--arcoblue-1));
}

.selected-item.is-fixed-right .fixed-tag {
    color: rgb(var(--green-6));
    background: rgb(var(--green-1));
}

.drag-handle {
    width: 10px;
    height: 14px;
    flex-shrink: 0;
    background-image: radial-gradient(circle, var(--color-text-4) 1px, transparent 1px);
    background-size: 4px 4px;
    background-position: 0 0;
    opacity: 0.6;
    transition: opacity 0.15s;
}

.selected-item:hover .drag-handle {
    opacity: 1;
}

.selected-index {
    min-width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-3);
    background: var(--color-fill-3);
    flex-shrink: 0;
}

.selected-empty {
    font-size: 13px;
    color: var(--color-text-3);
    border: 1px dashed var(--color-border-2);
    border-radius: 6px;
    padding: 20px 12px;
    background: var(--color-fill-1);
    text-align: center;
}
</style>
