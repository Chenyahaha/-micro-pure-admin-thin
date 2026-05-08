<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { VisibleColumn } from '../TableColumnConfigDrawer/TableColumnConfigDrawer.vue';

export interface GroupDef {
    groupKey: string;
    label: string;
    color: string;
}

const props = defineProps<{
    groups: GroupDef[];
    columns?: VisibleColumn[];
    leadingColumnCount?: number;
}>();

const el = ref<HTMLElement>();
const positions = ref<Map<string, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number; visible: boolean; tagVisible: boolean }>>(new Map());

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
    const scrollContainer = container.querySelector('.arco-table-content') || container.querySelector('.arco-table-container') || container;
    const scrollRect = scrollContainer.getBoundingClientRect();
    const next = new Map<string, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number; visible: boolean; tagVisible: boolean }>();

    const leading = props.leadingColumnCount ?? 0;
    const cols = props.columns ?? [];

    for (const group of props.groups) {
        // Find the first and last visible column keys that belong to this group
        const groupCols = cols.filter(c => c.groupKey === group.groupKey);
        if (groupCols.length === 0) continue;

        const firstColKey = groupCols[0].key;
        const lastColKey = groupCols[groupCols.length - 1].key;

        // Compute th index: leading columns + index within visible configurable columns
        const firstIdx = leading + cols.findIndex(c => c.key === firstColKey);
        const lastIdx = leading + cols.findIndex(c => c.key === lastColKey);

        if (firstIdx < 0 || lastIdx < 0) continue;

        const thFrom = ths[firstIdx] as HTMLElement | undefined;
        const thTo = ths[lastIdx] as HTMLElement | undefined;
        if (!thFrom || !thTo) continue;

        const rFrom = thFrom.getBoundingClientRect();
        const rTo = thTo.getBoundingClientRect();
        const rawLineLeft = rFrom.left - containerRect.left;
        const rawLineRight = rTo.right - containerRect.left;
        const viewLeft = scrollRect.left - containerRect.left;
        const viewRight = scrollRect.right - containerRect.left;
        const visible = rawLineRight > viewLeft && rawLineLeft < viewRight;
        const clampedLeft = Math.max(rawLineLeft, viewLeft);
        const clampedRight = Math.min(rawLineRight, viewRight);
        const clampedWidth = Math.max(0, clampedRight - clampedLeft);
        const tagLeft = Math.max(rawLineLeft, viewLeft);
        const groupWidth = rTo.right - rFrom.left;
        const threshold = groupWidth / 9;
        const visibleGroupLeft = Math.max(rFrom.left, scrollRect.left);
        const visibleGroupRight = Math.min(rTo.right, scrollRect.right);
        const tagVisible = visibleGroupRight - visibleGroupLeft >= threshold;
        next.set(group.groupKey, {
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

watch(() => props.groups, () => nextTick(updatePositions), { deep: true });
watch(() => props.columns, () => nextTick(updatePositions), { deep: true });

onUnmounted(() => {
    resizeObserver?.disconnect();
    if (scrollEl) {
        scrollEl.removeEventListener('scroll', onScroll);
    }
});
</script>

<template>
    <div ref="el" class="table-group-header">
        <template v-for="group in groups" :key="group.groupKey">
            <span
                v-show="positions.get(group.groupKey)?.visible"
                class="group-line"
                :style="{
                    left: positions.get(group.groupKey)?.lineLeft + 'px',
                    width: positions.get(group.groupKey)?.lineWidth + 'px',
                    top: (positions.get(group.groupKey)?.lineTop ?? 0) - 3 + 'px',
                    background: group.color
                }"
            ></span>
            <span
                v-show="positions.get(group.groupKey)?.tagVisible"
                class="group-tag"
                :style="{
                    left: positions.get(group.groupKey)?.tagLeft + 'px',
                    width: positions.get(group.groupKey)?.tagWidth + 'px',
                    top: 'calc(' + (positions.get(group.groupKey)?.lineTop ?? 0) + 'px - 15px)',
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
