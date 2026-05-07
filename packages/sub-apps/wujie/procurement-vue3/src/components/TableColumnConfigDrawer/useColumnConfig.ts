import { ref, computed } from 'vue';
import TableColumnConfigDrawer from './TableColumnConfigDrawer.vue';
import type { TableColumnOption } from './TableColumnConfigDrawer.vue';

export function useColumnConfig(options: TableColumnOption[]) {
    const columnConfigRef = ref<InstanceType<typeof TableColumnConfigDrawer>>();
    const orderedVisibleColumns = computed(() => columnConfigRef.value?.orderedVisibleColumns ?? options.map(c => ({ ...c, fixed: undefined as 'left' | 'right' | undefined })));
    return { columnConfigRef, orderedVisibleColumns };
}
