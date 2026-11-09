# 镜头词场 · Video Prompt Studio

[简体中文](README.md) | English

A static web app for writing prompts you can paste into FreeVideo (VDN-H3). The rule based mode follows the MiniMax H3 guide for visual descriptions, sound, and music.

## Getting started

Open `index.html` directly to use the rule based mode. For browser clipboard access and local model requests, run a static server from the project directory.

```powershell
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Usage

1. Describe your video idea. Optionally specify the style, aspect ratio, duration, camera movement, ambient or action sounds, background music, and anything to avoid. The rule based mode keeps your original description and wraps it in an English prompt structure.
2. Select **规则整理** (Rule Based) for the three section H3 format, or **AI 优化** (AI Rewrite) to have your configured model write one to three sentences with a target of at most 60 English words. The AI mode preserves explicitly requested details. Set duration and aspect ratio in your video tool.
3. Edit the result directly and copy it into FreeVideo.
4. Open **模型连接** (Model Connection) in the upper right to configure your model.

## Model connections

- **Ollama.** Enter the service address (default `http://localhost:11434`) and an installed model name. The connection check reads `/api/tags`.
- **Local llama.cpp, vLLM, or a similar service.** In the **本地 Ollama** tab, enter a base URL such as `http://127.0.0.1:8080/v1` and the model ID. The connection check reads `/v1/models`. AI requests go to `/v1/chat/completions`.
- **Hosted compatible API.** Enter the full Chat Completions URL, model ID, and an API key if required. The browser sends the key directly to the configured endpoint.
- Settings are stored in the current browser's `localStorage`. Avoid saving private API keys on shared devices.
- The model service must allow the page's origin through CORS. For Ollama, see its documentation for `OLLAMA_ORIGINS`. A backend proxy can keep keys off the browser in a production deployment.

## Current scope

The app is a static frontend. AI rewriting supports the Ollama `/api/chat` endpoint and APIs compatible with OpenAI Chat Completions. It produces text prompts. Reference media and the hosted H3-Context-IR preprocessing service are outside the current workflow.

## Official references

- Prompt structure, timeline, camera movement, and sound for text and first or last frame tasks. [MiniMax H3 Base Video Prompt Writing Guide](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_base_en.md)
- Prompt structure for tasks with image, video, or audio references. [MiniMax H3 Full Reference Guide](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/docs/VIDEO_PROMPT_WRITING_GUIDE_ref_en.md)
- VDN-H3 and the supported FreeVideo workflows. [FreeVideo repository](https://github.com/FlashML-org/FreeVideo)
