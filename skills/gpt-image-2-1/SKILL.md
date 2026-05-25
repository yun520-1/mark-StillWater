---
name: image-generation
version: 2.0.0
description: "通用AI生图技能：自动发现OpenAI兼容API，支持多模型，结构化提示词，模板匹配，Session记忆，适用于任何AI Agent。"
---

# 通用AI生图技能 v2.0.0

> 让任何AI Agent都能生成高质量图片的技能模块

## 核心能力

```
用户请求 → 意图识别 → 模型选择 → 提示词优化 → API调用 → 图片保存
                            ↓
                      模板匹配/Gallery参考
```

---

## 1. 自动发现可用API

### 优先级顺序

**环境变量（最高优先级）：**
```bash
# 标准OpenAI
OPENAI_BASE_URL
OPENAI_API_KEY

# 兼容网关
CLAWTO_BASE_URL
CLAWTO_API_KEY

# 通用前缀
IMAGE_BASE_URL
IMAGE_API_KEY
```

**配置文件（次优先级）：**
检查宿主AI的配置文件（如config.yaml, settings.json）：
```yaml
# config.yaml 格式
model:
  base_url: "https://api.example.com"
  api_key: "sk-xxx"

# 或
auxiliary:
  vision:
    base_url: "https://api.example.com"
    api_key: "sk-xxx"
```

### Python发现脚本
```python
import os, json, yaml, pathlib

def discover_api():
    """按优先级发现可用API配置"""
    # 1. 环境变量
    candidates = [
        ('OPENAI_BASE_URL', 'OPENAI_API_KEY'),
        ('CLAWTO_BASE_URL', 'CLAWTO_API_KEY'),
        ('IMAGE_BASE_URL', 'IMAGE_API_KEY'),
    ]
    for base_var, key_var in candidates:
        base = os.getenv(base_var)
        key = os.getenv(key_var)
        if base and key:
            return {'base_url': base, 'api_key': key, 'source': f'env:{base_var}'}
    
    # 2. 配置文件
    config_paths = ['config.yaml', 'settings.json', '.claude/config.json']
    for path in config_paths:
        p = pathlib.Path(path)
        if p.exists():
            try:
                if path.endswith('.yaml'):
                    cfg = yaml.safe_load(p.read_text())
                else:
                    cfg = json.loads(p.read_text())
                # 尝试多种字段名
                for field in ['model.base_url', 'model.api_key', 'auxiliary.vision.base_url']:
                    base = cfg
                    for k in field.split('.'):
                        base = base.get(k, {})
                    if base and isinstance(base, str):
                        key_path = '.'.join(field.split('.')[:-1] + ['api_key'])
                        key = cfg
                        for k in key_path.split('.'):
                            key = key.get(k, {})
                        if key:
                            return {'base_url': base, 'api_key': key, 'source': f'file:{path}'}
            except: pass
    
    return None
```

---

## 2. 模型发现与验证

### 支持的模型（按优先级）

| 优先级 | 模型 | 用途 | 尺寸支持 |
|--------|------|------|----------|
| 1 | gpt-image-2 | 最高质量 | 1024x1024, 2048x1024 |
| 2 | dall-e-3 | OpenAI官方 | 1024x1024, 1792x1024 |
| 3 | dalle-3 | 兼容接口 | 1024x1024 |
| 4 | stable-diffusion-xl | 开源替代 | 多尺寸 |
| 5 | any-available | 兜底 | 按API支持 |

