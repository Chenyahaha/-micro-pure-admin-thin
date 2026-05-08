import { ref, computed } from 'vue';
import TableColumnConfigDrawer from './TableColumnConfigDrawer.vue';
import type { TableColumnOption, TableColumnGroup, VisibleColumn } from './TableColumnConfigDrawer.vue';

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

function extractHeaderGroups(options: TableColumnOption[]) {
    return options
        .filter((opt): opt is TableColumnGroup => 'children' in opt && Array.isArray(opt.children))
        .map(g => ({ groupKey: g.groupKey, label: g.label, color: g.color }));
}

export function useColumnConfig(options: TableColumnOption[]) {
    const columnConfigRef = ref<InstanceType<typeof TableColumnConfigDrawer>>();
    const orderedVisibleColumns = computed(() =>
        columnConfigRef.value?.orderedVisibleColumns ?? flattenWithOptions(options)
    );
    const headerGroups = computed(() => extractHeaderGroups(options));
    return { columnConfigRef, orderedVisibleColumns, headerGroups };
}
