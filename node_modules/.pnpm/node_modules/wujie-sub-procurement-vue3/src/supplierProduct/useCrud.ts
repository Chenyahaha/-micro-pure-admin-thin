import { ref, computed } from "vue";
import type { SupplierProductRow } from "./data";
import { supplierProductRows } from "./data";

function createEmptyRow(): SupplierProductRow {
  return {
    id: "",
    sku: "",
    supplier: "",
    product: "",
    moq: 0,
    price: 0,
    leadTime: "",
    qualityRate: ""
  };
}

export function useCrud() {
  const tableData = ref<SupplierProductRow[]>([...supplierProductRows]);
  const searchKeyword = ref("");

  const filteredData = computed(() => {
    return tableData.value.filter(row => {
      const kw = searchKeyword.value.toLowerCase();
      const matchKeyword =
        !kw ||
        row.sku.toLowerCase().includes(kw) ||
        row.product.toLowerCase().includes(kw) ||
        row.supplier.toLowerCase().includes(kw);
      return matchKeyword;
    });
  });

  const modalVisible = ref(false);
  const modalMode = ref<"add" | "edit">("add");
  const editingRow = ref<SupplierProductRow | null>(null);
  const formData = ref<SupplierProductRow>(createEmptyRow());

  function handleAdd() {
    modalMode.value = "add";
    editingRow.value = null;
    formData.value = createEmptyRow();
    modalVisible.value = true;
  }

  function handleEdit(row: SupplierProductRow) {
    modalMode.value = "edit";
    editingRow.value = { ...row };
    formData.value = { ...row };
    modalVisible.value = true;
  }

  function handleDelete(row: SupplierProductRow) {
    const idx = tableData.value.findIndex(r => r.id === row.id);
    if (idx !== -1) tableData.value.splice(idx, 1);
  }

  function handleSave(data: SupplierProductRow) {
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
