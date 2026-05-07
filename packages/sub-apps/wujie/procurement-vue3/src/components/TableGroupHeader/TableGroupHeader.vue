<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export interface GroupDef {
    label: string;
    color: string;
    fromTh: number; // 起始列索引（0-based）
    toTh: number; // 结束列索引（0-based，包含）
}

const props = defineProps<{
    groups: GroupDef[];
}>();

const el = ref<HTMLElement>();
const positions = ref<Map<number, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number; visible: boolean; tagVisible: boolean }>>(new Map());

let scrollEl: HTMLElement | null = null;
let resizeObserver: ResizeObserver | null = null;

function getContainer(): HTMLElement | null {
    if (!el.value) return null;
    let node: HTMLElement | null = el.value.parentElement;
    while (node) {
        if (getComputedStyle(node).position === 'relative') return node;
        node = node.parentElement;
    }
    return el.value.parentElement;
}

function updatePositions() {
    const container = getContainer();
    if (!container) return;
    const ths = container.querySelectorAll('.arco-table-header th');
    const containerRect = container.getBoundingClientRect();
    // 用表格内容容器的可视区域裁剪（header 和 body 的共同父级）
    const scrollContainer = container.querySelector('.arco-table-content') || container.querySelector('.arco-table-container') || container;
    const scrollRect = scrollContainer.getBoundingClientRect();
    const next = new Map<number, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number; visible: boolean; tagVisible: boolean }>();

    for (const group of props.groups) {
        const thFrom = ths[group.fromTh] as HTMLElement | undefined;
        const thTo = ths[group.toTh] as HTMLElement | undefined;
        if (!thFrom || !thTo) continue;
        const rFrom = thFrom.getBoundingClientRect();
        const rTo = thTo.getBoundingClientRect();
        // 原始线位置（相对于容器）
        const rawLineLeft = rFrom.left - containerRect.left;
        const rawLineRight = rTo.right - containerRect.left;
        // 滚动容器的左右边界（相对于容器）
        const viewLeft = scrollRect.left - containerRect.left;
        const viewRight = scrollRect.right - containerRect.left;
        // 整组完全在视口外时隐藏
        const visible = rawLineRight > viewLeft && rawLineLeft < viewRight;
        // 裁剪线到滚动容器可视范围内
        const clampedLeft = Math.max(rawLineLeft, viewLeft);
        const clampedRight = Math.min(rawLineRight, viewRight);
        const clampedWidth = Math.max(0, clampedRight - clampedLeft);
        // 标签跟随起始列，但不超过可视范围左边界
        const tagLeft = Math.max(rawLineLeft, viewLeft);
        // 整组露出超过 1/10 时才显示标签
        const groupWidth = rTo.right - rFrom.left;
        const threshold = groupWidth / 9;
        const visibleGroupLeft = Math.max(rFrom.left, scrollRect.left);
        const visibleGroupRight = Math.min(rTo.right, scrollRect.right);
        const tagVisible = visibleGroupRight - visibleGroupLeft >= threshold;
        next.set(group.fromTh, {
            lineLeft: clampedLeft,
            lineWidth: clampedWidth,
            tagLeft,
            tagWidth: rFrom.width,
            lineTop: rFrom.top - containerRect.top,
            visible,
            tagVisible
        });
    }
    positions.value = next;
}

function onScroll() {
    requestAnimationFrame(updatePositions);
}

onMounted(() => {
    const container = getContainer();
    if (container) {
        resizeObserver = new ResizeObserver(() => nextTick(updatePositions));
        resizeObserver.observe(container);
    }
    nextTick(() => {
        updatePositions();
        scrollEl = container?.querySelector('.arco-table-header') || container?.querySelector('.arco-table-body') || container?.querySelector('.arco-table-container') || null;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', onScroll);
        }
    });
});

onUnmounted(() => {
    resizeObserver?.disconnect();
    if (scrollEl) {
        scrollEl.removeEventListener('scroll', onScroll);
    }
});
</script>

<template>
    <div ref="el" class="table-group-header">
        <template v-for="group in groups" :key="group.fromTh">
            <span
                v-show="positions.get(group.fromTh)?.visible"
                class="group-line"
                :style="{
                    left: positions.get(group.fromTh)?.lineLeft + 'px',
                    width: positions.get(group.fromTh)?.lineWidth + 'px',
                    top: (positions.get(group.fromTh)?.lineTop ?? 0) - 3 + 'px',
                    background: group.color
                }"
            ></span>
            <span
                v-show="positions.get(group.fromTh)?.tagVisible"
                class="group-tag"
                :style="{
                    left: positions.get(group.fromTh)?.tagLeft + 'px',
                    width: positions.get(group.fromTh)?.tagWidth + 'px',
                    top: 'calc(' + (positions.get(group.fromTh)?.lineTop ?? 0) + 'px - 15px)',
                    background: group.color
                }"
            >
                {{ group.label }}
            </span>
        </template>
    </div>
</template>

<style scoped>
.table-group-header {
    position: static;
}
.group-line {
    position: absolute;
    height: 3px;
    z-index: 10;
    border-radius: 2px 2px 0 0;
    pointer-events: none;
}
.group-tag {
    position: absolute;
    z-index: 11;
    font-size: 12px;
    line-height: 1;
    padding: 1px 5px 2px;
    border-radius: 2px 2px 0 0;
    color: #fff;
    letter-spacing: 0.3px;
    white-space: nowrap;
    text-align: left;
    pointer-events: none;
    width: auto !important;
}
</style>
