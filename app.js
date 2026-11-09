const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={mode:'template',provider:'ollama',result:''};
const defaults={ollamaUrl:'http://localhost:11434',ollamaModel:'',apiUrl:'https://api.openai.com/v1/chat/completions',apiKey:'',apiModel:''};
let settings={...defaults,...JSON.parse(localStorage.getItem('promptStudioSettings')||'{}')};
$('#ollamaUrl').value=settings.ollamaUrl;$('#ollamaModel').value=settings.ollamaModel;$('#apiUrl').value=settings.apiUrl;$('#apiKey').value=settings.apiKey;$('#apiModel').value=settings.apiModel;
$('#idea').addEventListener('input',e=>$('#charCount').textContent=e.target.value.length);
$('#tipsOpen').onclick=()=>$('#tipsDialog').showModal();
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function openSettings(){ $('#settingsModal').classList.add('open');$('#settingsModal').setAttribute('aria-hidden','false') }
function closeSettings(){ $('#settingsModal').classList.remove('open');$('#settingsModal').setAttribute('aria-hidden','true') }
$('#settingsOpen').onclick=openSettings;$('#settingsClose').onclick=closeSettings;$('#settingsModal').addEventListener('click',e=>{if(e.target===$('#settingsModal'))closeSettings()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});
$$('.provider-tab').forEach(b=>b.onclick=()=>{state.provider=b.dataset.provider;$$('.provider-tab').forEach(x=>x.classList.toggle('active',x===b));$$('.provider-form').forEach(f=>f.classList.toggle('hidden',f.dataset.form!==state.provider))});
$$('.mode-btn').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;$$('.mode-btn').forEach(x=>x.classList.toggle('active',x===b));$('#generateText').textContent=state.mode==='ai'?'AI 优化提示词':'整理提示词';$('#modeNote').textContent=state.mode==='ai'?'按 MiniMax H3 文生视频规则精简，保留原描述的关键细节。':'无需连接模型，按结构模板整理你的描述。'});
function saveSettings(){settings={ollamaUrl:$('#ollamaUrl').value.trim()||defaults.ollamaUrl,ollamaModel:$('#ollamaModel').value.trim(),apiUrl:$('#apiUrl').value.trim()||defaults.apiUrl,apiKey:$('#apiKey').value.trim(),apiModel:$('#apiModel').value.trim()};localStorage.setItem('promptStudioSettings',JSON.stringify(settings));toast('模型连接配置已保存在此浏览器');}
$('#saveSettings').onclick=saveSettings;$('#saveSettingsOnline').onclick=saveSettings;
function isOpenAICompat(url){return /\/v1(?:\/|$)/i.test(url)||/chat\/completions/i.test(url)}
function endpointFor(url){let u=url.replace(/\/$/,'');if(/\/chat\/completions$/i.test(u))return u;if(/\/v1$/i.test(u))return u+'/chat/completions';return u+'/v1/chat/completions'}
$('#testConnection').onclick=async()=>{const st=$('#connectionStatus');st.className='connection-status';st.textContent='正在连接…';try{const url=$('#ollamaUrl').value.trim().replace(/\/$/,'');if(isOpenAICompat(url)){const root=url.replace(/\/chat\/completions$/i,'').replace(/\/v1$/i,'');const res=await fetch(root+'/v1/models');if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const models=(data.data||[]).map(m=>m.id).filter(Boolean);const entered=$('#ollamaModel').value.trim();let note='';if(models.length&&!models.includes(entered)){if(models.length===1){$('#ollamaModel').value=models[0];note=' · 已自动填入服务端模型 id'}else if(!entered){$('#ollamaModel').value=models[0];note=' · 已选择首个模型'}}st.className='connection-status ok';st.textContent=models.length?'已连接 · '+models.slice(0,2).join(', ')+note:'服务已连接，请检查模型 id'}else{const res=await fetch(url+'/api/tags');if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const names=(data.models||[]).map(m=>m.name);st.className='connection-status ok';st.textContent=names.length?'已连接 · '+names.slice(0,2).join(', '):'服务已连接，请填写模型名称';if(!$('#ollamaModel').value&&names[0])$('#ollamaModel').value=names[0]}}catch(e){st.className='connection-status error';st.textContent='连接失败：检查地址、服务状态、CORS 或 API key ('+e.message+')'}};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function templatePrompt(idea){const style=$('#style').value,ratio=$('#ratio').value,duration=$('#duration').value,camera=$('#camera').value,avoid=$('#avoid').value.trim(),sound=$('#sound').value.trim(),music=$('#music').value.trim();const styleEn={'电影写实':'live-action, cinematic','纪录片质感':'documentary style','日系动画':'Japanese animation','3D 动画':'3D animation','复古胶片':'vintage film','极简广告':'minimalist commercial','梦幻超现实':'dreamlike surrealism','水墨东方':'East Asian ink-wash animation'}[style]||style;const cameraEn={'固定镜头':'holds a static shot','缓慢推进':'pushes in at slow speed','平滑跟拍':'follows the subject in a smooth tracking shot','横向平移':'moves laterally in a smooth tracking shot','环绕主体':'moves in an arc around the subject','手持纪实':'uses subtle handheld camera movement','航拍俯冲':'descends in a smooth aerial shot'}[camera]||camera;let visual=`[Shot 1] ${styleEn?`${styleEn}, `:''}${idea}`;visual+=cameraEn?`. The camera ${cameraEn}; keep the subject and setting clear and coherent.`:'. Keep the camera steady and the subject clearly framed.';visual+=' Actions unfold in chronological order. Keep the subject’s appearance, clothing, props, and spatial relationships consistent, with lighting and color appropriate to the scene.';const fields=[`integrated_multimodal_description: ${visual}`,`overall_soundscape: ${sound||'N/A'}`,`non_diegetic_music: ${music||'N/A'}`];if(avoid)fields.push(`Constraints: Avoid ${avoid}.`);const metadata=[duration&&`Duration: ${duration.replace(' 秒',' seconds')}`,ratio&&`Aspect ratio: ${ratio}`].filter(Boolean);return [...fields,...metadata].join('\n\n')}
function renderOutput(text,providerLabel){state.result=text;$('#outputContent').innerHTML=`<div class="output-text" contenteditable="true" role="textbox" aria-label="可编辑的提示词">${escapeHtml(text)}</div>`;$('#resultStatus').innerHTML='<span class="status-dot"></span> 已生成';$('#outputMeta').textContent=providerLabel+' · 可直接编辑';$('#copy').disabled=false;$('#regenerate').disabled=false}
// Concise T2VA adaptation of MiniMax-AI/MiniMax-H3/skills/h3-prompt-writing.
const H3_SYSTEM_PROMPT=`Rewrite the source as a faithful MiniMax H3 text-to-video prompt. Output only these three fields, in order:

integrated_multimodal_description: [Shot 1] <visual action and dialogue>
overall_soundscape: <ambient and action sounds>
non_diegetic_music: <background score>

In the first field, describe the subject, setting, and actions in playback order. Keep the original counts, names, colors, positions, directions, and exclusions. Write requested camera motion as a natural sentence. Keep one shot unless the user requests cuts. For later shots, use [Shot 2], [Shot 3], and so on. Keep cut times increasing and inside the selected duration. Do not add a time to Shot 1.
Write in English. Preserve visible text verbatim in double quotes. Preserve spoken words and lyrics verbatim inside <d>[Language] ...</d>. Give each speaker a stable ID such as (S1).
For motion, keep any stated starting pose, direction, and final position tied to the same subject. Across requested cuts, use consistent names for recurring subjects and carry over the stated appearance and clothing unless the user asks for a change.
Summarize requested ambient and action sounds in the second field. Keep dialogue and music heard by the characters in the first field. Use the third field only for music heard by the audience. Use N/A for unspecified sound or score rather than inventing it.
Leave unspecified details open. If form options conflict with the source description, follow the source description. Use the selected duration for timing only. Aim for 60 English words or fewer across the field contents while keeping explicit requirements. Before answering, check that the rewritten scene still matches the input.`;
async function callModel(prompt){const s={...settings,...Object.fromEntries(['ollamaUrl','ollamaModel','apiUrl','apiKey','apiModel'].map(k=>[k,$('#'+k).value.trim()]))};let url,body,headers={'Content-Type':'application/json'},label,ollamaNative=false,model;if(state.provider==='ollama'){if(!s.ollamaModel)throw new Error('请填写模型名称');model=s.ollamaModel;if(isOpenAICompat(s.ollamaUrl)){url=endpointFor(s.ollamaUrl);label='短提示词 · 本地 llama.cpp '+model}else{url=s.ollamaUrl.replace(/\/$/,'')+'/api/chat';ollamaNative=true;label='短提示词 · 本地 Ollama '+model}}else{if(!s.apiModel)throw new Error('请先填写在线模型名称');model=s.apiModel;url=endpointFor(s.apiUrl);if(s.apiKey)headers.Authorization='Bearer '+s.apiKey;label='短提示词 · 在线模型 '+model}const messages=[{role:'system',content:H3_SYSTEM_PROMPT},{role:'user',content:prompt}];body=ollamaNative?{model,stream:false,messages,options:{temperature:1,top_p:1,top_k:20,presence_penalty:2,num_predict:1600}}:{model,temperature:1,top_p:1,top_k:20,presence_penalty:2,max_tokens:1600,messages};

// Qwen chat templates can consume the entire output budget on reasoning.
if (state.provider === 'ollama' && !ollamaNative && /qwen/i.test(model)) {
  body.chat_template_kwargs = {enable_thinking: false};
}

let r;try{r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)})}catch(e){throw new Error(`无法连接模型服务（${url}）。检查服务是否运行，以及 CORS 设置。`)}if(!r.ok){let detail='';try{const raw=await r.text();try{const parsed=JSON.parse(raw);const apiError=parsed.error;detail=(typeof apiError==='string'?apiError:apiError?.message)||parsed.message||raw}catch{detail=raw}}catch{}const short=detail.replace(/\s+/g,' ').slice(0,260);let advice='';if(r.status===404){advice='；请确认接口路径为 /v1/chat/completions，模型名称与 /v1/models 返回的 id 一致'}throw new Error(`模型请求失败 HTTP ${r.status}（${url}）：${short||'服务未返回错误详情'}${advice}`)}const data=await r.json();const choice = data.choices?.[0];
const message = ollamaNative ? data.message : choice?.message;
const content = typeof message?.content === 'string' ? message.content.trim() : '';
const result = content.replace(/^<think>[\s\S]*?<\/think>\s*/i, '').trim();
if (result && !/^<think>/i.test(result)) return {text: result, label};

