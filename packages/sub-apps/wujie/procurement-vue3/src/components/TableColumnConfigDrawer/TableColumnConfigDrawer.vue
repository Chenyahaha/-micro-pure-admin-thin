<script setup lang="ts">
// 引入 Vue 核心 API
import { computed, ref, watch } from 'vue';
// 引入 Arco Design 图标组件：设置图标、图钉图标、菜单图标
import { IconSettings, IconPushpin, IconMenu, IconClose } from '@arco-design/web-vue/es/icon';

// 列选项接口：定义每一列的配置项
export interface TableColumnOption {
    key: string; // 列唯一标识
    label: string; // 列显示名称
    disabled?: boolean; // 是否禁用勾选（可选）
}

// 列配置项接口：定义已选列的配置结构
export interface ColumnConfigItem {
    key: string; // 列唯一标识
    fixed?: 'left' | 'right'; // 固定方向：左侧或右侧（可选）
}

// 组件 Props 定义，带默认值
const props = withDefaults(
    defineProps<{
        modelValue: ColumnConfigItem[]; // 已选列配置列表（v-model 绑定）
        options: TableColumnOption[]; // 全部可选列选项
        title?: string; // 抽屉标题
        triggerText?: string; // 触发按钮文字
        width?: number; // 抽屉宽度
    }>(),
    {
        title: '列配置', // 默认抽屉标题
        triggerText: '列配置', // 默认触发按钮文字
        width: 700 // 默认抽屉宽度
    }
);

// 组件事件定义：更新 modelValue
const emit = defineEmits<{
    (e: 'update:modelValue', value: ColumnConfigItem[]): void;
}>();

// 抽屉显示/隐藏状态
const visible = ref(false);
// 草稿：编辑中的列配置列表，点击确定后才同步到 modelValue
const draft = ref<ColumnConfigItem[]>([]);
// 当前正在拖拽的列 key
const draggingKey = ref<string>('');
// 拖拽悬停目标列 key，用于高亮指示
const dragOverKey = ref<string>('');

// 列选项 Map，key → option，方便快速查找
const optionMap = computed(() => new Map(props.options.map(item => [item.key, item])));
// 未禁用的列选项列表
const enabledOptions = computed(() => props.options.filter(item => !item.disabled));
// 未禁用的列 key 列表
const enabledKeys = computed(() => enabledOptions.value.map(item => item.key));
// 已选列详情列表：将 draft 中的 key 映射为完整的选项信息
const selectedOptions = computed(() => draft.value.map(item => ({ ...item, option: optionMap.value.get(item.key) })).filter(item => item.option) as (ColumnConfigItem & { option: TableColumnOption })[]);

// 监听抽屉打开，将当前 modelValue 复制到 draft 作为编辑草稿
watch(visible, val => {
    if (val) {
        draft.value = props.modelValue
            .filter(item => optionMap.value.has(item.key)) // 只保留有效 key
            .map(item => ({ key: item.key, fixed: item.fixed })); // 浅拷贝，避免直接修改原数据
    }
});

// 判断某列是否已选中
function isSelected(key: string) {
    return draft.value.some(item => item.key === key);
}

// 切换列的选中状态
function toggleOption(key: string, checked: boolean | (string | number | boolean)[]) {
    if (Array.isArray(checked)) return; // 忽略数组形式的值
    if (checked) {
        // 勾选：追加到 draft 末尾
        if (!draft.value.some(item => item.key === key)) draft.value.push({ key });
        return;
    }
    // 取消勾选：从 draft 中移除
    draft.value = draft.value.filter(item => item.key !== key);
}

// 取消固定
function unfix(key: string) {
    const item = draft.value.find(i => i.key === key);
    if (!item) return;
    item.fixed = undefined;
    reorderDraft();
}

// 循环切换列的固定状态：不固定 → 左固定 → 右固定 → 不固定
function cycleFixed(key: string) {
    const item = draft.value.find(i => i.key === key);
    if (!item) return;
    if (!item.fixed)
        item.fixed = 'left'; // 第一次点击：固定到左侧
    else if (item.fixed === 'left')
        item.fixed = 'right'; // 第二次点击：切换到右侧
    else item.fixed = undefined; // 第三次点击：取消固定
    reorderDraft(); // 固定状态变更后自动重排序
}

