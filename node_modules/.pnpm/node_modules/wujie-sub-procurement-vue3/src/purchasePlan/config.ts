export const statusOptions = [
  { label: "待审批", value: "待审批" },
  { label: "执行中", value: "执行中" },
  { label: "已完成", value: "已完成" }
];

export const deptOptions = [
  { label: "信息部", value: "信息部" },
  { label: "行政部", value: "行政部" },
  { label: "采购部", value: "采购部" },
  { label: "财务部", value: "财务部" },
  { label: "市场部", value: "市场部" }
];

export const rules = {
  no: [{ required: true, message: "请输入计划编号" }],
  dept: [{ required: true, message: "请选择申请部门" }],
  item: [{ required: true, message: "请输入采购项目" }],
  qty: [{ required: true, message: "请输入数量" }],
  budget: [{ required: true, message: "请输入预算" }],
  owner: [{ required: true, message: "请输入负责人" }],
  status: [{ required: true, message: "请选择状态" }],
  expectDate: [{ required: true, message: "请选择期望到货日期" }]
};
