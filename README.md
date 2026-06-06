# SpeakPilot - AI 英语口语陪练

SpeakPilot 是面向英语学习者的大模型口语陪练工具。用户可以选择真实交流场景，也可以进入自由对话、语法诊断、学习计划和词汇短语模式，用语音或文字回答教练的问题，并立即获得发音评测、语法/表达纠错、量化反馈、改写版本和课后总结。

## 功能

- 场景化口语练习：机场值机、面试自我介绍、咖啡店点单、项目路演开场。
- 多模式学习：场景陪练、自由对话、语法表达诊断、学习计划、词汇短语库。
- 开口短语提示：根据当前模式或场景提供可一键插入的英文开头句。
- 界面细节优化：使用更清晰的面板层级、输入区状态和反馈卡片样式。
- 实时语音对话：浏览器语音识别输入，教练回复可自动朗读。
- 低延迟语音链路：语音实时转写、结束后自动提交、回复播放状态提示，减少一轮对话中的等待感。
- 发音评测：基于浏览器语音识别置信度给出发音分、识别信号和改进建议。
- 提交前检查：输入时实时提示字数、完整句和追问/细节是否达标。
- 语法/表达纠错：返回问题、建议写法和原因说明。
- 课后总结：每轮练习生成下一步重点和可执行 homework。
- 总结复制：一键复制本轮练习摘要，便于课后复盘。
- 量化反馈：总分、流利度、发音、语法、词汇、互动性、延迟、语速和词数。
- 模型接入：配置 `.env` 后调用 OpenAI-compatible Chat Completions；没有模型密钥或调用失败时使用本地规则反馈，保证 demo 可运行。

## 技术栈

- 前端：Vite、React、TypeScript、Lucide React、Web Speech API
- 后端：Express、Zod、CORS、dotenv、tsx
- 工程与质量：ESLint、TypeScript project references、Vite production build、concurrently
- 模型接口：OpenAI-compatible Chat Completions integration

## 原创功能说明

- 口语练习工作台、场景/模式切换、反馈面板和练习记录面板由本项目实现。
- 发音评测、语速/词数/延迟统计基于浏览器语音识别结果和本地计算逻辑实现。
- 模型调用失败时的本地规则反馈由本项目实现，用于保证无密钥环境下也能完成演示。
- 本项目未复用其他历史项目代码；第三方库和框架见上方技术栈。

## 仓库地址

https://github.com/DAIYANGMEI/speakpilot

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

启动后访问：

- 前端：http://localhost:5173
- 后端健康检查：http://localhost:8787/api/health

## 模型配置

如果要接入真实模型反馈，在 `.env` 中填写：

```bash
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=chat-latest
```

后端会请求：

```text
POST {OPENAI_BASE_URL}/chat/completions
```

也兼容旧变量名：`LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`。如果这些变量为空，系统会自动使用本地规则生成反馈。

## API 能力

- `GET /api/health`：服务状态和模型配置状态。
- `GET /api/ai/status`：只返回模型配置状态，不暴露密钥。
- `POST /api/coach/session`：统一口语教练接口，支持场景、自由对话、语法诊断、学习计划和词汇模式。
- `POST /api/speaking/feedback`：兼容旧版场景反馈接口。

## 常用命令

```bash
npm run dev        # 同时启动前端和后端
npm run dev:client # 只启动前端
npm run dev:server # 只启动后端
npm run lint       # 代码检查
npm run build      # 生产构建
```

## Demo 链接

待补充。

## 比赛提交提醒

- 仓库需要公开或在截止后可公开访问。
- README 需要补上 demo 视频链接。
- demo 视频需要语音讲解，并完整展示：选择场景、语音输入、自动朗读回复、发音评测、纠错、量化反馈、课后总结和下一轮追问。
- 开发过程需要持续 commit，并尽量通过小 PR 增加功能。