// 重排 draft：左固定列置顶 → 普通列居中 → 右固定列置尾
// 保证 Arco Table 的 fixed 列顺序正确，避免样式错乱
function reorderDraft() {
    const left = draft.value.filter(i => i.fixed === 'left'); // 左固定列
    const middle = draft.value.filter(i => !i.fixed); // 普通列
    const right = draft.value.filter(i => i.fixed === 'right'); // 右固定列
    draft.value = [...left, ...middle, ...right]; // 拼接重排
}

// 恢复默认：重置为所有未禁用列，无固定
function handleReset() {
    draft.value = enabledKeys.value.map(key => ({ key }));
}

// 点击确定：先重排序，再同步 draft 到 modelValue，关闭抽屉
function handleApply() {
    if (draft.value.length === 0) return; // 至少保留一列
    reorderDraft(); // 确保顺序正确
    emit(
        'update:modelValue',
        draft.value.map(item => ({ key: item.key, fixed: item.fixed }))
    );
    visible.value = false; // 关闭抽屉
}

// 拖拽开始：记录正在拖拽的列 key
function onDragStart(key: string) {
    draggingKey.value = key;
}

// 拖拽放下：将拖拽列插入到目标列位置
function onDrop(targetKey: string) {
    // 找到拖拽源和目标在 draft 中的索引
    const from = draft.value.findIndex(item => item.key === draggingKey.value);
    const to = draft.value.findIndex(item => item.key === targetKey);
    if (from < 0 || to < 0 || from === to) return; // 无效操作，跳过
    const next = [...draft.value]; // 浅拷贝 draft
    const [moved] = next.splice(from, 1); // 取出被拖拽项
    next.splice(to, 0, moved); // 插入到目标位置
    draft.value = next; // 更新 draft
    dragOverKey.value = ''; // 清除拖拽悬停状态
}
</script>

<template>
    <!-- 触发按钮：点击打开列配置抽屉 -->
    <a-button type="outline" @click="visible = true">
        <template #icon>
            <IconSettings />
        </template>
        {{ triggerText }}
    </a-button>

    <!-- 列配置抽屉 -->
    <a-drawer v-model:visible="visible" :title="title" :width="width" unmount-on-close>
        <div class="column-config-panel">
            <!-- 顶部操作栏：显示可选列数量 + 恢复默认按钮 -->
            <div class="column-config-actions">
                <span class="title-meta">可选列 {{ enabledKeys.length }}</span>
                <a-link @click="handleReset">恢复默认</a-link>
            </div>

            <!-- 主体区域：左右两栏布局 -->
            <div class="column-config-main">
                <!-- 左栏：全部列（勾选/取消） -->
                <div class="column-config-box">
                    <div class="column-config-box-title">全部列</div>
                    <div class="column-config-list">
                        <a-checkbox v-for="item in options" :key="item.key" :model-value="isSelected(item.key)" :disabled="item.disabled" @change="val => toggleOption(item.key, val)">
                            {{ item.label }}
                        </a-checkbox>
                    </div>
                </div>

                <!-- 右栏：已选列（拖拽排序 + 固定列） -->
                <div class="column-config-box">
                    <div class="column-config-box-title">已选列（拖拽排序，点击图钉固定）</div>
                    <div class="selected-list">
                        <div
                            v-for="(item, index) in selectedOptions"
                            :key="item.key"
                            class="selected-item"
                            :class="{
                                'is-drag-over': dragOverKey === item.key, // 拖拽悬停高亮
                                'is-fixed-left': item.fixed === 'left', // 左固定样式
                                'is-fixed-right': item.fixed === 'right' // 右固定样式
                            }"
                            draggable="true"
                            @dragstart="onDragStart(item.key)"
                            @dragenter.prevent="dragOverKey = item.key"
                            @dragleave.prevent="dragOverKey = ''"
                            @dragover.prevent
                            @drop.prevent="onDrop(item.key)"
                        >
                            <!-- 拖拽手柄（点点图标） -->
                            <span class="drag-handle" aria-hidden="true"></span>
                            <!-- 序号标记 -->
                            <span class="selected-index">{{ index + 1 }}</span>
                            <!-- 列名称 -->
                            <span class="selected-label">{{ item.option.label }}</span>
                            <!-- 图钉按钮：循环切换固定状态 -->
                            <a-tooltip :content="!item.fixed ? '固定到左侧' : item.fixed === 'left' ? '固定到右侧' : '取消固定'">
                                <span class="pin-btn" :class="{ 'is-active': !!item.fixed }" @click.stop="cycleFixed(item.key)">
                                    <IconPushpin />
                                </span>
                            </a-tooltip>
                            <!-- 固定方向标签：显示"左"或"右" -->
                            <span v-if="item.fixed" class="fixed-tag">{{ item.fixed === 'left' ? '左' : '右' }}</span>
                            <!-- 取消固定按钮 -->
                            <span v-if="item.fixed" class="unfix-btn" @click.stop="unfix(item.key)">
                                <IconClose />
                            </span>
                        </div>
                        <!-- 空状态提示 -->
                        <div v-if="selectedOptions.length === 0" class="selected-empty">请至少选择一列</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 抽屉底部按钮 -->
        <template #footer>
            <a-space>
                <a-button @click="visible = false">取消</a-button>
                <a-button type="primary" :disabled="draft.length === 0" @click="handleApply">确定</a-button>
            </a-space>
        </template>
    </a-drawer>
