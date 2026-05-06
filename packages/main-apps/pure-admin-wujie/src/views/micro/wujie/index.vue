<script setup lang="ts">
import WujieVue from "wujie-vue3";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const appName = computed(() => {
  return String(route.meta.microAppName || route.name || "sub-app");
});

const appUrl = computed(() => {
  return String(route.meta.microAppUrl || "");
});

const appAlive = computed(() => {
  return route.meta.microAppAlive !== false;
});
</script>

<template>
  <div class="wujie-page">
    <el-empty
      v-if="!appUrl"
      description="未配置微应用地址，请检查环境变量 VITE_WUJIE_*"
    />
    <WujieVue
      v-else
      :name="appName"
      :url="appUrl"
      :alive="appAlive"
      :sync="false"
      width="100%"
      height="100%"
    />
  </div>
</template>

<style scoped lang="scss">
.wujie-page {
  height: calc(100vh - 140px);
  min-height: 600px;
  box-sizing: border-box;
}
</style>