### 模型验证流程
```python
import urllib.request, ssl, json

def validate_model(api_config, model_name):
    """验证模型是否可用"""
    base = api_config['base_url'].rstrip('/')
    key = api_config['api_key']
    
    # 1. 检查模型列表
    url = f'{base}/models'
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {key}'})
    ctx = ssl.create_default_context()
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
            data = json.loads(r.read().decode())
            models = [m.get('id', '').lower() for m in data.get('data', [])]
            
            if model_name.lower() in models:
                return {'available': True, 'endpoint': 'models'}
            
            # 2. 尝试直接调用
            return test_generation_endpoint(api_config, model_name)
    except Exception as e:
        return {'available': False, 'error': str(e)}

def test_generation_endpoint(api_config, model_name):
    """测试生图端点"""
    base = api_config['base_url'].rstrip('/')
    key = api_config['api_key']
    
    # 尝试多种端点
    endpoints = [
        '/v1/images/generations',
        '/v1/image/generations', 
        '/v1/images/generate',
    ]
    
    for ep in endpoints:
        url = base + ep
        payload = json.dumps({
            'model': model_name,
            'prompt': 'test',
            'size': '256x256',
            'n': 1
        }).encode()
        
        req = urllib.request.Request(url, data=payload, headers={
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        })
        
        try:
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, context=ctx, timeout=60) as r:
                return {'available': True, 'endpoint': ep, 'status': r.status}
        except:
            continue
    
    return {'available': False, 'error': 'no_valid_endpoint'}
```

---

## 3. 结构化提示词公式

### Nano-Banana 完美提示词公式

| 组件 | 描述 | 示例 |
|------|------|------|
| **Subject** | 主体细节 | "一位沉稳的机器人咖啡师，露出铜质线路" |
| **Action** | 动态互动 | "用机械精度拉出树叶拉花" |
| **Context** | 环境背景 | "午夜霓虹赛博朋克咖啡馆内" |
| **Composition** | 构图/镜头 | "特写，85mm镜头，f/1.8光圈" |
| **Lighting** | 光线氛围 | "蓝色轮廓光，电影感" |
| **Style** | 风格锚定 | "摄影写实，4K质感" |

### 提示词构建模板

```python
def build_prompt(user_request, style='photorealistic'):
    """构建结构化提示词"""
    components = {
        'subject': extract_subject(user_request),
        'action': extract_action(user_request),
        'context': extract_context(user_request),
        'composition': extract_composition(user_request),
        'lighting': extract_lighting(user_request),
        'style': style
    }
    
    # 组合成流畅句子
    prompt = f"{components['subject']}, "
    prompt += f"{components['action']}, "
    prompt += f"{components['context']}, "
    prompt += f"{components['composition']}, "
    prompt += f"{components['lighting']}, "
    prompt += f"{components['style']}"
    
    return prompt

# 常用风格映射
STYLE_MAP = {
    'photorealistic': 'photorealistic, 4K, high detail, professional photography',
    'anime': 'anime style, cel shaded, vibrant colors, studio ghibli inspired',
    'cinematic': 'cinematic, film grain, anamorphic lens flare, movie still',
    'digital-art': 'digital art, concept art, artstation trending, sharp focus',
    'oil-painting': 'oil painting style, brush strokes visible, classical technique',
    'watercolor': 'watercolor painting, soft edges, paper texture visible',
}
```

### 负面提示词（通用）
```
blurry, low quality, distorted, deformed, watermark, text overlay, 
logo, signature, username, low resolution, amateur, cartoonish
```

---

## 4. 模板Gallery系统

### 场景模板库

