import type { App, Plugin } from "vue";
import { Select } from "@arco-design/web-vue";
import "./styles/popup.css";
import PageModal from "./components/feedback/PageModal.vue";

export { PageModal };

function patchSelectPopupContainer() {
  const selectProps = (Select as any).props || {};
  if (selectProps.popupContainer && !selectProps.popupContainer.default) {
    selectProps.popupContainer.default = ".page-popup-container";
  }
}

export const XingjiaUiPlugin: Plugin = {
  install(app: App) {
    patchSelectPopupContainer();
    app.component("PageModal", PageModal);
  }
};

export default XingjiaUiPlugin;
