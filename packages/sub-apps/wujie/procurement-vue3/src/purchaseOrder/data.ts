/** 采购订单子行：单品 / 明细 */
export interface PurchaseOrderLine {
  id: string;
  /** 子单号 / 行号 */
  no: string;
  productName: string;
  sku: string;
  /** 商品图 URL，空则显示占位 */
  image?: string;
  store?: string;
  country?: string;
  warehouse: string;
  qty: number;
  amount: number;
  status: string;
  payStatus: string;
}

/** 采购订单父级：同一批次 / 主单公用信息 */
export interface PurchaseOrderBatch {
  id: string;
  /** 批次号 / 主单号，展示为蓝色链接 */
  batchNo: string;
  supplier: string;
  buyer: string;
  /** 下单日期 YYYY-MM-DD */
  date: string;
  remark: string;
  creator: string;
  /** 创建时间，展示用 */
  createTime: string;
  children: PurchaseOrderLine[];
}

/** 表格扁平行：父行合并单元格，子行展示明细列 */
export type PurchaseOrderTableRow =
  | { key: string; rowType: "parent"; batch: PurchaseOrderBatch }
  | {
      key: string;
      rowType: "child";
      batch: PurchaseOrderBatch;
      line: PurchaseOrderLine;
    }
  | { key: string; rowType: "expand"; batch: PurchaseOrderBatch; hiddenCount: number }
  | { key: string; rowType: "collapse"; batch: PurchaseOrderBatch; totalCount: number };

const VISIBLE_SKU_LIMIT = 5;

export function flattenBatches(batches: PurchaseOrderBatch[], expandedIds: Set<string> = new Set()): PurchaseOrderTableRow[] {
  const rows: PurchaseOrderTableRow[] = [];
  for (const batch of batches) {
    rows.push({
      key: `parent-${batch.id}`,
      rowType: "parent",
      batch
    });
    const children = batch.children;
    const isExpanded = expandedIds.has(batch.id);
    const visibleLines = isExpanded ? children : children.slice(0, VISIBLE_SKU_LIMIT);

    for (const line of visibleLines) {
      rows.push({
        key: `child-${batch.id}-${line.id}`,
        rowType: "child",
        batch,
        line
      });
    }

    if (!isExpanded && children.length > VISIBLE_SKU_LIMIT) {
      rows.push({
        key: `expand-${batch.id}`,
        rowType: "expand",
        batch,
        hiddenCount: children.length - VISIBLE_SKU_LIMIT
      });
    }

    if (isExpanded && children.length > VISIBLE_SKU_LIMIT) {
      rows.push({
        key: `collapse-${batch.id}`,
        rowType: "collapse",
        batch,
        totalCount: children.length
      });
    }
  }
  return rows;
}

export function sumQty(batch: PurchaseOrderBatch): number {
  return batch.children.reduce((s, l) => s + l.qty, 0);
}

export function sumAmount(batch: PurchaseOrderBatch): number {
  return batch.children.reduce((s, l) => s + l.amount, 0);
}

export function createEmptyLine(): PurchaseOrderLine {
  return {
    id: "",
    no: "",
    productName: "",
    sku: "",
    warehouse: "",
    qty: 0,
    amount: 0,
    status: "待审核",
    payStatus: "未付款"
  };
}

