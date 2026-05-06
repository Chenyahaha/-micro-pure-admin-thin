export interface SupplierProductRow {
  id: string;
  sku: string;
  supplier: string;
  product: string;
  moq: number;
  price: number;
  leadTime: string;
  qualityRate: string;
}

export const supplierProductRows: SupplierProductRow[] = [
  {
    id: "sp-1",
    sku: "SP-1001",
    supplier: "星河科技",
    product: "商务笔记本 14寸",
    moq: 10,
    price: 5200,
    leadTime: "7天",
    qualityRate: "99.3%"
  },
  {
    id: "sp-2",
    sku: "SP-1002",
    supplier: "晨光电子",
    product: "蓝牙会议音箱",
    moq: 20,
    price: 1299,
    leadTime: "5天",
    qualityRate: "98.7%"
  },
  {
    id: "sp-3",
    sku: "SP-1003",
    supplier: "远成工业",
    product: "工业标签打印纸",
    moq: 100,
    price: 12,
    leadTime: "3天",
    qualityRate: "97.9%"
  }
];
