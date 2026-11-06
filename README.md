# Rebuild Web Experience

从网址和限定范围还原画面与交互，重建能运行、能自定义、能独立复用的前端工程。

Reconstruct scoped web experiences with visual and behavioral fidelity into runnable, editable, reusable frontend projects. Platform-independent; REA is optional.

## 安装到 Codex

```sh
npx skills add Zi-Chung/rebuild-web-experience --skill rebuild-web-experience -a codex -g -y
```

`-g` 安装到用户级目录，跨项目可用；去掉则安装到当前项目。安装器需要 Node.js/npm 与 Git。Skill 本身没有必需的 npm 或 REA 依赖。

只查看可用技能：

```sh
npx skills add Zi-Chung/rebuild-web-experience --list
```

## 使用

在具备网页访问/浏览器工具、文件操作和代码执行能力的 Codex 环境里输入：

```text
使用 $rebuild-web-experience
网址：https://example.com
范围：只重建卡片网格和鼠标交互
自定义：数据、配色、尺寸、动画速度
输出：独立 ESM，可嵌入其他页面
```

可输出到现有项目或独立前端工程，沿用所选技术栈，不绑定 Shopify。

## 完成标准

- 限定范围内的画面、背景、装饰与关键交互经过对照，相关的进入、过渡和稳定状态成立。
- 页面或效果使用维护源码实际运行，修改源码或配置后能在浏览器观察到结果。
- 支持约定的内容增删、排序和样式修改，修改后的布局与动画仍然正常。
- 公开组件能脱离原应用，在最小宿主页挂载、更新和销毁。
- 提供维护源码、所需资源、运行命令、修改位置和复用示例。

关键效果缺失、明显的视觉差异或错误的动画过程都属于未完成；记录在限制里不代表通过。区域范围包含其中的可见效果，只有用户明确排除才能从验收中移除。

对于拖拽释放、惯性、滚动联动、手势、拖尾和模拟等依赖历史或时间的交互，使用[动态交互方法](skills/rebuild-web-experience/references/dynamic-interactions.md)：观察连续输入与恢复过程，追踪坐标、时间、状态和渲染关系，再用可复现输入比较过渡与稳定过程。验收需要相应的动态证据，静止或终点截图不足以证明交互一致。方法按效果选用，不要求每个组件跑完整设备或逐帧测试矩阵。

交付闭环是：实现 → 独立验收 → 修复失败项 → 重新独立验收 → 全部必需项通过后交付。验收者重新读取原始需求、Skill 和项目约定，实际检查当前版本；实现者不能自行删项或降低标准。代码改动后，旧版本的通过结论需要重新审查。缺少独立验收能力或必要访问时，保持未完成状态并说明阻塞。

[验收检查器](skills/rebuild-web-experience/scripts/check-acceptance.mjs)使用 Node.js 18+ 内置模块，校验必需项状态、独立验收记录及源码/证据是否仍为被验收的版本；退出码可供外层 Agent 流程或 CI 使用。它不替代视觉判断，也不能证明验收者身份。格式和记录检查不能代替实际验收。具体流程见 [独立验收闭环](skills/rebuild-web-experience/references/review-loop.md)。

REA 可用于复杂代码分析和运行证据，但不是启动前提。逐帧像素全等、额外设备矩阵、真实第三方提交和生产发布按用户要求另外确定；这不降低范围内画面与交互的还原要求。

## 技能文件

`skills/rebuild-web-experience/SKILL.md` 是入口；`references/` 按需提供资源恢复、复用设计和验收方法，`agents/openai.yaml` 提供 Codex 显示信息。

Skill 是代理工作流程，不自带浏览器、开发环境或目标站点的后端。无法从交付资源直接获得的服务器功能，需要明确实现或适配。

## 维护验证

格式和安装检查只能验证 Skill 包可读取。修改工作流程时，应选择覆盖受影响分支的行为场景：普通 DOM、滚动过程、Canvas/WebGL、宿主样式及内容数量变化，并检查实际产物。一次简单组件测试不能证明所有网站都能自动还原；无需在每个重建任务中重跑无关场景。

[隔离行为验证](evals/README.md)提供自建参考页、现有宿主页和独立请求，可用于重复测试这些分支。测试文件位于 Skill 包之外，不影响日常安装。
