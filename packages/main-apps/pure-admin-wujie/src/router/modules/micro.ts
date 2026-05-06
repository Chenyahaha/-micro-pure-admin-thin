const Layout = () => import("@/layout/index.vue");

const {
  VITE_WUJIE_SUB_APP_VUE3,
  VITE_WUJIE_SUB_APP_REACT,
  VITE_WUJIE_SUB_APP_VUE2,
  VITE_WUJIE_SUB_APP_PROCUREMENT
} = import.meta.env;

export default {
  path: "/micro",
  name: "Micro",
  component: Layout,
  redirect: "/micro/vue3",
  meta: {
    icon: "ri/apps-2-line",
    title: "微前端",
    rank: 10
  },
  children: [
    {
      path: "/micro/vue3",
      name: "MicroVue3",
      component: () => import("@/views/micro/wujie/index.vue"),
      meta: {
        title: "子应用-Vue3",
        keepAlive: true,
        microAppAlive: true,
        microAppName: "sub-vue3",
        microAppUrl: VITE_WUJIE_SUB_APP_VUE3
      }
    },
    {
      path: "/micro/react",
      name: "MicroReact",
      component: () => import("@/views/micro/wujie/index.vue"),
      meta: {
        title: "子应用-React",
        keepAlive: true,
        microAppAlive: true,
        microAppName: "sub-react",
        microAppUrl: VITE_WUJIE_SUB_APP_REACT
      }
    },
    {
      path: "/micro/vue2",
      name: "MicroVue2",
      component: () => import("@/views/micro/wujie/index.vue"),
      meta: {
        title: "子应用-Vue2",
        keepAlive: true,
        microAppAlive: true,
        microAppName: "sub-vue2",
        microAppUrl: VITE_WUJIE_SUB_APP_VUE2
      }
    },
    {
      path: "/micro/procurement",
      name: "MicroProcurement",
      component: () => import("@/views/micro/parent.vue"),
      meta: {
        title: "采购子应用",
        icon: "ri/shopping-cart-2-line"
      },
      redirect: "/micro/procurement/purchase-plan",
      children: [
        {
          path: "/micro/procurement/purchase-plan",
          name: "MicroProcurementPlan",
          component: () => import("@/views/micro/wujie/index.vue"),
          meta: {
            title: "采购计划",
            keepAlive: true,
            microAppAlive: true,
            microAppName: "sub-procurement-plan",
            microAppUrl: `${VITE_WUJIE_SUB_APP_PROCUREMENT}#/purchase-plan`
          }
        },
        {
          path: "/micro/procurement/supplier",
          name: "MicroProcurementSupplier",
          component: () => import("@/views/micro/wujie/index.vue"),
          meta: {
            title: "供应商",
            keepAlive: true,
            microAppAlive: true,
            microAppName: "sub-procurement-supplier",
            microAppUrl: `${VITE_WUJIE_SUB_APP_PROCUREMENT}#/supplier`
          }
        },
        {
          path: "/micro/procurement/supplier-product",
          name: "MicroProcurementSupplierProduct",
          component: () => import("@/views/micro/wujie/index.vue"),
          meta: {
            title: "供应商产品",
            keepAlive: true,
            microAppAlive: true,
            microAppName: "sub-procurement-supplier-product",
            microAppUrl: `${VITE_WUJIE_SUB_APP_PROCUREMENT}#/supplier-product`
          }
        },
        {
          path: "/micro/procurement/purchase-order",
          name: "MicroProcurementOrder",
          component: () => import("@/views/micro/wujie/index.vue"),
          meta: {
            title: "采购订单",
            keepAlive: true,
            microAppAlive: true,
            microAppName: "sub-procurement-order",
            microAppUrl: `${VITE_WUJIE_SUB_APP_PROCUREMENT}#/purchase-order`
          }
        }
      ]
    }
  ]
} satisfies RouteConfigsTable;
