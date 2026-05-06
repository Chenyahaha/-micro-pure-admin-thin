export interface PurchasePlanRow {
  id: string;
  no: string;
  dept: string;
  item: string;
  qty: number;
  budget: number;
  owner: string;
  status: string;
  expectDate: string;
}

export const purchasePlanRows: PurchasePlanRow[] = [
  {
    id: "pp-1",
    no: "PP-202604-001",
    dept: "信息部",
    item: "办公电脑",
    qty: 30,
    budget: 180000,
    owner: "李杰",
    status: "待审批",
    expectDate: "2026-05-15"
  },
  {
    id: "pp-2",
    no: "PP-202604-002",
    dept: "行政部",
    item: "会议平板",
    qty: 6,
    budget: 54000,
    owner: "周楠",
    status: "执行中",
    expectDate: "2026-05-10"
  },
  {
    id: "pp-3",
    no: "PP-202604-003",
    dept: "采购部",
    item: "条码扫码枪",
    qty: 20,
    budget: 24000,
    owner: "吴峰",
    status: "已完成",
    expectDate: "2026-04-28"
  }
];
