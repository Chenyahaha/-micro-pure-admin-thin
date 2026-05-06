# pure-admin micro workspace

当前工作区仅保留 `wujie` 微前端方案。

## 目录结构

- `packages/main-apps/pure-admin-wujie`：主应用（微前端容器）
- `packages/sub-apps/wujie/procurement-vue3`：采购子应用
- `packages/sub-apps/wujie/vue3`：Vue3 示例子应用
- `packages/shared/xingjia-ui`：共享 UI 组件

## 完整启动步骤

### 1) 进入项目根目录

```bash
cd /d D:\project\zj\pure-admin-thin-main
```

### 2) 安装依赖（首次或依赖变更后）

```bash
pnpm install
```

### 3) 一条命令启动全部（推荐）

```bash
pnpm dev:all
```

该命令会并行启动：

- 主应用：`packages/main-apps/pure-admin-wujie`
- 采购子应用：`packages/sub-apps/wujie/procurement-vue3`
- Vue3 示例子应用：`packages/sub-apps/wujie/vue3`

### 4) 访问地址

- 主应用：`http://localhost:8848/`（若占用会自动切换端口，以终端输出为准）
- 采购子应用：`http://localhost:7204/`
- Vue3 子应用：`http://localhost:7201/`

### 5) 分开启动（可选）

如果你不想并行启动全部，也可以开多个终端分别执行：

```bash
pnpm wujie:dev
pnpm --dir "packages/sub-apps/wujie/procurement-vue3" dev --force
pnpm --dir "packages/sub-apps/wujie/vue3" dev --force
```

## 常用验证命令

```bash
pnpm --dir "packages/main-apps/pure-admin-wujie" exec tsc --noEmit
pnpm --dir "packages/sub-apps/wujie/procurement-vue3" build
pnpm --dir "packages/sub-apps/wujie/vue3" build
pnpm --dir "packages/shared/xingjia-ui" exec tsc --noEmit
```

## 打包步骤

### 1) 安装依赖

```bash
pnpm install
```

### 2) 推荐：按顺序分别打包

```bash
pnpm --dir "packages/main-apps/pure-admin-wujie" build
pnpm --dir "packages/sub-apps/wujie/procurement-vue3" build
pnpm --dir "packages/sub-apps/wujie/vue3" build
```

### 3) 可选：一条命令并行打包

```bash
pnpm -r --parallel --stream --filter "./packages/main-apps/pure-admin-wujie" --filter "./packages/sub-apps/wujie/procurement-vue3" --filter "./packages/sub-apps/wujie/vue3" build
```

### 4) 打包产物目录

- 主应用：`packages/main-apps/pure-admin-wujie/dist`
- 采购子应用：`packages/sub-apps/wujie/procurement-vue3/dist`
- Vue3 子应用：`packages/sub-apps/wujie/vue3/dist`

## 手动新增一个子应用（完整流程）

下面以新增 `inventory-vue3`（库存子应用）为例。

### 1) 创建子应用目录

在 `packages/sub-apps/wujie` 下新建目录：

- `packages/sub-apps/wujie/inventory-vue3`

建议最少包含：

- `package.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `src/main.ts`
- `src/App.vue`
- `src/env.d.ts`

### 2) 配置子应用 `package.json`

至少保证有 `dev/build/preview` 脚本，并指定一个不冲突端口（示例 `7205`）：

```json
{
  "name": "wujie-sub-inventory-vue3",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 7205",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 7205"
  }
}
```

依赖建议参考现有 `procurement-vue3` 或 `vue3` 子应用。

### 3) 在主应用配置子应用地址（环境变量）

编辑 `packages/main-apps/pure-admin-wujie/.env.development`，新增：

```env
VITE_WUJIE_SUB_APP_INVENTORY=http://localhost:7205/
```

### 4) 在主应用菜单路由中接入

编辑 `packages/main-apps/pure-admin-wujie/src/router/modules/micro.ts`，新增一个菜单路由，核心是以下 meta：

- `microAppName`：子应用唯一名称（例如 `sub-inventory`）
- `microAppUrl`：子应用地址（对应上一步 env）
- `microAppAlive`：是否保活（通常设为 `true`）

页面组件沿用：`@/views/micro/wujie/index.vue`。

### 5)（可选）补充类型声明

如果主应用有 `ViteEnv` 约束，编辑：

- `packages/main-apps/pure-admin-wujie/types/global.d.ts`

新增：

- `VITE_WUJIE_SUB_APP_INVENTORY: string`

### 6) 安装依赖并启动验证

```bash
pnpm install
pnpm --dir "packages/sub-apps/wujie/inventory-vue3" dev --force
pnpm wujie:dev
```

在主应用菜单点击新子应用，确认能正常加载。

### 7) 加入一键启动与打包（可选）

如果要纳入根脚本：

- 编辑根 `package.json` 的 `dev:all`，追加 filter：
  - `--filter "./packages/sub-apps/wujie/inventory-vue3"`
- 打包时同理追加到并行 build 命令。

## 常见问题

- 浏览器仍请求旧 `micro-ui` 路径时，先 `Ctrl + F5` 强刷。
- 如果 IDE 报“找不到模块”但构建正常，执行 `TypeScript: Restart TS Server`。
