"""
YouTube Metadata Generator API v4.0
Powered by LangChain + HuggingFace Transformers (Local AI)
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import re
import json
import asyncio
from datetime import datetime
import os

# ===========================================
# CONFIGURATION
# ===========================================
# Model options (smaller = faster, larger = better):
# - "TinyLlama/TinyLlama-1.1B-Chat-v1.0" (1.1B, fast)
# - "microsoft/phi-2" (2.7B, good quality)
# - "Qwen/Qwen2.5-0.5B-Instruct" (0.5B, very fast)

MODEL_NAME = os.getenv("MODEL_NAME", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
USE_AI = True
MAX_NEW_TOKENS = 256

# Global instances
llm_pipeline = None
model_loaded = False
device = "cpu"


# ===========================================
# MODEL LOADING
# ===========================================
def load_model():
    """Load HuggingFace model with LangChain"""
    global llm_pipeline, model_loaded, device
    
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
        from langchain_huggingface import HuggingFacePipeline
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Loading model: {MODEL_NAME}")
        print(f"📍 Device: {device}")
        
        # Load tokenizer
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
        
        # Load model with appropriate settings
        if device == "cuda":
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True,
            )
        else:
            model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME,
                torch_dtype=torch.float32,
                low_cpu_mem_usage=True,
                trust_remote_code=True,
            )
        
        # Create pipeline
        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.eos_token_id,
        )
        
        # Wrap with LangChain
        llm_pipeline = HuggingFacePipeline(pipeline=pipe)
        model_loaded = True
        
        print("✅ Model loaded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        print("⚠️ Falling back to template-only mode")
        model_loaded = False
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup"""
    if USE_AI:
        load_model()
    yield
    global llm_pipeline, model_loaded
    llm_pipeline = None
    model_loaded = False


app = FastAPI(
    title="YouTube Metadata Generator",
    version="4.0.0",
    description="Powered by LangChain + HuggingFace Transformers",
    lifespan=lifespan
)


# ===========================================
# PYDANTIC MODELS
# ===========================================
class MetadataRequest(BaseModel):
    video_topic: str
    video_description: Optional[str] = None
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None
    use_ai: Optional[bool] = True


class MetadataResponse(BaseModel):
    titles: List[str]
    description: str
    hashtags: List[str]
    tags: List[str]
    generated_by: str


class DynamicGenerateRequest(BaseModel):
    video_topic: str
    video_description: Optional[str] = None
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None
    structure: Dict[str, Any]
    use_ai: Optional[bool] = True