export const purchaseOrderBatches: PurchaseOrderBatch[] = [
  {
    id: "b1",
    batchNo: "POG250501001",
    supplier: "星河科技",
    buyer: "李杰",
    date: "2026-04-29",
    remark: "加急补货，优先排产",
    creator: "李杰",
    createTime: "2026-04-29 09:30:15",
    children: [
      {
        id: "b1-l1",
        no: "PO-202604-001-A",
        productName: "USB-C 快充数据线 2m",
        sku: "SKU-UC-001",
        image: "",
        store: "亚马逊-US",
        country: "美国",
        warehouse: "深圳仓",
        qty: 500,
        amount: 52000,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b1-l2",
        no: "PO-202604-001-B",
        productName: "氮化镓 65W 充电器",
        sku: "SKU-GN-002",
        image: "",
        store: "亚马逊-US",
        country: "美国",
        warehouse: "深圳仓",
        qty: 200,
        amount: 104000,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b2",
    batchNo: "POG250501002",
    supplier: "晨光电子",
    buyer: "周楠",
    date: "2026-04-28",
    remark: "",
    creator: "周楠",
    createTime: "2026-04-28 14:22:08",
    children: [
      {
        id: "b2-l1",
        no: "PO-202604-002-A",
        productName: "蓝牙鼠标 静音款",
        sku: "SKU-BT-101",
        store: "Shopify-UK",
        country: "英国",
        warehouse: "东莞仓",
        qty: 1200,
        amount: 38970,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b2-l2",
        no: "PO-202604-002-B",
        productName: "机械键盘 87 键",
        sku: "SKU-KB-202",
        store: "Shopify-UK",
        country: "英国",
        warehouse: "东莞仓",
        qty: 400,
        amount: 21100,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b2-l3",
        no: "PO-202604-002-C",
        productName: "显示器支架",
        sku: "SKU-ARM-03",
        store: "eBay-DE",
        country: "德国",
        warehouse: "东莞仓",
        qty: 150,
        amount: 9800,
        status: "已下单",
        payStatus: "已付款"
      },
      {
        id: "b2-l4",
        no: "PO-202604-002-D",
        productName: "USB集线器 4口",
        sku: "SKU-HB-104",
        store: "Shopify-UK",
        country: "英国",
        warehouse: "东莞仓",
        qty: 800,
        amount: 15200,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b2-l5",
        no: "PO-202604-002-E",
        productName: "笔记本散热底座",
        sku: "SKU-CO-105",
        store: "eBay-DE",
        country: "德国",
        warehouse: "东莞仓",
        qty: 300,
        amount: 12600,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b2-l6",
        no: "PO-202604-002-F",
        productName: "无线鼠标接收器",
        sku: "SKU-RV-106",
        store: "Shopify-UK",
        country: "英国",
        warehouse: "东莞仓",
        qty: 2000,
        amount: 10000,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b2-l7",
        no: "PO-202604-002-G",
        productName: "桌面条码打印机",
        sku: "SKU-PR-107",
        store: "eBay-DE",
        country: "德国",
        warehouse: "东莞仓",
        qty: 50,
        amount: 37500,
        status: "已下单",
        payStatus: "已付款"
      },
      {
        id: "b2-l8",
        no: "PO-202604-002-H",
        productName: "人体工学鼠标垫",
        sku: "SKU-PM-108",
        store: "Shopify-UK",
        country: "英国",
        warehouse: "东莞仓",
        qty: 1500,
        amount: 6750,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b3",
    batchNo: "POG250501003",
    supplier: "远成工业",
    buyer: "吴峰",
    date: "2026-04-25",
    remark: "常规补库",
    creator: "吴峰",
    createTime: "2026-04-25 11:05:42",
    children: [
      {
        id: "b3-l1",
        no: "PO-202604-003-A",
        productName: "工业轴承套装",
        sku: "SKU-BR-88",
        warehouse: "宁波仓",
        qty: 80,
        amount: 16800,
        status: "已入库",
        payStatus: "已付款"
      }
    ]
  },
  {
    id: "b4",
    batchNo: "POG250505001",
    supplier: "星河科技",
    buyer: "王凯",
    date: "2026-05-04",
    remark: "新品试单",
    creator: "王凯",
    createTime: "2026-05-04 16:18:00",
    children: [
      {
        id: "b4-l1",
        no: "PO-202605-003-A",
        productName: "智能手环 运动版",
        sku: "SKU-WH-501",
        store: "天猫旗舰店",
        country: "中国",
        warehouse: "深圳仓",
        qty: 2000,
        amount: 103000,
        status: "已入库",
        payStatus: "已付款"
      },
      {
        id: "b4-l2",
        no: "PO-202605-003-B",
        productName: "手环腕带 替换装",
        sku: "SKU-WH-502",
        store: "天猫旗舰店",
        country: "中国",
        warehouse: "深圳仓",
        qty: 5000,
        amount: 100000,
        status: "已入库",
        payStatus: "已付款"
      }
    ]
  },
  {
    id: "b5",
    batchNo: "POG250505002",
    supplier: "晨光电子",
    buyer: "陈静",
    date: "2026-05-03",
    remark: "季度补货",
    creator: "陈静",
    createTime: "2026-05-03 08:45:30",
    children: [
      {
        id: "b5-l1",
        no: "PO-202605-004-A",
        productName: "无线降噪耳机",
        sku: "SKU-NC-301",
        store: "亚马逊-JP",
        country: "日本",
        warehouse: "上海仓",
        qty: 300,
        amount: 87000,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b5-l2",
        no: "PO-202605-004-B",
        productName: "Type-C 扩展坞 7合1",
        sku: "SKU-HB-302",
        store: "亚马逊-JP",
        country: "日本",
        warehouse: "上海仓",
        qty: 600,
        amount: 54000,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b6",
    batchNo: "POG250505003",
    supplier: "远成工业",
    buyer: "张磊",
    date: "2026-05-02",
    remark: "",
    creator: "张磊",
    createTime: "2026-05-02 10:12:05",
    children: [
      {
        id: "b6-l1",
        no: "PO-202605-005-A",
        productName: "不锈钢法兰盘 DN50",
        sku: "SKU-FL-110",
        store: "阿里巴巴",
        country: "中国",
        warehouse: "宁波仓",
        qty: 500,
        amount: 22500,
        status: "已入库",
        payStatus: "已付款"
      },
      {
        id: "b6-l2",
        no: "PO-202605-005-B",
        productName: "液压油缸 63/40-200",
        sku: "SKU-HY-111",
        store: "阿里巴巴",
        country: "中国",
        warehouse: "宁波仓",
        qty: 50,
        amount: 37500,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b6-l3",
        no: "PO-202605-005-C",
        productName: "伺服电机 750W",
        sku: "SKU-SV-112",
        warehouse: "宁波仓",
        qty: 30,
        amount: 54000,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b7",
    batchNo: "POG250505004",
    supplier: "星河科技",
    buyer: "赵婷",
    date: "2026-05-01",
    remark: "大促备货",
    creator: "赵婷",
    createTime: "2026-05-01 15:33:22",
    children: [
      {
        id: "b7-l1",
        no: "PO-202605-006-A",
        productName: "手机支架 车载款",
        sku: "SKU-HD-401",
        store: "Shopee-TH",
        country: "泰国",
        warehouse: "深圳仓",
        qty: 3000,
        amount: 42000,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b8",
    batchNo: "POG250505005",
    supplier: "晨光电子",
    buyer: "李杰",
    date: "2026-04-30",
    remark: "欧洲仓调拨",
    creator: "李杰",
    createTime: "2026-04-30 09:08:17",
    children: [
      {
        id: "b8-l1",
        no: "PO-202605-007-A",
        productName: "电子白板 65寸",
        sku: "SKU-WB-600",
        store: "亚马逊-DE",
        country: "德国",
        warehouse: "汉堡仓",
        qty: 20,
        amount: 64000,
        status: "已下单",
        payStatus: "已付款"
      },
      {
        id: "b8-l2",
        no: "PO-202605-007-B",
        productName: "投影仪支架 天花款",
        sku: "SKU-PJ-601",
        store: "亚马逊-DE",
        country: "德国",
        warehouse: "汉堡仓",
        qty: 100,
        amount: 8500,
        status: "已入库",
        payStatus: "已付款"
      }
    ]
  },
  {
    id: "b9",
    batchNo: "POG250505006",
    supplier: "远成工业",
    buyer: "周楠",
    date: "2026-04-27",
    remark: "样品确认后大批量",
    creator: "周楠",
    createTime: "2026-04-27 13:50:40",
    children: [
      {
        id: "b9-l1",
        no: "PO-202605-008-A",
        productName: "铝合金压铸件 A380",
        sku: "SKU-DC-700",
        store: "eBay-US",
        country: "美国",
        warehouse: "东莞仓",
        qty: 1000,
        amount: 45000,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b9-l2",
        no: "PO-202605-008-B",
        productName: "CNC 精加工件",
        sku: "SKU-CN-701",
        warehouse: "东莞仓",
        qty: 200,
        amount: 36000,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b10",
    batchNo: "POG250505007",
    supplier: "星河科技",
    buyer: "吴峰",
    date: "2026-05-05",
    remark: "",
    creator: "吴峰",
    createTime: "2026-05-05 07:20:55",
    children: [
      {
        id: "b10-l1",
        no: "PO-202605-009-A",
        productName: "便携式储能电源 600W",
        sku: "SKU-PS-800",
        store: "亚马逊-US",
        country: "美国",
        warehouse: "深圳仓",
        qty: 100,
        amount: 78000,
        status: "已下单",
        payStatus: "部分付款"
      },
      {
        id: "b10-l2",
        no: "PO-202605-009-B",
        productName: "太阳能板 100W 折叠",
        sku: "SKU-SP-801",
        store: "亚马逊-US",
        country: "美国",
        warehouse: "深圳仓",
        qty: 200,
        amount: 46000,
        status: "已下单",
        payStatus: "未付款"
      },
      {
        id: "b10-l3",
        no: "PO-202605-009-C",
        productName: "DC 车充转接头",
        sku: "SKU-DC-802",
        store: "亚马逊-US",
        country: "美国",
        warehouse: "深圳仓",
        qty: 500,
        amount: 7500,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b11",
    batchNo: "POG250505008",
    supplier: "晨光电子",
    buyer: "王凯",
    date: "2026-05-04",
    remark: "东南亚站点首批",
    creator: "王凯",
    createTime: "2026-05-04 11:40:33",
    children: [
      {
        id: "b11-l1",
        no: "PO-202605-010-A",
        productName: "智能门锁 指纹版",
        sku: "SKU-LK-900",
        store: "Lazada-MY",
        country: "马来西亚",
        warehouse: "吉隆坡仓",
        qty: 150,
        amount: 52500,
        status: "待审核",
        payStatus: "未付款"
      }
    ]
  },
  {
    id: "b12",
    batchNo: "POG250505009",
    supplier: "远成工业",
    buyer: "陈静",
    date: "2026-05-03",
    remark: "客户定制规格",
    creator: "陈静",
    createTime: "2026-05-03 17:05:12",
    children: [
      {
        id: "b12-l1",
        no: "PO-202605-011-A",
        productName: "非标轴承 6205-2RS",
        sku: "SKU-NB-1000",
        store: "阿里巴巴",
        country: "中国",
        warehouse: "宁波仓",
        qty: 2000,
        amount: 30000,
        status: "已入库",
        payStatus: "已付款"
      },
      {
        id: "b12-l2",
        no: "PO-202605-011-B",
        productName: "密封圈 NBR O型",
        sku: "SKU-SR-1001",
        warehouse: "宁波仓",
        qty: 10000,
        amount: 8000,
        status: "已入库",
        payStatus: "已付款"
      }
    ]
  },
  {
    id: "b13",
    batchNo: "POG250505010",
    supplier: "星河科技",
    buyer: "赵婷",
    date: "2026-05-05",
    remark: "6·18 备战",
    creator: "赵婷",
    createTime: "2026-05-05 10:22:48",
    children: [
      {
        id: "b13-l1",
        no: "PO-202605-012-A",
        productName: "无线充电器 15W",
        sku: "SKU-WC-1100",
        store: "京东自营",
        country: "中国",
        warehouse: "上海仓",
        qty: 5000,
        amount: 175000,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b13-l2",
        no: "PO-202605-012-B",
        productName: "快充头 33W GaN",
        sku: "SKU-GC-1101",
        store: "京东自营",
        country: "中国",
        warehouse: "上海仓",
        qty: 8000,
        amount: 280000,
        status: "待审核",
        payStatus: "未付款"
      },
      {
        id: "b13-l3",
        no: "PO-202605-012-C",
        productName: "数据线三合一 1.5m",
        sku: "SKU-CB-1102",
        store: "京东自营",
        country: "中国",
        warehouse: "上海仓",
        qty: 10000,
        amount: 60000,
        status: "已下单",
        payStatus: "部分付款"
      }
    ]
  },
  {
    id: "b14",
    batchNo: "POG250505011",
    supplier: "晨光电子",
    buyer: "张磊",
    date: "2026-05-02",
    remark: "韩国站测试单",
    creator: "张磊",
    createTime: "2026-05-02 14:58:01",
    children: [
      {
        id: "b14-l1",
        no: "PO-202605-013-A",
        productName: "韩版折叠台灯",
        sku: "SKU-LP-1200",
        store: "Coupang",
        country: "韩国",
        warehouse: "仁川仓",
        qty: 400,
        amount: 32000,
        status: "已下单",
        payStatus: "部分付款"
      }
    ]
  }
];