</template>

<style scoped>
/* 面板最外层：纵向弹性布局，撑满高度 */
.column-config-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
}

/* 顶部操作栏：两端对齐，底部细线分隔 */
.column-config-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 12px;
    border-bottom: 1px solid var(--color-border-1);
}

/* 可选列数量文字 */
.title-meta {
    font-size: 13px;
    color: var(--color-text-3);
}

/* 主体区域：左右两栏等宽网格 */
.column-config-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    min-height: 0;
    flex: 1;
}

/* 左右栏卡片容器：圆角阴影卡片风格 */
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

/* 栏标题：带左侧装饰条 */
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

/* 左栏：全部列列表，两列排布更紧凑 */
.column-config-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 12px;
    overflow: auto;
    padding: 2px 2px 4px;
}

/* 右栏：已选列列表 */
.selected-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow: auto;
    padding: 2px 2px 4px;
}

/* 已选列每一行：圆角卡片风格 */
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

/* 已选列悬停：提升感 + 蓝色调 */
.selected-item:hover {
    background: rgb(var(--arcoblue-1));
    border-color: rgb(var(--arcoblue-3));
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* 拖拽悬停目标：明显蓝色高亮 */
.selected-item.is-drag-over {
    border-color: rgb(var(--arcoblue-5));
    background: rgb(var(--arcoblue-2));
    box-shadow: 0 0 0 2px rgba(var(--arcoblue-6), 0.15);
}

/* 左固定列：左侧蓝色粗边框标识 */
.selected-item.is-fixed-left {
    border-left: 3px solid rgb(var(--arcoblue-6));
    border-radius: 6px 6px 6px 3px;
    background: rgba(var(--arcoblue-1), 0.6);
}

/* 右固定列：右侧绿色粗边框标识 */
.selected-item.is-fixed-right {
    border-right: 3px solid rgb(var(--green-6));
    border-radius: 6px 3px 3px 6px;
    background: rgba(var(--green-1), 0.6);
}

/* 取消固定按钮：小叉号 */
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

/* 列名称容器：弹性占满剩余空间 */
.selected-label {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--color-text-1);
}

/* 图钉按钮：圆形 */
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

/* 图钉按钮悬停：蓝色底 + 蓝色图标 */
.pin-btn:hover {
    color: rgb(var(--arcoblue-6));
    background: rgb(var(--arcoblue-1));
}

/* 图钉按钮激活（已固定）：实心蓝色 */
.pin-btn.is-active {
    color: #fff;
    background: rgb(var(--arcoblue-6));
}

/* 固定方向标签："左" / "右"，小号胶囊 */
.fixed-tag {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 8px;
    line-height: 16px;
    flex-shrink: 0;
    font-weight: 600;
    letter-spacing: 0.5px;
}

/* 左固定标签：蓝色 */
.selected-item.is-fixed-left .fixed-tag {
    color: rgb(var(--arcoblue-6));
    background: rgb(var(--arcoblue-1));
}

/* 右固定标签：绿色 */
.selected-item.is-fixed-right .fixed-tag {
    color: rgb(var(--green-6));
    background: rgb(var(--green-1));
}

/* 拖拽手柄：点点图案 */
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

/* 悬停时手柄更明显 */
.selected-item:hover .drag-handle {
    opacity: 1;
}

/* 序号标记：小号方形数字 */
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

/* 空状态提示 */
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
