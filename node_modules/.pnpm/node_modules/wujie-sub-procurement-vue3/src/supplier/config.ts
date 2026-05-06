export const statusOptions = [
  { label: "合作中", value: "合作中" },
  { label: "观察期", value: "观察期" },
  { label: "已终止", value: "已终止" }
];

export const levelOptions = [
  { label: "A", value: "A" },
  { label: "B", value: "B" },
  { label: "C", value: "C" }
];

export const categoryOptions = [
  { label: "电子设备", value: "电子设备" },
  { label: "音视频设备", value: "音视频设备" },
  { label: "五金耗材", value: "五金耗材" },
  { label: "办公耗材", value: "办公耗材" }
];

export const rules = {
  code: [{ required: true, message: "请输入供应商编码" }],
  name: [{ required: true, message: "请输入供应商名称" }],
  level: [{ required: true, message: "请选择等级" }],
  category: [{ required: true, message: "请选择品类" }],
  contact: [{ required: true, message: "请输入联系人" }],
  phone: [
    { required: true, message: "请输入联系电话" },
    { match: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" }
  ],
  coopYears: [{ required: true, message: "请输入合作年限" }],
  status: [{ required: true, message: "请选择状态" }]
};
