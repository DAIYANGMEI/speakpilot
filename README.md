# SpeakPilot - 英语口语情景陪练工具

SpeakPilot 是一个英语口语练习工具，重点解决“想练口语但缺少真实对话对象和即时反馈”的问题。用户可以选择机场值机、面试自我介绍、咖啡店点单、项目路演开场等场景，用文字或语音完成一轮对话练习。每轮回答后，系统会给出表达修改、发音信号、推荐句型、下一轮追问和练习总结。

仓库地址：https://github.com/DAIYANGMEI/speakpilot

## 核心功能

### 场景陪练

- 机场值机：练习护照、预订信息、托运行李、座位偏好和登机口询问。
- 面试自我介绍：练习英文开场、教育背景、项目经历、优势说明和追问回答。
- 咖啡店点单：练习日常点单、杯型、冷热、奶类选择、堂食或外带。
- 项目路演开场：练习项目介绍、问题背景、目标用户、解决方案和下一步计划。

### 虚拟角色

- Emma：机场地勤工作人员，语气礼貌、专业、语速偏慢。
- James：HR 面试官，关注结构、经历细节和岗位匹配度。
- Sophie：咖啡店店员，语气轻松，适合日常口语练习。
- Olivia：项目评委，关注逻辑、表达清晰度和项目差异点。

点击首页场景卡片后，会打开对应角色的对话窗口。角色会先给出英文开场白，再根据用户回答继续追问。用户可以结束练习并查看本轮反馈报告。

### 语音交互

- 支持浏览器语音识别输入。
- 支持教练回复自动朗读。
- 角色弹窗内提供独立的 Speak 和 Voice on/off 控制。
- 语音输入结束后可以自动提交，减少对话等待。
- 根据识别置信度、语速、词数和响应延迟生成发音与流畅度信号。

### 反馈与复盘

- 表达纠错：指出问题、给出建议写法和原因。
- 更自然表达：根据用户原句生成改写版本。
- 量化反馈：包含流利度、发音、语法、词汇、互动性、词数和延迟。
- 课后总结：生成下一步练习重点和课后任务。
- 总结复制：一键复制本轮练习摘要。

### 学习辅助

- Starter Phrases：根据当前模式或场景提供开口短语。
- Readiness：输入时检查字数、完整句和细节/追问是否达标。
- Focus Stack：快速切换本轮练习重点。
- Draft Boosters：一键填入示例回答、改写版本或下一题提示。
- Study Companion：右下角学习精灵，支持记忆卡、复习提示和短语插入。

## 技术栈

- 前端：Vite、React、TypeScript、Lucide React、Web Speech API
- 后端：Express、Zod、CORS、dotenv、tsx
- 工程：ESLint、TypeScript project references、Vite production build、concurrently
- 模型接口：DeepSeek API（OpenAI-compatible Chat Completions）

## 项目实现范围

本项目主要实现了口语练习工作台、四个场景角色、角色对话弹窗、语音输入与朗读、反馈面板、学习精灵和本地 fallback 反馈逻辑。

第三方库主要用于前端框架、图标、后端服务、环境变量读取和接口校验。口语练习流程、场景角色配置、反馈数据结构、语音状态管理、练习记录和本地规则反馈由本项目实现。

如果没有配置模型密钥，应用会使用本地规则生成反馈，保证演示环境仍然可以完整跑通。配置 DeepSeek API 后，后端会通过 OpenAI-compatible Chat Completions 接口获取更自然的对话和反馈。

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

在 `.env` 中填写 DeepSeek 模型配置：

```bash
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

后端请求地址：

```text
POST {DEEPSEEK_BASE_URL}/chat/completions
```

代码也兼容 OpenAI-compatible 变量名：

```bash
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_MODEL=
```

以及旧变量名：

```bash
LLM_API_KEY=
LLM_BASE_URL=
LLM_MODEL=
```

如果所有 API key 都为空，系统会自动使用本地 fallback 反馈。

## API

- `GET /api/health`：服务状态和模型配置状态。
- `GET /api/ai/status`：返回模型配置状态，不暴露密钥。
- `POST /api/coach/session`：统一口语教练接口，支持场景、角色、自由对话、语法诊断、学习计划和词汇模式。
- `POST /api/speaking/feedback`：兼容旧版场景反馈接口。

## 常用命令

```bash
npm run dev        # 同时启动前端和后端
npm run dev:client # 只启动前端
npm run dev:server # 只启动后端
npm run lint       # 代码检查
npm run build      # 生产构建
npm run preview    # 预览生产构建
```

## Demo

Demo 视频链接：待补充
