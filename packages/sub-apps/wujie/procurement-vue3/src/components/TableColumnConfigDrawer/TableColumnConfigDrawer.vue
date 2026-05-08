<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IconSettings, IconPushpin, IconClose } from '@arco-design/web-vue/es/icon';

export interface TableColumnItem {
    key: string;
    label: string;
    disabled?: boolean;
}

export interface TableColumnGroup {
    groupKey: string;
    label: string;
    color: string;
    children: TableColumnItem[];
}

export type TableColumnOption = TableColumnItem | TableColumnGroup;

export interface VisibleColumn extends TableColumnItem {
    fixed?: 'left' | 'right';
    groupKey?: string;
    groupLabel?: string;
    groupColor?: string;
}

export interface ColumnConfigItem {
    key: string;
    fixed?: 'left' | 'right';
    groupKey?: string;
}

function isGroupOption(opt: TableColumnOption): opt is TableColumnGroup {
    return 'children' in opt && Array.isArray(opt.children);
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

const flatOptions = computed<TableColumnItem[]>(() => {
    const result: TableColumnItem[] = [];
    for (const opt of props.options) {
        if (isGroupOption(opt)) {
            result.push(...opt.children);
        } else {
            result.push(opt);
        }
    }
    return result;
});

const ungroupedOptions = computed<TableColumnItem[]>(() =>
    props.options.filter((opt): opt is TableColumnItem => !isGroupOption(opt))
);

const keyToGroup = computed(() => {
    const map = new Map<string, { groupKey: string; label: string; color: string }>();
    for (const opt of props.options) {
        if (isGroupOption(opt)) {
            for (const child of opt.children) {
                map.set(child.key, { groupKey: opt.groupKey, label: opt.label, color: opt.color });
            }
        }
    }
    return map;
});

const groups = computed<TableColumnGroup[]>(() =>
    props.options.filter(isGroupOption) as TableColumnGroup[]
);

const columnConfig = ref<ColumnConfigItem[]>(
    flatOptions.value.map(item => ({
        key: item.key,
        groupKey: keyToGroup.value.get(item.key)?.groupKey
    }))
);

watch(
    () => props.options,
    () => {
        columnConfig.value = flatOptions.value.map(item => ({
            key: item.key,
            groupKey: keyToGroup.value.get(item.key)?.groupKey
        }));
    }
);

const orderedVisibleColumns = computed<VisibleColumn[]>(() =>
    columnConfig.value
        .map(item => {
            const col = flatOptions.value.find(c => c.key === item.key);
            if (!col) return null;
            const groupInfo = keyToGroup.value.get(item.key);
            return {
                ...col,
                fixed: item.fixed,
                groupKey: groupInfo?.groupKey,
                groupLabel: groupInfo?.label,
                groupColor: groupInfo?.color,
            };
        })
        .filter(Boolean) as VisibleColumn[]
);

defineExpose({ orderedVisibleColumns, columnConfig });

const visible = ref(false);
const draft = ref<ColumnConfigItem[]>([]);
const draggingKey = ref<string>('');
const dragOverKey = ref<string>('');

const optionMap = computed(() => new Map(flatOptions.value.map(item => [item.key, item])));
const enabledFlatOptions = computed(() => flatOptions.value.filter(item => !item.disabled));
const enabledKeys = computed(() => enabledFlatOptions.value.map(item => item.key));

watch(visible, val => {
    if (val) {
        draft.value = columnConfig.value
            .filter(item => optionMap.value.has(item.key))
            .map(item => ({ key: item.key, fixed: item.fixed, groupKey: item.groupKey }));
    }
});

function isSelected(key: string) {
    return draft.value.some(item => item.key === key);
}

function toggleOption(key: string, checked: boolean | (string | number | boolean)[]) {
    if (Array.isArray(checked)) return;
    if (checked) {
        if (!draft.value.some(item => item.key === key)) {
            const groupKey = keyToGroup.value.get(key)?.groupKey;
            draft.value.push({ key, groupKey });
        }
        return;
    }
    draft.value = draft.value.filter(item => item.key !== key);
}

function isGroupSelected(groupKey: string): boolean {
    const group = groups.value.find(g => g.groupKey === groupKey);
    if (!group) return false;
    return group.children.every(c => isSelected(c.key));
}

function isGroupIndeterminate(groupKey: string): boolean {
    const group = groups.value.find(g => g.groupKey === groupKey);
    if (!group) return false;
    const selected = group.children.filter(c => isSelected(c.key));
    return selected.length > 0 && selected.length < group.children.length;
}

function toggleGroup(groupKey: string, checked: boolean | (string | number | boolean)[]) {
    if (Array.isArray(checked)) return;
    const group = groups.value.find(g => g.groupKey === groupKey);
    if (!group) return;
    for (const child of group.children) {
        if (child.disabled) continue;
        toggleOption(child.key, checked);
    }
}

function isUngroupedSelected(): boolean {
    const items = ungroupedOptions.value;
    if (items.length === 0) return false;
    return items.every(c => isSelected(c.key));
}

function isUngroupedIndeterminate(): boolean {
    const items = ungroupedOptions.value;
    if (items.length === 0) return false;
    const selected = items.filter(c => isSelected(c.key));
    return selected.length > 0 && selected.length < items.length;
}

function toggleUngrouped(checked: boolean | (string | number | boolean)[]) {
    if (Array.isArray(checked)) return;
    for (const item of ungroupedOptions.value) {
        if (item.disabled) continue;
        toggleOption(item.key, checked);
    }
}

interface RenderItem {
    type: 'group-header' | 'group-child' | 'item';
    key: string;
    groupKey?: string;
    option?: TableColumnItem;
    groupDef?: TableColumnGroup;
    fixed?: 'left' | 'right';
    logicalIndex?: number;
    childIndex?: number;
}

const renderItems = computed<RenderItem[]>(() => {
    const items: RenderItem[] = [];
    let currentGroupKey: string | undefined;
    let pos = 0;
    let childPos = 0;

    for (const draftItem of draft.value) {
        const groupInfo = keyToGroup.value.get(draftItem.key);

        if (groupInfo) {
            if (groupInfo.groupKey !== currentGroupKey) {
                const groupDef = groups.value.find(g => g.groupKey === groupInfo.groupKey)!;
                const hasVisibleChildren = groupDef.children.some(c => draft.value.some(d => d.key === c.key));
                if (hasVisibleChildren) {
                    pos++;
                    items.push({
                        type: 'group-header',
                        key: groupInfo.groupKey,
                        groupKey: groupInfo.groupKey,
                        groupDef,
                        fixed: draftItem.fixed,
                        logicalIndex: pos
                    });
                    childPos = 0;
                }
                currentGroupKey = groupInfo.groupKey;
            }
            childPos++;
            items.push({
                type: 'group-child',
                key: draftItem.key,
                groupKey: currentGroupKey,
                option: flatOptions.value.find(o => o.key === draftItem.key),
                fixed: draftItem.fixed,
                logicalIndex: pos,
                childIndex: childPos
            });
        } else {
            currentGroupKey = undefined;
            pos++;
            items.push({
                type: 'item',
                key: draftItem.key,
                option: flatOptions.value.find(o => o.key === draftItem.key),
                fixed: draftItem.fixed,
                logicalIndex: pos
            });
        }
    }
    return items;
});

function getGroupKeys(groupKey: string): string[] {
    const group = groups.value.find(g => g.groupKey === groupKey);
    return group ? group.children.map(c => c.key) : [];
}

function unfix(key: string) {
    const groupKey = keyToGroup.value.get(key)?.groupKey;
    if (groupKey) {
        const keys = getGroupKeys(groupKey);
        for (const k of keys) {
            const item = draft.value.find(i => i.key === k);
            if (item) item.fixed = undefined;
        }
    } else {
        const item = draft.value.find(i => i.key === key);
        if (!item) return;
        item.fixed = undefined;
    }
    reorderDraft();
}

function cycleFixed(key: string) {
    const groupKey = keyToGroup.value.get(key)?.groupKey;
    if (groupKey) {
        cycleFixedGroup(groupKey);
        return;
    }
    const item = draft.value.find(i => i.key === key);
    if (!item) return;
    if (!item.fixed) item.fixed = 'left';
    else if (item.fixed === 'left') item.fixed = 'right';
    else item.fixed = undefined;
    reorderDraft();
}

function cycleFixedGroup(groupKey: string) {
    const keys = getGroupKeys(groupKey);
    const firstItem = draft.value.find(i => i.key === keys[0]);
    const currentFixed = firstItem?.fixed;
    const newFixed = !currentFixed ? 'left' : currentFixed === 'left' ? 'right' : undefined;
    for (const key of keys) {
        const item = draft.value.find(i => i.key === key);
        if (item) item.fixed = newFixed;
    }
    reorderDraft();
}

function reorderDraft() {
    const left = draft.value.filter(i => i.fixed === 'left');
    const middle = draft.value.filter(i => !i.fixed);
    const right = draft.value.filter(i => i.fixed === 'right');
    draft.value = [...left, ...middle, ...right];
}

function handleReset() {
    draft.value = enabledKeys.value.map(key => ({ key, groupKey: keyToGroup.value.get(key)?.groupKey }));
}

function handleApply() {
    if (draft.value.length === 0) return;
    reorderDraft();
    columnConfig.value = draft.value.map(item => ({ key: item.key, fixed: item.fixed, groupKey: item.groupKey }));
    visible.value = false;
}

function onDragStart(key: string) {
    draggingKey.value = key;
}

function onDrop(targetKey: string) {
    const sourceKey = draggingKey.value;
    const sourceIsGroup = groups.value.some(g => g.groupKey === sourceKey);
    const sourceGroupKey = keyToGroup.value.get(sourceKey)?.groupKey;

    // If dragging a group child within its group, reorder within the group
    if (!sourceIsGroup && sourceGroupKey) {
        const targetGroupKey = keyToGroup.value.get(targetKey)?.groupKey;
        const targetIsGroupHeader = groups.value.some(g => g.groupKey === targetKey);
        // Only allow drop within the same group
        if (targetGroupKey === sourceGroupKey && !targetIsGroupHeader) {
            const from = draft.value.findIndex(item => item.key === sourceKey);
            const to = draft.value.findIndex(item => item.key === targetKey);
            if (from < 0 || to < 0 || from === to) { dragOverKey.value = ''; return; }
            const next = [...draft.value];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            draft.value = next;
            dragOverKey.value = '';
            return;
        }
        // Drop on own group header or outside group — ignore
        dragOverKey.value = '';
        return;
    }

    const sourceKeys = sourceIsGroup ? getGroupKeys(sourceKey) : [sourceKey];

    // Find the target position: if target is a group header, use its first child's position
    const targetIsGroup = groups.value.some(g => g.groupKey === targetKey);
    const targetLookupKey = targetIsGroup ? getGroupKeys(targetKey)[0] : targetKey;

    const targetIndex = draft.value.findIndex(item => item.key === targetLookupKey);
    if (targetIndex < 0) return;

    // Check if any source key is in the draft
    if (!sourceKeys.some(k => draft.value.some(d => d.key === k))) return;

    // Remove all source keys from draft
    const next = draft.value.filter(item => !sourceKeys.includes(item.key));

    // Find the new target index after removal
    const targetItem = draft.value[targetIndex];
    let insertAt = next.findIndex(item => item.key === targetItem.key);
    if (insertAt < 0) insertAt = next.length;

    // Collect the moved items in their original draft order
    const movedItems = draft.value.filter(item => sourceKeys.includes(item.key));

    // Insert the block at the target position
    next.splice(insertAt, 0, ...movedItems);
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
                        <!-- 基础信息：所有无分组列归到一起 -->
                        <template v-if="ungroupedOptions.length > 0">
                            <div class="group-checkbox-row">
                                <a-checkbox
                                    :model-value="isUngroupedSelected()"
                                    :indeterminate="isUngroupedIndeterminate()"
                                    :disabled="ungroupedOptions.every(c => c.disabled)"
                                    @change="val => toggleUngrouped(val)"
                                >
                                    基础信息
                                </a-checkbox>
                            </div>
                            <a-checkbox
                                v-for="item in ungroupedOptions"
                                :key="item.key"
                                :model-value="isSelected(item.key)"
                                :disabled="item.disabled"
                                class="group-child-checkbox"
                                @change="val => toggleOption(item.key, val)"
                            >
                                {{ item.label }}
                            </a-checkbox>
                        </template>

                        <!-- 分组列 -->
                        <template v-for="opt in groups" :key="opt.groupKey">
                            <div class="group-checkbox-row group-section-gap">
                                <a-checkbox
                                    :model-value="isGroupSelected(opt.groupKey)"
                                    :indeterminate="isGroupIndeterminate(opt.groupKey)"
                                    :disabled="opt.children.every(c => c.disabled)"
                                    @change="val => toggleGroup(opt.groupKey, val)"
                                >
                                    <span class="group-dot" :style="{ background: opt.color }"></span>
                                    {{ opt.label }}
                                </a-checkbox>
                            </div>
                            <a-checkbox
                                v-for="child in opt.children"
                                :key="child.key"
                                :model-value="isSelected(child.key)"
                                :disabled="child.disabled"
                                class="group-child-checkbox"
                                @change="val => toggleOption(child.key, val)"
                            >
                                {{ child.label }}
                            </a-checkbox>
                        </template>
                    </div>
                </div>

                <div class="column-config-box">
                    <div class="column-config-box-title">已选列（拖拽排序，点击图钉固定）</div>
                    <div class="selected-list">
                        <template v-for="item in renderItems" :key="item.key + '-' + item.type">
                            <!-- Group header: draggable -->
                            <div
                                v-if="item.type === 'group-header'"
                                class="selected-item group-header-item"
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
                                <span class="selected-index">{{ item.logicalIndex }}</span>
                                <span class="group-dot" :style="{ background: item.groupDef!.color }"></span>
                                <span class="selected-label group-label">{{ item.groupDef!.label }}</span>
                                <span class="group-child-count">{{ item.groupDef!.children.length }}列</span>
                                <a-tooltip :content="!item.fixed ? '固定到左侧' : item.fixed === 'left' ? '固定到右侧' : '取消固定'">
                                    <span class="pin-btn" :class="{ 'is-active': !!item.fixed }" @click.stop="cycleFixedGroup(item.groupKey!)">
                                        <IconPushpin />
                                    </span>
                                </a-tooltip>
                                <span v-if="item.fixed" class="fixed-tag">{{ item.fixed === 'left' ? '左' : '右' }}</span>
                                <span v-if="item.fixed" class="unfix-btn" @click.stop="unfix(item.groupDef!.children[0].key)">
                                    <IconClose />
                                </span>
                            </div>

                            <!-- Group child: draggable within group only -->
                            <div
                                v-else-if="item.type === 'group-child'"
                                class="selected-item group-child-item"
                                :class="{
                                    'is-drag-over': dragOverKey === item.key && keyToGroup.get(draggingKey)?.groupKey === item.groupKey,
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
                                <span class="child-indent"></span>
                                <span class="drag-handle child-drag-handle" aria-hidden="true"></span>
                                <span class="selected-index child-index">{{ item.logicalIndex }}.{{ item.childIndex }}</span>
                                <span class="selected-label">{{ item.option!.label }}</span>
                            </div>

                            <!-- Ungrouped item: same as before -->
                            <div
                                v-else
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
                                <span class="selected-index">{{ item.logicalIndex }}</span>
                                <span class="selected-label">{{ item.option!.label }}</span>
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
                        </template>
                        <div v-if="renderItems.length === 0" class="selected-empty">请至少选择一列</div>
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

.group-checkbox-row {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0 2px;
    font-weight: 600;
    font-size: 13px;
    color: var(--color-text-2);
}

.group-section-gap {
    margin-top: 14px;
}

.group-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.group-child-checkbox {
    padding-left: 24px;
}

.selected-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
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

.group-header-item {
    background: var(--color-fill-2);
    font-weight: 600;
    border-radius: 6px 6px 2px 2px;
    margin-bottom: 0;
}

.group-child-item {
    padding-left: 28px;
    cursor: default;
    border-radius: 2px;
    gap: 4px;
}

.group-child-item:last-of-type {
    border-radius: 2px 2px 6px 6px;
}

.group-label {
    font-weight: 600;
}

.group-child-count {
    font-size: 11px;
    color: var(--color-text-3);
    padding: 1px 6px;
    background: var(--color-fill-3);
    border-radius: 8px;
}

.child-indent {
    width: 16px;
    flex-shrink: 0;
}

.child-drag-handle {
    width: 8px;
    height: 10px;
    opacity: 0.4;
}

.group-child-item:hover .child-drag-handle {
    opacity: 0.8;
}

.child-index {
    font-size: 10px;
    min-width: 24px;
    background: var(--color-fill-2);
    color: var(--color-text-4);
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
