<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# 看山篮球生涯模拟器

## 项目目标

这是一个 2-3 天内完成的可运行 Web Demo。

项目名称：

看山篮球生涯模拟器

核心玩法：

用户扮演刘看山，经历：

北极
→ 校园篮球
→ CUBA
→ CBA
→ NBA
→ 中国国家队
→ 退役

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS

## 开发原则

1. 优先保证 Demo 可运行。
2. 不过度设计。
3. 不引入不必要的依赖。
4. 不使用数据库，除非后续明确要求。
5. Game Engine 负责修改游戏状态。
6. AI 只能生成剧情、评论、对话等内容。
7. AI 不允许直接修改玩家属性。
8. 外部 API 必须有 fallback。
9. 所有核心功能必须可以在没有外部 API 的情况下运行。
10. 每完成一个功能都必须保证项目可以启动。

## 当前阶段

当前只建立项目基础环境。

暂时不要实现：

- 篮球游戏逻辑
- 知乎 API
- LLM
- Agent
- 数据库
- 登录
- 支付