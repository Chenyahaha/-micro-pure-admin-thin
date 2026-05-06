import { ref, computed } from "vue";
import type { PurchaseOrderBatch } from "./data";
import {
  purchaseOrderBatches,
  createEmptyLine
} from "./data";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function nowDateTime() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function createEmptyBatch(): PurchaseOrderBatch {
  return {
    id: "",
    batchNo: "",
    supplier: "",
    buyer: "",
    date: "",
    remark: "",
    creator: "",
    createTime: nowDateTime(),
    children: [createEmptyLine()]
  };
}

export function useCrud() {
  const tableData = ref<PurchaseOrderBatch[]>(
    JSON.parse(JSON.stringify(purchaseOrderBatches)) as PurchaseOrderBatch[]
  );

  const searchKeyword = ref("");
  const searchPayStatus = ref("");

  function rowMatchesKeyword(batch: PurchaseOrderBatch, kw: string) {
    if (!kw) return true;
    const hay = [
      batch.batchNo,
      batch.supplier,
      batch.buyer,
      batch.remark,
      batch.creator,
      ...batch.children.flatMap((c) => [
        c.no,
        c.productName,
        c.sku,
        c.warehouse,
        c.store ?? "",
        c.country ?? ""
      ])
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(kw);
  }

  function lineMatchesPay(line: PurchaseOrderBatch["children"][number]) {
    return !searchPayStatus.value || line.payStatus === searchPayStatus.value;
  }

  /** 关键词 + 付款状态（至少一条子行满足付款筛选）；订单状态由页面 Tab 再筛 */
  const filteredBatches = computed(() => {
    const kw = searchKeyword.value.trim().toLowerCase();
    return tableData.value.filter((batch) => {
      if (!rowMatchesKeyword(batch, kw)) return false;
      if (!searchPayStatus.value) return true;
      return batch.children.some((line) => lineMatchesPay(line));
    });
  });

  const modalVisible = ref(false);
  const modalMode = ref<"add" | "edit">("add");
  const editingBatchId = ref<string | null>(null);
  const formData = ref<PurchaseOrderBatch>(createEmptyBatch());

  function handleAdd() {
    modalMode.value = "add";
    editingBatchId.value = null;
    formData.value = createEmptyBatch();
    modalVisible.value = true;
  }

  function handleEditBatch(batch: PurchaseOrderBatch) {
    modalMode.value = "edit";
    editingBatchId.value = batch.id;
    formData.value = JSON.parse(JSON.stringify(batch)) as PurchaseOrderBatch;
    modalVisible.value = true;
  }

  /** 编辑整单（从子行入口进入，仍编辑所属批次） */
  function handleEditFromLine(batch: PurchaseOrderBatch) {
    handleEditBatch(batch);
  }

  function handleDeleteBatch(batch: PurchaseOrderBatch) {
    const idx = tableData.value.findIndex((b) => b.id === batch.id);
    if (idx !== -1) tableData.value.splice(idx, 1);
  }

  function handleDeleteLine(batch: PurchaseOrderBatch, line: PurchaseOrderBatch["children"][number]) {
    const b = tableData.value.find((x) => x.id === batch.id);
    if (!b) return;
    const li = b.children.findIndex((l) => l.id === line.id);
    if (li === -1) return;
    b.children.splice(li, 1);
    if (b.children.length === 0) {
      handleDeleteBatch(b);
    }
  }

  function nextBatchNo() {
    const t = new Date();
    const y = t.getFullYear();
    const m = pad(t.getMonth() + 1);
    const d = pad(t.getDate());
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `POG${String(y).slice(2)}${m}${d}${rand}`;
  }

  function handleSave(data: PurchaseOrderBatch) {
    if (modalMode.value === "add") {
      const id = `b-${Date.now()}`;
      const lines = data.children.map((l, i) => ({
        ...l,
        id: l.id || `l-${Date.now()}-${i}`,
        no: l.no || `${data.batchNo || nextBatchNo()}-${String(i + 1).padStart(2, "0")}`
      }));
      tableData.value.push({
        ...data,
        id,
        batchNo: data.batchNo || nextBatchNo(),
        createTime: data.createTime || nowDateTime(),
        children: lines
      });
    } else {
      const idx = tableData.value.findIndex((b) => b.id === editingBatchId.value);
      if (idx !== -1) {
        const lines = data.children.map((l, i) => ({
          ...l,
          id: l.id || `l-${Date.now()}-${i}`,
          no: l.no || `${data.batchNo}-${String(i + 1).padStart(2, "0")}`
        }));
        tableData.value.splice(idx, 1, { ...data, id: data.id, children: lines });
      }
    }
    modalVisible.value = false;
  }

  return {
    tableData,
    searchKeyword,
    searchPayStatus,
    filteredBatches,
    modalVisible,
    modalMode,
    formData,
    handleAdd,
    handleEditBatch,
    handleEditFromLine,
    handleDeleteBatch,
    handleDeleteLine,
    handleSave
  };
}
