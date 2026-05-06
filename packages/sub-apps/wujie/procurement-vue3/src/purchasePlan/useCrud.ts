import { ref, computed } from "vue";
import type { PurchasePlanRow } from "./data";
import { purchasePlanRows } from "./data";

function createEmptyRow(): PurchasePlanRow {
  return {
    id: "",
    no: "",
    dept: "",
    item: "",
    qty: 0,
    budget: 0,
    owner: "",
    status: "",
    expectDate: ""
  };
}

export function useCrud() {
  const tableData = ref<PurchasePlanRow[]>([...purchasePlanRows]);
  const searchKeyword = ref("");
  const searchStatus = ref("");

  const filteredData = computed(() => {
    return tableData.value.filter(row => {
      const kw = searchKeyword.value.toLowerCase();
      const matchKeyword =
        !kw ||
        row.no.toLowerCase().includes(kw) ||
        row.item.toLowerCase().includes(kw) ||
        row.owner.toLowerCase().includes(kw);
      const matchStatus = !searchStatus.value || row.status === searchStatus.value;
      return matchKeyword && matchStatus;
    });
  });

  const modalVisible = ref(false);
  const modalMode = ref<"add" | "edit">("add");
  const editingRow = ref<PurchasePlanRow | null>(null);
  const formData = ref<PurchasePlanRow>(createEmptyRow());

  function handleAdd() {
    modalMode.value = "add";
    editingRow.value = null;
    formData.value = createEmptyRow();
    modalVisible.value = true;
  }

  function handleEdit(row: PurchasePlanRow) {
    modalMode.value = "edit";
    editingRow.value = { ...row };
    formData.value = { ...row };
    modalVisible.value = true;
  }

  function handleDelete(row: PurchasePlanRow) {
    const idx = tableData.value.findIndex(r => r.id === row.id);
    if (idx !== -1) tableData.value.splice(idx, 1);
  }

  function handleSave(data: PurchasePlanRow) {
    if (modalMode.value === "add") {
      tableData.value.push({ ...data, id: String(Date.now()) });
    } else {
      const idx = tableData.value.findIndex(r => r.id === editingRow.value!.id);
      if (idx !== -1) tableData.value.splice(idx, 1, { ...data });
    }
    modalVisible.value = false;
  }

  return {
    tableData,
    searchKeyword,
    searchStatus,
    filteredData,
    modalVisible,
    modalMode,
    formData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave
  };
}
