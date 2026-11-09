# 镜头词场 · 视频提示词工作台

简体中文 | [English](README.en.md)

一个无需构建步骤的静态网页，用于整理可粘贴到 FreeVideo（VDN-H3）的视频提示词。提示词字段和声音结构按 MiniMax H3 官方基础指南设计。

## 启动

直接打开 `index.html` 即可使用规则整理模式。为支持浏览器剪贴板和本地模型请求，推荐在项目目录启动静态服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 使用

1. 输入画面想法，按需选择风格、比例、时长、镜头运动、环境/动作声音、背景配乐和避免项。提示词正文使用英文组织，原始创意照用户输入保留。
2. 选择“规则整理”生成 H3 三段格式，或选择“AI 优化”调用已配置模型，改写成 1–3 句、目标最多 60 个英文单词的短提示词。AI 输出保留明确指定的画面内容，时长和比例在视频工具中设置。
3. 可直接编辑生成结果，复制到 FreeVideo。
4. 点右上角“模型连接”配置本地 Ollama 或在线 OpenAI Chat Completions 兼容接口。

## 模型连接

- **Ollama**：填写服务地址（默认 `http://localhost:11434`）和已下载模型名；“测试连接”会读取 `/api/tags`。
- **本地 llama.cpp / vLLM 等兼容端点**：可在本地 Ollama 标签页填写 `http://127.0.0.1:8080/v1` 和模型名；工具会使用 `/v1/models` 测试，并自动请求 `/v1/chat/completions`。服务需允许浏览器跨域请求。
- **在线兼容接口**：填写 Chat Completions 完整地址、模型名及可选 API Key。密钥直接从浏览器发送到所填服务，不经过本工具的服务器。
- 配置保存在当前浏览器的 `localStorage`。不要在共享设备上保存私密密钥。
- 浏览器直连要求模型服务启用 CORS。Ollama 可按其文档配置 `OLLAMA_ORIGINS`；在线服务也需允许当前网页来源。生产部署如需保护密钥，建议增加自有后端代理。

## 当前范围

静态前端，无服务器、账号或密钥托管。AI 优化只支持 Ollama `/api/chat` 与 OpenAI Chat Completions 兼容格式；其他协议可后续扩展。

## 官方资料依据

- [MiniMax H3 基础视频提示词指南](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md)：纯文本及首/尾帧任务的结构、时间线、镜头、声音规则。
- [MiniMax H3 全参考模式指南](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_ref_en.md)：图片、视频、音频参考任务的结构。本工具当前 UI 未收集参考素材，因此暂不生成该六段式格式。
- [FreeVideo 官方仓库](https://github.com/FlashML-org/FreeVideo)：说明 FreeVideo 基于 VDN-H3 并提供文字与多模态参考工作流。

规则模板无法像 H3-Context-IR 一样理解参考图/视频，也不会调用官方在线预处理服务；本工具生成的是基于官方指南的文本提示词结构。