```python
IMAGE_TEMPLATES = {
    'portrait': {
        'keywords': [' portrait', '人像', '头像', '写真'],
        'prompt': '{subject}, {action}, {context}, {composition}, soft natural lighting, {style}',
        'best_for': '人物特写、头像、形象照'
    },
    'product': {
        'keywords': ['product', '产品', '商品', '展示'],
        'prompt': 'professional product photography of {subject}, {context}, studio lighting, clean background, commercial quality, {style}',
        'best_for': '电商产品、产品展示'
    },
    'landscape': {
        'keywords': ['landscape', '风景', ' scenery', 'nature'],
        'prompt': '{context}, wide shot, {composition}, golden hour lighting, {style}',
        'best_for': '风景、自然、环境'
    },
    'concept': {
        'keywords': ['concept', 'concept art', '概念', '设计'],
        'prompt': 'concept art of {subject}, {action}, {context}, detailed, artstation trending, {style}',
        'best_for': '概念设计、创意插画'
    },
    'scene': {
        'keywords': ['scene', '场景', 'environment', '室内'],
        'prompt': 'interior/exterior design of {context}, {subject}, {composition}, {lighting}, {style}',
        'best_for': '室内设计、场景构建'
    },
    'ecommerce': {
        'keywords': ['shop', 'store', '店铺', '电商'],
        'prompt': 'professional e-commerce photography, {subject}, {context}, white background, studio lighting, {style}',
        'best_for': '电商主图、商业摄影'
    }
}

def match_template(user_input):
    """从用户输入匹配最佳模板"""
    user_lower = user_input.lower()
    best_match = None
    best_score = 0
    
    for name, template in IMAGE_TEMPLATES.items():
        score = sum(1 for kw in template['keywords'] if kw.lower() in user_lower)
        if score > best_score:
            best_score = score
            best_match = (name, template)
    
    return best_match if best_score > 0 else ('generic', None)
```

---

## 5. API调用与图片保存

### 完整生成流程
```python
import urllib.request, ssl, json, base64, pathlib, time

def generate_image(api_config, prompt, model='gpt-image-2', 
                   size='1024x1024', save_dir='.', quality='high'):
    """完整生图流程"""
    
    # 1. 选择端点
    base = api_config['base_url'].rstrip('/')
    key = api_config['api_key']
    
    endpoints = [
        f'{base}/v1/images/generations',
        f'{base}/images/generations',
    ]
    
    last_error = None
    
    for endpoint in endpoints:
        try:
            # 2. 构建请求
            payload = {
                'model': model,
                'prompt': prompt,
                'size': size,
                'n': 1,
                'quality': quality
            }
            
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(payload).encode(),
                headers={
                    'Authorization': f'Bearer {key}',
                    'Content-Type': 'application/json'
                }
            )
            
            # 3. 发送请求（180秒超时）
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, context=ctx, timeout=180) as r:
                response = json.loads(r.read().decode())
            
            # 4. 解析结果
            if 'data' in response and len(response['data']) > 0:
                image_data = response['data'][0]
                
                # 5. 保存图片
                if 'b64_json' in image_data:
                    # Base64格式
                    img_bytes = base64.b64decode(image_data['b64_json'])
                elif 'url' in image_data:
                    # URL格式，需要下载
                    img_bytes = download_image(image_data['url'])
                else:
                    return {'success': False, 'error': 'unknown_format'}
                
                # 6. 写文件
                timestamp = int(time.time())
                output_path = pathlib.Path(save_dir) / f'image_{timestamp}.png'
                output_path.write_bytes(img_bytes)
                
                return {
                    'success': True,
                    'path': str(output_path),
                    'model': model,
                    'size': size
                }
                
        except Exception as e:
            last_error = str(e)
            continue
    
    return {'success': False, 'error': last_error}

def download_image(url):
    """下载图片"""
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()
```

---

## 6. Session记忆与持久化

### 学习数据结构
```python
SESSION_MEMORY = {
    'preferred_api': None,        # 最常用的API配置
    'preferred_model': None,      # 最成功的模型
    'preferred_size': None,       # 用户偏好尺寸
    'preferred_style': None,      # 常用风格
    'last_save_dir': None,       # 上次保存目录
    'success_count': 0,          # 成功次数
    'fail_count': 0,            # 失败次数
    'api_errors': {},            # 各API错误记录
}

def save_session_learning(memory_file='~/.image_gen_session.json'):
    """持久化学到的经验"""
    import json, os
    path = os.path.expanduser(memory_file)
    with open(path, 'w') as f:
        json.dump(SESSION_MEMORY, f, indent=2)

def load_session_learning(memory_file='~/.image_gen_session.json'):
    """加载已有经验"""
    import json, os
    path = os.path.expanduser(memory_file)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return SESSION_MEMORY.copy()
```

