import json, ollama

PROMPT = """Given this podcast clip transcript, write YouTube Shorts metadata.

Transcript:
\"\"\"{text}\"\"\"

Respond with ONLY valid JSON:
{{"title": "<under 60 chars, hook-driven>", "description": "<2 sentences>", "hashtags": ["#tag1","#tag2","#tag3"]}}
"""

def generate_metadata(clip_text, model="qwen2.5:0.5b"):
    prompt = PROMPT.format(text=clip_text[:1500])
    resp = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    try:
        return json.loads(resp["message"]["content"].strip())
    except json.JSONDecodeError:
        return {"title": "Untitled Clip", "description": "", "hashtags": []}
