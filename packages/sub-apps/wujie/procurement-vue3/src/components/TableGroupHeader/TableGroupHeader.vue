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
const positions = ref<Map<number, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number }>>(new Map());

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
    const next = new Map<number, { lineLeft: number; lineWidth: number; tagLeft: number; tagWidth: number; lineTop: number }>();

    for (const group of props.groups) {
        const thFrom = ths[group.fromTh] as HTMLElement | undefined;
        const thTo = ths[group.toTh] as HTMLElement | undefined;
        if (!thFrom || !thTo) continue;
        const rFrom = thFrom.getBoundingClientRect();
        const rTo = thTo.getBoundingClientRect();
        next.set(group.fromTh, {
            lineLeft: rFrom.left - containerRect.left,
            lineWidth: rTo.right - rFrom.left,
            tagLeft: rFrom.left - containerRect.left,
            tagWidth: rFrom.width,
            lineTop: rFrom.top - containerRect.top
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
        scrollEl = container?.querySelector('.arco-table-body') || container?.querySelector('.arco-table-container') || null;
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
                class="group-line"
                :style="{
                    left: positions.get(group.fromTh)?.lineLeft + 'px',
                    width: positions.get(group.fromTh)?.lineWidth + 'px',
                    top: (positions.get(group.fromTh)?.lineTop ?? 0) - 3 + 'px',
                    background: group.color
                }"
            ></span>
            <span
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
