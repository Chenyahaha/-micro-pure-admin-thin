import { ref, computed } from 'vue';
import TableColumnConfigDrawer from './TableColumnConfigDrawer.vue';
import type { TableColumnOption, VisibleColumn } from './TableColumnConfigDrawer.vue';

function flattenWithOptions(options: TableColumnOption[]): VisibleColumn[] {
    const result: VisibleColumn[] = [];
    for (const opt of options) {
        if ('children' in opt && Array.isArray(opt.children)) {
            for (const child of opt.children) {
                result.push({
                    ...child,
                    fixed: undefined,
                    groupKey: opt.groupKey,
                    groupLabel: opt.label,
                    groupColor: opt.color,
                });
            }
        } else {
            result.push({ ...opt, fixed: undefined });
        }
    }
    return result;
}

export function useColumnConfig(options: TableColumnOption[]) {
    const columnConfigRef = ref<InstanceType<typeof TableColumnConfigDrawer>>();
    const orderedVisibleColumns = computed(() =>
        columnConfigRef.value?.orderedVisibleColumns ?? flattenWithOptions(options)
    );
    return { columnConfigRef, orderedVisibleColumns };
}
