# 星伽 UI 使用教程

本文档提供两种接入方式：**直接复制源码** 与 **本地包依赖**。

## 方式一：直接复制源码（最简单）

将 `shared/xingjia-ui` 目录复制到目标项目（示例：`src/shared/xingjia-ui`）。

### 1) 在入口引入样式

```ts
import "@/shared/xingjia-ui/src/styles/popup.css"; // 引入局部弹层样式能力
```

### 2) 在页面中按需引入组件

```ts
import { PageModal } from "@/shared/xingjia-ui/src"; // 从源码入口导入组件
```

### 3) 在模板中使用

```vue
<PageModal v-model:visible="open" title="新增采购订单"> <!-- 绑定显示状态 + 标题 -->
  <div>这里放表单内容</div> <!-- 自定义弹窗内容 -->
</PageModal>
```

## 方式二：作为本地依赖使用（推荐多人协作）

如果目标项目支持 `file:` 本地依赖，可在目标项目 `package.json` 添加：

```json
{
  "dependencies": {
    "@xingjia/ui": "file:./shared/xingjia-ui"
  }
}
```

然后执行安装：

```bash
pnpm install
```

代码中使用：

```ts
import "@xingjia/ui/style.css"; // 引入共享样式
import { PageModal } from "@xingjia/ui"; // 导入组件
```

## 依赖要求

- Vue 3.x（必需）
- `@arco-design/web-vue`（PageModal 依赖 a-modal）
