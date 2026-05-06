import { createRouter, createWebHashHistory } from "vue-router";
import PurchasePlanPage from "./purchasePlan/index.vue";
import SupplierPage from "./supplier/index.vue";
import SupplierProductPage from "./supplierProduct/index.vue";
import PurchaseOrderPage from "./purchaseOrder/index.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", redirect: "/purchase-plan" },
    { path: "/purchase-plan", component: PurchasePlanPage },
    { path: "/supplier", component: SupplierPage },
    { path: "/supplier-product", component: SupplierProductPage },
    { path: "/purchase-order", component: PurchaseOrderPage }
  ]
});

export default router;