const reachedLimit = (ollamaNative ? data.done_reason : choice?.finish_reason) === 'length';
if (reachedLimit || message?.reasoning_content || message?.thinking || /^<think>/i.test(result)) {
  throw new Error('模型已响应，但未生成正文。请在本地模型服务中关闭思考模式后重试，或先使用规则整理。');
}
throw new Error(`模型接口已响应，但没有返回可用文本（${url}）。请检查模型的聊天模板。`);}
function sourcePrompt(){
  const fields = [
    ['Source description', $('#idea').value],
    ['Visual style', $('#style').value],
    ['Camera direction', $('#camera').value],
    ['Target duration (timing only)', $('#duration').value],
    ['Ambient and action sounds', $('#sound').value],
    ['Background music', $('#music').value],
    ['Exclusions', $('#avoid').value]
  ];
  return fields
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n');
}
async function generate(){const idea=$('#idea').value.trim();if(!idea){$('#idea').focus();toast('先写下你想要的画面');return}const btn=$('#generate');btn.disabled=true;$('#resultStatus').textContent='生成中…';$('#outputContent').innerHTML='<div class="loading-state"><div class="loader"></div>正在整理你的画面灵感…</div>';try{if(state.mode==='template')renderOutput(templatePrompt(idea),'规则模板');else{const out=await callModel(sourcePrompt());renderOutput(out.text,out.label)}}catch(e){$('#outputContent').innerHTML=`<div class="empty-state"><p class="empty-title">暂时无法完成 AI 优化</p><p class="empty-sub">${escapeHtml(e.message)}<br>检查模型连接，或切换到规则整理模式。</p></div>`;$('#resultStatus').textContent='优化失败';$('#outputMeta').textContent='可重试或使用规则整理';toast(e.message)}finally{btn.disabled=false}}
$('#generate').onclick=generate;$('#regenerate').onclick=generate;$('#copy').onclick=async()=>{const el=$('.output-text');if(!el)return;try{await navigator.clipboard.writeText(el.innerText);toast('提示词已复制')}catch{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast('已选中结果，请按 Ctrl+C 复制')}};$('#outputContent').addEventListener('input',()=>{const el=$('.output-text');if(el)state.result=el.innerText});
