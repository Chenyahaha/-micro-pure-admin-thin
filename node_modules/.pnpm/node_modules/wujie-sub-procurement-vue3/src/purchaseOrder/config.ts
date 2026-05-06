export const statusOptions = [
  { label: "待审核", value: "待审核" },
  { label: "已下单", value: "已下单" },
  { label: "已入库", value: "已入库" }
];

export const payStatusOptions = [
  { label: "未付款", value: "未付款" },
  { label: "部分付款", value: "部分付款" },
  { label: "已付款", value: "已付款" }
];

export const supplierOptions = [
  { label: "星河科技", value: "星河科技" },
  { label: "晨光电子", value: "晨光电子" },
  { label: "远成工业", value: "远成工业" }
];

export const rules = {
  batchNo: [{ required: true, message: "请输入批次号 / 主单号" }],
  supplier: [{ required: true, message: "请选择供应商" }],
  buyer: [{ required: true, message: "请输入采购员" }],
  date: [{ required: true, message: "请选择下单日期" }],
  creator: [{ required: true, message: "请输入创建人" }]
};