# ===========================================
# LANGCHAIN AI GENERATOR
# ===========================================
class LangChainGenerator:
    """AI generator using LangChain + HuggingFace Transformers"""
    
    def is_available(self) -> bool:
        return model_loaded and llm_pipeline is not None
    
    async def _generate(self, prompt: str) -> str:
        """Run generation in thread pool"""
        if not self.is_available():
            return ""
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: llm_pipeline.invoke(prompt)
            )
            return result
        except Exception as e:
            print(f"Generation error: {e}")
            return ""
    
    async def generate_titles(
        self,
        topic: str,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """Generate SEO titles using AI"""
        keywords_str = ", ".join(keywords) if keywords else "none"
        
        prompt = f"""Generate 5 YouTube video titles for the following:
Topic: {topic}
Audience: {audience}
Keywords: {keywords_str}

Rules:
- Each title under 60 characters
- Use power words like "Ultimate", "Complete", "Easy"
- Include numbers when possible
- Make them click-worthy

Return ONLY a JSON array like: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]

JSON:"""

        response = await self._generate(prompt)
        
        try:
            # Extract JSON array
            match = re.search(r'\[.*?\]', response, re.DOTALL)
            if match:
                titles = json.loads(match.group())
                titles = [t.strip()[:70] for t in titles if isinstance(t, str)]
                if titles:
                    return titles[:5]
        except:
            pass
        
        return []
    
    async def generate_description(
        self,
        topic: str,
        description: Optional[str] = None,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> str:
        """Generate video description using AI"""
        keywords_str = ", ".join(keywords) if keywords else ""
        
        prompt = f"""Write a YouTube video description:
Topic: {topic}
Audience: {audience}
Keywords: {keywords_str}

Include:
- Compelling first line (shown in search)
- Bullet points of what viewers will learn
- Timestamps section
- Call to action (like, subscribe)
- Relevant hashtags at the end

Description:"""

        response = await self._generate(prompt)
        
        if response and len(response) > 50:
            # Clean up the response
            desc = response.strip()
            # Remove the prompt if echoed
            if "Description:" in desc:
                desc = desc.split("Description:")[-1].strip()
            return desc[:5000]
        
        return ""
    
    async def generate_hashtags(
        self,
        topic: str,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """Generate hashtags using AI"""
        
        prompt = f"""Generate 10 YouTube hashtags for a video about {topic} for {audience}.
Return ONLY a JSON array like: ["#hashtag1", "#hashtag2", ...]
JSON:"""

        response = await self._generate(prompt)
        
        try:
            match = re.search(r'\[.*?\]', response, re.DOTALL)
            if match:
                hashtags = json.loads(match.group())
                hashtags = [h.strip() for h in hashtags if isinstance(h, str) and h.startswith("#")]
                if hashtags:
                    return hashtags[:15]
        except:
            pass
        
        return []
    
    async def generate_tags(
        self,
        topic: str,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """Generate tags using AI"""
        
        prompt = f"""Generate 15 YouTube SEO tags for a video about {topic} for {audience}.
Return ONLY a JSON array like: ["tag1", "tag2", ...]
JSON:"""

        response = await self._generate(prompt)
        
        try:
            match = re.search(r'\[.*?\]', response, re.DOTALL)
            if match:
                tags = json.loads(match.group())
                tags = [t.strip().lower() for t in tags if isinstance(t, str)]
                # Enforce 500 char limit
                final_tags = []
                total = 0
                for tag in tags:
                    if total + len(tag) + 1 <= 498:
                        final_tags.append(tag)
                        total += len(tag) + 1
                return final_tags
        except:
            pass
        
        return []


# ===========================================
# TEMPLATE GENERATOR (Fallback)
# ===========================================
class TemplateGenerator:
    """Rule-based fallback generator"""
    
    def __init__(self):
        self.description_template = """🎯 {topic} - Everything you need to know!

Learn {topic} designed for {audience}. This guide covers everything from basics to advanced tips.

📌 WHAT YOU'LL LEARN:
• Complete breakdown of {topic}
• Practical tips you can apply immediately
• Common mistakes to avoid
• Expert strategies for success

⏱️ TIMESTAMPS:
0:00 - Introduction
0:30 - Getting Started
2:00 - Core Concepts
5:00 - Advanced Tips
8:00 - Summary

👍 Like this video if you find it helpful!
🔔 Subscribe for more content like this!
💬 Comment below with your questions!

🔍 Related: {keywords}

{hashtags}"""

    def generate_titles(self, topic: str, audience: str, keywords: Optional[List[str]] = None) -> List[str]:
        t = topic.strip()
        a = audience.strip()
        return [
            f"{t}: Complete Guide for {a}",
            f"How to {t} - {a} Tutorial",
            f"5 Steps to Master {t} ({a})",
            f"The Ultimate {t} Crash Course",
            f"{t} Explained [{a} Friendly]",
        ][:5]

    def generate_description(self, topic: str, description: Optional[str], audience: str, keywords: Optional[List[str]]) -> str:
        keywords_str = ", ".join(keywords[:5]) if keywords else topic
        hashtags = " ".join(self.generate_hashtags(topic, audience, keywords)[:5])
        return self.description_template.format(
            topic=topic.strip(),
            audience=audience.strip(),
            keywords=keywords_str,
            hashtags=hashtags
        )

    def generate_hashtags(self, topic: str, audience: str, keywords: Optional[List[str]] = None) -> List[str]:
        topic_clean = re.sub(r"[^a-zA-Z0-9]", "", topic).lower()
        hashtags = [
            f"#{topic_clean}",
            f"#{topic_clean}tutorial",
            f"#howto{topic_clean}",
            "#tutorial",
            "#howto",
            "#learn",
            "#education",
        ]
        if keywords:
            for kw in keywords[:3]:
                hashtags.append("#" + re.sub(r"[^a-zA-Z0-9]", "", kw).lower())
        return list(dict.fromkeys(hashtags))[:15]

    def generate_tags(self, topic: str, audience: str, keywords: Optional[List[str]] = None) -> List[str]:
        t = topic.lower().strip()
        a = audience.lower().strip()
        tags = [t, f"{t} tutorial", f"{t} for {a}", f"how to {t}", f"learn {t}", 
                f"{t} guide", "tutorial", "how to", "guide", "learn"]
        if keywords:
            tags.extend([kw.lower().strip() for kw in keywords])
        
        final = []
        total = 0
        for tag in dict.fromkeys(tags):
            if total + len(tag) + 1 <= 498:
                final.append(tag)
                total += len(tag) + 1
        return final


# ===========================================
# HYBRID GENERATOR
# ===========================================
class HybridGenerator:
    """Uses AI when available, falls back to templates"""
    
    def __init__(self):
        self.ai = LangChainGenerator()
        self.template = TemplateGenerator()
    
    def check_ai(self) -> bool:
        return self.ai.is_available()
    
    async def generate_titles(self, topic: str, audience: str, keywords: Optional[List[str]], use_ai: bool = True) -> tuple:
        if use_ai and USE_AI and self.check_ai():
            titles = await self.ai.generate_titles(topic, audience, keywords)
            if titles:
                return titles, "ai"
        return self.template.generate_titles(topic, audience, keywords), "template"
    
    async def generate_description(self, topic: str, description: Optional[str], audience: str, keywords: Optional[List[str]], use_ai: bool = True) -> tuple:
        if use_ai and USE_AI and self.check_ai():
            desc = await self.ai.generate_description(topic, description, audience, keywords)
            if desc:
                return desc, "ai"
        return self.template.generate_description(topic, description, audience, keywords), "template"
    
    async def generate_hashtags(self, topic: str, audience: str, keywords: Optional[List[str]], use_ai: bool = True) -> tuple:
        if use_ai and USE_AI and self.check_ai():
            hashtags = await self.ai.generate_hashtags(topic, audience, keywords)
            if hashtags:
                return hashtags, "ai"
        return self.template.generate_hashtags(topic, audience, keywords), "template"
    
    async def generate_tags(self, topic: str, audience: str, keywords: Optional[List[str]], use_ai: bool = True) -> tuple:
        if use_ai and USE_AI and self.check_ai():
            tags = await self.ai.generate_tags(topic, audience, keywords)
            if tags:
                return tags, "ai"
        return self.template.generate_tags(topic, audience, keywords), "template"


# Initialize generator
generator = HybridGenerator()


# ===========================================
# API ENDPOINTS
# ===========================================
@app.get("/")
async def root():
    return {
        "message": "YouTube Metadata Generator API v4.0",
        "status": "active",
        "ai_enabled": USE_AI,
        "ai_available": generator.check_ai(),
        "ai_model": MODEL_NAME if generator.check_ai() else None,
        "device": device,
        "framework": "LangChain + HuggingFace Transformers",
        "features": [
            "🤖 Local AI (no API keys needed)",
            "🔥 HuggingFace Transformers",
            "🦜 LangChain integration",
            "📝 Template fallback",
            "SEO-optimized output",
        ]
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "ai_loaded": generator.check_ai(),
        "model": MODEL_NAME,
        "device": device
    }


@app.get("/ai/status")
async def ai_status():
    return {
        "available": generator.check_ai(),
        "model": MODEL_NAME,
        "device": device,
        "framework": "LangChain + HuggingFace",
        "instructions": {
            "install": "pip install langchain-huggingface transformers torch accelerate",
            "models": [
                "TinyLlama/TinyLlama-1.1B-Chat-v1.0 (1.1B, fast)",
                "microsoft/phi-2 (2.7B, better quality)",
                "Qwen/Qwen2.5-0.5B-Instruct (0.5B, fastest)",
            ]
        } if not generator.check_ai() else None
    }


@app.post("/generate/metadata", response_model=MetadataResponse)
async def generate_metadata(request: MetadataRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True

        titles, t_src = await generator.generate_titles(request.video_topic, audience, request.keywords, use_ai)
        description, d_src = await generator.generate_description(request.video_topic, request.video_description, audience, request.keywords, use_ai)
        hashtags, h_src = await generator.generate_hashtags(request.video_topic, audience, request.keywords, use_ai)
        tags, tag_src = await generator.generate_tags(request.video_topic, audience, request.keywords, use_ai)

        generated_by = "ai" if "ai" in [t_src, d_src, h_src, tag_src] else "template"

        return MetadataResponse(
            titles=titles,
            description=description,
            hashtags=hashtags,
            tags=tags,
            generated_by=generated_by
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/titles")
async def generate_titles(request: MetadataRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True
        titles, source = await generator.generate_titles(request.video_topic, audience, request.keywords, use_ai)
        return {"titles": titles, "generated_by": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/description")
async def generate_description(request: MetadataRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True
        description, source = await generator.generate_description(request.video_topic, request.video_description, audience, request.keywords, use_ai)
        return {"description": description, "generated_by": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/hashtags")
async def generate_hashtags(request: MetadataRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True
        hashtags, source = await generator.generate_hashtags(request.video_topic, audience, request.keywords, use_ai)
        return {"hashtags": hashtags, "generated_by": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/tags")
async def generate_tags(request: MetadataRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True
        tags, source = await generator.generate_tags(request.video_topic, audience, request.keywords, use_ai)
        return {"tags": tags, "total_characters": sum(len(t) for t in tags) + len(tags), "generated_by": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/dynamic")
async def generate_dynamic(request: DynamicGenerateRequest):
    try:
        audience = request.target_audience or "beginners"
        use_ai = request.use_ai if request.use_ai is not None else True
        structure = request.structure
        response = {}
        sources = []
        
        keys = {k.lower(): k for k in structure.keys()}
        
        if "title" in keys or "titles" in keys:
            titles, src = await generator.generate_titles(request.video_topic, audience, request.keywords, use_ai)
            sources.append(src)
            if "title" in keys:
                response[keys["title"]] = titles[0] if titles else ""
            if "titles" in keys:
                response[keys["titles"]] = titles
        
        if "description" in keys:
            desc, src = await generator.generate_description(request.video_topic, request.video_description, audience, request.keywords, use_ai)
            sources.append(src)
            response[keys["description"]] = desc
        
        if "hashtags" in keys:
            hashtags, src = await generator.generate_hashtags(request.video_topic, audience, request.keywords, use_ai)
            sources.append(src)
            response[keys["hashtags"]] = hashtags
        
        if "tags" in keys:
            tags, src = await generator.generate_tags(request.video_topic, audience, request.keywords, use_ai)
            sources.append(src)
            response[keys["tags"]] = tags
        
        if not response:
            raise HTTPException(status_code=400, detail="Invalid structure")
        
        response["generated_by"] = "ai" if "ai" in sources else "template"
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
