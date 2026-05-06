export const supplierOptions = [
  { label: "星河科技", value: "星河科技" },
  { label: "晨光电子", value: "晨光电子" },
  { label: "远成工业", value: "远成工业" }
];

export const leadTimeOptions = [
  { label: "3天", value: "3天" },
  { label: "5天", value: "5天" },
  { label: "7天", value: "7天" },
  { label: "10天", value: "10天" },
  { label: "15天", value: "15天" },
  { label: "30天", value: "30天" }
];

export const rules = {
  sku: [{ required: true, message: "请输入SKU" }],
  supplier: [{ required: true, message: "请选择供应商" }],
  product: [{ required: true, message: "请输入产品名称" }],
  moq: [{ required: true, message: "请输入最小起订量" }],
  price: [{ required: true, message: "请输入供货价" }],
  leadTime: [{ required: true, message: "请选择交期" }],
  qualityRate: [{ required: true, message: "请输入质检合格率" }]
};
