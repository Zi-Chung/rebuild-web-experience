# Rebuild Web Experience

从网址和限定范围，重建能运行、能自定义、能独立复用的前端工程。

Reconstruct scoped web experiences into runnable, editable, reusable frontend projects. Platform-independent; REA is optional.

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

- 限定范围内的页面或效果能实际运行，外观与关键交互经过对照。
- 修改对应源码或配置后，浏览器中的结果确实改变。
- 公开组件能脱离原应用，在最小宿主页挂载、更新和销毁。
- 提供维护源码、所需资源、运行命令、修改位置和复用示例。

REA 可用于复杂代码分析和运行证据，但不是启动前提。逐帧像素全等、额外设备矩阵、真实第三方提交和生产发布按用户要求另外确定。

## 技能文件

`skills/rebuild-web-experience/SKILL.md` 是入口；`references/` 按需提供资源恢复、复用设计和验收方法，`agents/openai.yaml` 提供 Codex 显示信息。

Skill 是代理工作流程，不自带浏览器、开发环境或目标站点的后端。无法从交付资源直接获得的服务器功能，需要明确实现或适配。
