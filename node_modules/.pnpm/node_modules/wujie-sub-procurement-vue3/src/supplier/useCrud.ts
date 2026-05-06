import { ref, computed } from "vue";
import type { SupplierRow } from "./data";
import { supplierRows } from "./data";

function createEmptyRow(): SupplierRow {
  return {
    id: "",
    code: "",
    name: "",
    level: "",
    category: "",
    contact: "",
    phone: "",
    coopYears: 0,
    status: ""
  };
}

export function useCrud() {
  const tableData = ref<SupplierRow[]>([...supplierRows]);
  const searchKeyword = ref("");
  const searchStatus = ref("");

  const filteredData = computed(() => {
    return tableData.value.filter(row => {
      const kw = searchKeyword.value.toLowerCase();
      const matchKeyword =
        !kw ||
        row.code.toLowerCase().includes(kw) ||
        row.name.toLowerCase().includes(kw) ||
        row.contact.toLowerCase().includes(kw);
      const matchStatus = !searchStatus.value || row.status === searchStatus.value;
      return matchKeyword && matchStatus;
    });
  });

  const modalVisible = ref(false);
  const modalMode = ref<"add" | "edit">("add");
  const editingRow = ref<SupplierRow | null>(null);
  const formData = ref<SupplierRow>(createEmptyRow());

  function handleAdd() {
    modalMode.value = "add";
    editingRow.value = null;
    formData.value = createEmptyRow();
    modalVisible.value = true;
  }

  function handleEdit(row: SupplierRow) {
    modalMode.value = "edit";
    editingRow.value = { ...row };
    formData.value = { ...row };
    modalVisible.value = true;
  }

  function handleDelete(row: SupplierRow) {
    const idx = tableData.value.findIndex(r => r.id === row.id);
    if (idx !== -1) tableData.value.splice(idx, 1);
  }

  function handleSave(data: SupplierRow) {
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