### 操作笔记（Operational Notes）
```python
OPERATIONAL_NOTES = """
# Session Learning Rules

1. **API切换策略**
   - 如果当前API连续2次失败，自动切换到下一个可用API
   - 记录每个API的错误类型，帮助诊断

2. **模型回退顺序**
   gpt-image-2 → dall-e-3 → dalle-3 → stable-diffusion-xl → any-available

3. **尺寸回退**
   2048x1024 → 1792x1024 → 1024x1024 → 512x512

4. **目录记忆**
   如果用户指定保存目录，记住该目录，后续默认使用

5. **风格记忆**
   如果用户多次使用某种风格，后续优先推荐该风格
"""
```

---

## 7. 多模型支持检测

### 自动选择最佳模型
```python
def select_best_model(api_config):
    """根据API能力自动选择最佳模型"""
    
    models_priority = [
        'gpt-image-2',
        'dall-e-3', 
        'dalle-3',
        'stable-diffusion-xl',
        'any-available'
    ]
    
    for model in models_priority:
        result = validate_model(api_config, model)
        if result['available']:
            return {'model': model, 'endpoint': result.get('endpoint')}
    
    return None
```

---

## 8. 完整工作流示例

```
用户: "帮我生成一张机器人咖啡师的图片"

AI执行流程:
1. 意图识别 → 生图请求
2. API发现 → 检查环境变量/配置文件
3. 模型验证 → 尝试 gpt-image-2
4. 模板匹配 → concept art模板
5. 提示词构建 → Nano-Banana公式
6. API调用 → POST /v1/images/generations
7. 结果解析 → 提取 b64_json
8. 图片保存 → ~/Downloads/image_12345.png
9. Session记忆 → 更新成功率
```

---

## 9. 错误处理与恢复

### 错误代码映射
| 错误 | 原因 | 解决措施 |
|------|------|----------|
| 401 | API密钥无效 | 检查环境变量配置 |
| 403 | 权限不足 | 确认API Key权限 |
| 404 | 端点不存在 | 尝试其他endpoint |
| 429 | 请求过多 | 等待后重试 |
| 400 | 参数错误 | 检查尺寸/格式支持 |
| 500 | 服务器错误 | 切换API |
| timeout | 超时 | 增加超时时间 |

### 指数退避重试
```python
def retry_with_backoff(func, max_retries=3, base_delay=2):
    """指数退避重试"""
    import time
    
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            time.sleep(delay)
    
    return None
```

---

## 10. 使用示例

### 基础生图
```
用户: 生成一张赛博朋克风格的城市图片
AI: 
1. 发现API: OPENAI_BASE_URL
2. 验证模型: gpt-image-2 ✓
3. 构建提示词: "futuristic cyberpunk city, neon lights, rainy streets, blade runner aesthetic, cinematic, 4K"
4. 调用API...
5. 保存: ~/Downloads/image_1699999999.png
```

### 指定风格
```
用户: 用动漫风格生成一个在海边看日落的女孩
AI:
1. 匹配模板: anime
2. 构建提示词: "girl standing on beach watching sunset, anime style, studio ghibli inspired, warm orange sky, gentle breeze, detailed hair"
3. 执行生成...
```

### 指定目录
```
用户: 把图片保存到 ~/my-images 目录
AI:
1. 创建目录（如不存在）
2. 执行生成
3. 保存到 ~/my-images/image_xxx.png
4. 记住该目录供后续使用
```

---

## 11. 验证标准

- [ ] 能发现至少一个已配置API
- [ ] `/v1/models` 返回200
- [ ] 至少一个生图模型可用
- [ ] `/v1/images/generations` 返回200
- [ ] 响应包含 `b64_json` 或 `url`
- [ ] 图片成功写入本地文件
- [ ] Session记忆正确更新

---

## 参考文件

- `references/clawto-api-notes.md` — 已知网关行为记录
- `references/gallery/` — 提示词Gallery目录（按需加载）

---

**版本历史**
- v2.0.0: 完整重构，添加多模型支持、结构化提示词、模板Gallery、Session记忆
- v1.1.2: 基础生图功能
