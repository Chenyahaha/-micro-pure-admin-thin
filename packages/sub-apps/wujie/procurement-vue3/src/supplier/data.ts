export interface SupplierRow {
  id: string;
  code: string;
  name: string;
  level: string;
  category: string;
  contact: string;
  phone: string;
  coopYears: number;
  status: string;
}

export const supplierRows: SupplierRow[] = [
  {
    id: "s-1",
    code: "S-001",
    name: "星河科技",
    level: "A",
    category: "电子设备",
    contact: "王凯",
    phone: "13800001111",
    coopYears: 5,
    status: "合作中"
  },
  {
    id: "s-2",
    code: "S-002",
    name: "晨光电子",
    level: "B",
    category: "音视频设备",
    contact: "刘婷",
    phone: "13800002222",
    coopYears: 2,
    status: "合作中"
  },
  {
    id: "s-3",
    code: "S-003",
    name: "远成工业",
    level: "C",
    category: "五金耗材",
    contact: "陈诺",
    phone: "13800003333",
    coopYears: 1,
    status: "观察期"
  }
];
