# PR: Windows 平台适配、Bug 修复与用户体验优化

> **Fork**: [sjkncs/Qclaw](https://github.com/sjkncs/Qclaw) → **上游**: [qiuzhi2046/Qclaw](https://github.com/qiuzhi2046/Qclaw)

## 概述

本 PR 针对 Qclaw 项目进行了 **Windows 平台全面适配**、**用户体验优化** 以及多项 **Bug 修复**，旨在让 Windows 用户也能流畅使用 Qclaw。所有改动均经过 TypeScript 编译验证，开发服务器可正常启动。

---

## 1. 🪟 Windows 平台适配（回应 Issue #6、#7、#11）

### 1.1 npm 全局安装路径嵌套修复

- **问题**：Windows 上 npm 全局安装 OpenClaw 后，实际路径可能嵌套在 `node_modules\node_modules\openclaw` 下，导致 Qclaw 无法正确定位 CLI
- **修复**：在 `electron/main/openclaw-package.ts` 中新增 Windows 专属的路径解析逻辑，支持从 npm prefix 推导正确的 binary 路径
- **验证**：新增单元测试覆盖 `APPDATA` fallback 和 npm prefix 查找场景

### 1.2 macOS 专属命令在 Windows 上的误调用

- **问题**：主进程代码中使用了 `osascript`（macOS AppleScript 命令），在 Windows 上执行会抛出 `spawn EINVAL` 错误
- **修复**：在 `electron/main/cli.ts` 中添加平台判断，确保仅在 macOS 上调用 `osascript`
- **影响范围**：消除了 Windows 启动时的致命错误

### 1.3 CLI 命令映射 (.cmd)

- **问题**：Windows 下直接 `spawn('openclaw', ...)` 无法找到命令，因为 npm 在 Windows 上生成的是 `.cmd` 包装脚本
- **修复**：
  - 在 `resolveCommandForShelllessSpawn()` 中为 `openclaw` 添加 `.cmd` 后缀映射（与 `npm`、`npx` 等一致）
  - 当检测到 `.cmd` 后缀时自动启用 `shell: true` 模式
- **文件**：`electron/main/cli.ts`（第 916-928 行、第 953 行）

### 1.4 Windows 可执行文件路径发现

- **问题**：原路径发现逻辑仅覆盖 macOS/Linux 常见目录，Windows 用户的 OpenClaw CLI 无法被自动发现
- **修复**：在 `electron/main/runtime-path-discovery.ts` 中新增：
  - `APPDATA\npm\` 目录查找
  - npm global prefix 目录查找
  - Volta 工具链目录查找
  - 为每个目录同时检查 `.cmd`、`.exe`、无后缀三种变体
- **验证**：新增测试用例验证 `win32` 平台下的候选路径列表

### 1.5 版本号解析兼容

- **问题**：OpenClaw CLI 输出版本号格式为 `OpenClaw 2026.x.x`，带有前缀的格式导致版本比较失败
- **修复**：在 `normalizeVersionCore()` 中识别 `OpenClaw` 前缀并提取纯数字版本号
- **文件**：`src/shared/openclaw-version-policy.ts`（第 38-47 行）

---

## 2. ⌨️ Enter 键发送模式优化（回应 Issue #2）

### 问题

社区用户反馈 Enter 键直接发送消息太容易误触，打字过程中经常意外发送未完成的内容。

### 解决方案

新增可配置的发送快捷键模式，用户可在设置页面自由切换：

| 模式 | Enter 行为 | 发送方式 |
|------|-----------|---------|
| `enter`（原始） | 发送消息 | Enter |
| `shiftEnter`（**默认**） | 换行 | Shift + Enter |
| `altEnter` | 换行 | Alt + Enter |

### 改动文件

| 文件 | 改动说明 |
|------|---------|
| `src/lib/chat-composer-enter-send-preference.ts` | **新增** — 发送模式偏好的读写模块，基于 localStorage 持久化 |
| `src/App.tsx` | 在应用顶层读取并管理发送模式状态 |
| `src/pages/ChatPage.tsx` | 将发送模式传递给聊天面板 |
| `src/pages/SettingsPage.tsx` | 新增发送模式配置 UI |
| `src/components/dashboard/DashboardChatPanel.tsx` | 根据发送模式切换键盘事件处理逻辑 |

---

## 3. 🔧 其他修复

### 3.1 ARIA 无障碍属性 ESLint 误报

- **问题**：`ModelCenter.tsx` 中 `aria-valuemin={0}` / `aria-valuemax={100}` / `aria-valuenow={progress}` 触发 `jsx-a11y/aria-proptypes` ESLint 错误
- **原因**：原有的 `eslint-disable-next-line` 仅覆盖了 `<div` 开始标签行，未覆盖实际属性所在行
- **修复**：改为块级 `eslint-disable` / `eslint-enable` 包裹整个 JSX 元素
- **说明**：纯 lint 层面修复，不影响运行时行为；React 对数字类型 ARIA 属性的处理完全正确

### 3.2 OpenClaw CLI 升级兼容性

- 验证从 2026 年 2 月版本安全升级的路径
- 修复飞书插件 `package.json` 中 `workspace:*` 依赖导致的安装失败问题

### 3.3 TypeScript 编译清理

- 解决项目中所有 TypeScript 编译错误
- 确保 `npm run dev` 可正常启动开发服务器

---

## 4. 📋 回应的社区 Issues

| Issue | 标题 | 本 PR 状态 |
|-------|------|-----------|
| [#2](https://github.com/qiuzhi2046/Qclaw/issues/2) | enter 发送太容易误触了 | ✅ 已修复 — 新增发送模式配置 |
| [#6](https://github.com/qiuzhi2046/Qclaw/issues/6) | 秋芝加油期待 Windows 上线 | ✅ 已适配 — Windows 平台全面支持 |
| [#7](https://github.com/qiuzhi2046/Qclaw/issues/7) | Windows 平台 Bug 汇总 | ✅ 已修复 — osascript、.cmd 映射、版本解析 |
| [#11](https://github.com/qiuzhi2046/Qclaw/issues/11) | npm 全局路径嵌套 | ✅ 已修复 — Windows 路径解析 |

---

## 5. 测试情况

- [x] TypeScript 编译通过（`npx tsc --noEmit`）
- [x] 开发服务器正常启动（`npm run dev`）
- [x] 单元测试覆盖 Windows 路径解析、版本号规范化等核心逻辑
- [x] 手动验证 Windows 10/11 环境下的 CLI 发现与执行

---

## 6. README 更新

- 在 README 顶部新增 Fork 声明，注明原创团队仓库
- 新增「本 Fork 的优化与改进」章节，详细列出所有改动
- 新增「社区 Issue 回应状态」表格
- 在致谢部分特别感谢秋芝团队的原创贡献
