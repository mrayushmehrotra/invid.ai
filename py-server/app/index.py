from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re

app = FastAPI(title="YouTube Metadata Generator", version="2.0.0")


class MetadataRequest(BaseModel):
    video_topic: str
    video_description: Optional[str] = None
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None


class MetadataResponse(BaseModel):
    titles: List[str]
    description: str
    hashtags: List[str]
    tags: List[str]


class DynamicGenerateRequest(BaseModel):
    """
    Dynamic generation request that allows frontend to specify which fields to generate.
    
    Example structures:
    - {"title": ""} -> generates only title
    - {"title": "", "description": ""} -> generates title and description
    - {"hashtags": []} -> generates only hashtags
    - {"title": "", "tags": [], "hashtags": []} -> generates title, tags, and hashtags
    
    Supported field keys:
    - "title" or "titles" -> generates SEO-optimized titles
    - "description" -> generates video description
    - "hashtags" -> generates hashtags
    - "tags" -> generates tags
    """
    video_topic: str
    video_description: Optional[str] = None
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None
    structure: Dict[str, Any]  # The JSON structure defining what to generate


# YouTube SEO Best Practices 2024:
# - Titles: 60-70 chars max, keyword at the beginning, power words, numbers
# - Description: 5000 chars max, first 150 chars crucial ("above the fold")
# - Tags: 500 character limit total, 5-8 focused tags recommended
# - Hashtags: Max 15, but 3-5 is optimal. Placed in description.


class YouTubeSEOGenerator:
    """
    YouTube SEO-optimized metadata generator based on 2024 algorithm best practices.
    
    Key algorithm factors:
    - Click-through rate (CTR) - compelling titles & thumbnails
    - Watch time - engaging content hooks in descriptions
    - Engagement - calls to action, questions
    - Relevance - keyword matching in titles, descriptions, tags
    """

    def __init__(self):
        # Power words that increase CTR (Click-Through Rate)
        self.power_words = [
            "Ultimate", "Complete", "Essential", "Proven", "Secret",
            "Easy", "Quick", "Simple", "Best", "Top", "Must-Know",
            "Expert", "Pro", "Master", "Beginner", "Advanced",
            "Step-by-Step", "Definitive", "Comprehensive", "Practical"
        ]
        
        # Emotional triggers for engagement
        self.emotional_triggers = [
            "Amazing", "Incredible", "Shocking", "Surprising", "Mind-Blowing",
            "Game-Changing", "Life-Changing", "Powerful", "Brilliant", "Genius"
        ]
        
        # Call-to-action phrases
        self.ctas = [
            "👍 Like this video if you found it helpful!",
            "🔔 Subscribe and hit the bell for more content like this!",
            "💬 Drop a comment below with your thoughts!",
            "📢 Share this with someone who needs to see it!",
            "👇 Let me know in the comments what you want to see next!"
        ]
        
        # SEO-optimized description templates (first 150 chars are crucial!)
        self.description_templates = [
            """🎯 {topic} - Everything you need to know!

In this video, you'll learn {topic} designed specifically for {audience}. Whether you're just starting out or looking to level up, this guide covers it all.

📌 KEY HIGHLIGHTS:
• Complete breakdown of {topic}
• Practical tips you can apply immediately  
• Common mistakes to avoid
• Expert strategies for success

⏱️ TIMESTAMPS:
0:00 - Introduction
0:30 - Getting Started
2:00 - Core Concepts
5:00 - Advanced Tips
8:00 - Summary & Next Steps

🔗 RESOURCES & LINKS:
• [Add your links here]

{cta1}
{cta2}

📧 CONNECT WITH ME:
• [Your social links]

🔍 RELATED SEARCHES:
{keyword_section}

{hashtag_section}

#shorts #viral #trending""",

            """✨ Master {topic} in this comprehensive guide!

{topic} explained step-by-step for {audience}. This is the only tutorial you'll ever need!

🎁 WHAT YOU'LL LEARN:
✅ Fundamentals of {topic}
✅ Hands-on examples and demonstrations
✅ Pro tips from industry experts
✅ Actionable takeaways

⏱️ VIDEO CHAPTERS:
0:00 - Welcome & Overview
1:00 - Why {topic} Matters
3:00 - Step-by-Step Guide
6:00 - Tips & Tricks
9:00 - Final Thoughts

💡 PRO TIP: Watch until the end for a bonus tip!

{cta1}
{cta2}

📚 MENTIONED IN THIS VIDEO:
• [Add resources]

🔍 SEARCH TERMS:
{keyword_section}

{hashtag_section}""",

            """🚀 {topic} - The Complete {audience} Guide [{year}]

Stop struggling with {topic}! This video breaks down everything in simple, easy-to-follow steps.

📋 IN THIS VIDEO:
→ What is {topic} and why it matters
→ Step-by-step walkthrough
→ Real examples and use cases
→ Common pitfalls and how to avoid them
→ Best practices for {audience}

⏱️ CHAPTERS:
0:00 Introduction
0:45 Prerequisites  
2:00 Getting Started
4:30 Deep Dive
7:00 Examples
9:30 Wrap Up

{cta1}

🎯 WHO IS THIS FOR?
This video is perfect for {audience} who want to understand {topic} quickly and effectively.

{cta2}

{keyword_section}

{hashtag_section}"""
        ]

    def generate_titles(
        self, 
        topic: str, 
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """
        Generate SEO-optimized titles following YouTube 2024 best practices:
        - Keep under 60-70 characters
        - Put main keyword at the beginning
        - Use power words and numbers
        - Create curiosity without clickbait
        """
        topic_clean = topic.strip()
        audience_clean = audience.strip()
        
        # Extract the core keyword for SEO
        main_keyword = keywords[0] if keywords else topic_clean
        
        titles = []
        
        # Format 1: Keyword First + Power Word (Best for SEO)
        titles.append(f"{topic_clean}: Complete Guide for {audience_clean}")
        
        # Format 2: How-to Format (High CTR)
        titles.append(f"How to {topic_clean} - {audience_clean} Tutorial")
        
        # Format 3: Number + Power Word (Proven CTR boost)
        titles.append(f"5 Steps to Master {topic_clean} (Even for {audience_clean})")
        
        # Format 4: Question Format (Creates curiosity)
        titles.append(f"Want to Learn {topic_clean}? Start Here!")
        
        # Format 5: Year-based (Shows freshness)
        titles.append(f"{topic_clean} Tutorial 2024 | {audience_clean} Guide")
        
        # Format 6: Ultimate/Complete (Authority signal)
        titles.append(f"The Ultimate {topic_clean} Crash Course")
        
        # Format 7: Problem-Solution (Addresses pain points)
        titles.append(f"Stop Struggling with {topic_clean} - Easy Method")
        
        # Format 8: Bracket technique (Proven to increase CTR)
        titles.append(f"{topic_clean} Explained [{audience_clean} Friendly]")
        
        # Filter titles to be under 70 characters (YouTube best practice)
        valid_titles = [t for t in titles if len(t) <= 70]
        
        # If all are too long, truncate intelligently
        if not valid_titles:
            valid_titles = [t[:67] + "..." for t in titles[:5]]
        
        return valid_titles[:5]  # Return top 5 titles

    def generate_description(
        self,
        topic: str,
        description: Optional[str] = None,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None,
    ) -> str:
        """
        Generate SEO-optimized YouTube description following 2024 best practices:
        - First 100-150 chars are crucial (shown in search results)
        - Include main keyword in first 25 words
        - Add timestamps/chapters for better engagement
        - Include 3-5 hashtags
        - Add CTAs for engagement
        - Keep under 5000 characters
        """
        import random
        from datetime import datetime
        
        topic_clean = topic.strip()
        audience_clean = audience.strip()
        year = datetime.now().year
        
        # Select a template randomly
        template = random.choice(self.description_templates)
        
        # Generate keyword section for description
        keyword_section = ""
        if keywords:
            keyword_section = "Related topics: " + ", ".join(keywords[:8])
        
        # Generate hashtag section (3-5 hashtags is optimal)
        hashtags = self._generate_hashtags_for_description(topic_clean, audience_clean, keywords)
        hashtag_section = " ".join(hashtags[:5])
        
        # Select CTAs
        ctas = random.sample(self.ctas, min(2, len(self.ctas)))
        
        # Build description
        desc = template.format(
            topic=topic_clean,
            audience=audience_clean,
            year=year,
            keyword_section=keyword_section,
            hashtag_section=hashtag_section,
            cta1=ctas[0] if len(ctas) > 0 else "",
            cta2=ctas[1] if len(ctas) > 1 else "",
        )
        
        # Ensure description is under 5000 characters
        if len(desc) > 5000:
            desc = desc[:4997] + "..."
            
        return desc

    def _generate_hashtags_for_description(
        self,
        topic: str,
        audience: str,
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """Generate hashtags for description (max 15, but 3-5 recommended)"""
        hashtags = []
        
        # Create hashtag from topic
        topic_hashtag = "#" + re.sub(r"[^a-zA-Z0-9]", "", topic)
        hashtags.append(topic_hashtag)
        
        # Add tutorial hashtag
        hashtags.append("#" + re.sub(r"[^a-zA-Z0-9]", "", topic) + "Tutorial")
        
        # Add audience hashtag
        audience_hashtag = "#" + re.sub(r"[^a-zA-Z0-9]", "", audience)
        hashtags.append(audience_hashtag)
        
        # Add keyword-based hashtags
        if keywords:
            for kw in keywords[:3]:
                kw_clean = "#" + re.sub(r"[^a-zA-Z0-9]", "", kw)
                if kw_clean not in hashtags:
                    hashtags.append(kw_clean)
        
        # Add trending/evergreen hashtags
        hashtags.extend(["#HowTo", "#Tutorial", "#LearnOnYouTube", "#Education"])
        
        return hashtags[:10]  # Return max 10 for safety

    def generate_hashtags(
        self, 
        topic: str, 
        audience: str = "beginners",
        keywords: Optional[List[str]] = None
    ) -> List[str]:
        """
        Generate optimized hashtags following YouTube 2024 guidelines:
        - Max 15 hashtags allowed (YouTube ignores all if exceeded)
        - 3-5 is optimal for discoverability
        - First 3 appear above video title on mobile
        - No spaces allowed in hashtags
        """
        hashtags = []
        
        # Clean topic for hashtag
        topic_clean = re.sub(r"[^a-zA-Z0-9]", "", topic).lower()
        
        # Primary hashtags (most important - these appear above title)
        hashtags.append(f"#{topic_clean}")
        hashtags.append(f"#{topic_clean}tutorial")
        hashtags.append(f"#howto{topic_clean}")
        
        # Audience-based hashtags
        audience_clean = re.sub(r"[^a-zA-Z0-9]", "", audience).lower()
        hashtags.append(f"#{audience_clean}")
        hashtags.append(f"#{topic_clean}for{audience_clean}")
        
        # Keyword-based hashtags
        if keywords:
            for kw in keywords[:3]:
                kw_clean = "#" + re.sub(r"[^a-zA-Z0-9]", "", kw).lower()
                if kw_clean not in hashtags:
                    hashtags.append(kw_clean)
        
        # Trending/viral hashtags
        hashtags.extend([
            "#tutorial",
            "#howto",
            "#learn",
            "#education",
            "#tips",
            "#guide",
            "#2024"
        ])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_hashtags = []
        for h in hashtags:
            if h.lower() not in seen:
                seen.add(h.lower())
                unique_hashtags.append(h)
        
        return unique_hashtags[:15]  # YouTube max is 15

    def generate_tags(
        self,
        topic: str,
        audience: str = "beginners",
        keywords: Optional[List[str]] = None,
    ) -> List[str]:
        """
        Generate SEO-optimized tags following YouTube 2024 best practices:
        - 500 character limit for all tags combined
        - First tag should be the main keyword (highest weight)
        - Mix of broad and specific (long-tail) keywords
        - Include brand name, variations, and related terms
        - 5-8 focused tags is recommended vs filling the limit
        """
        tags = []
        topic_lower = topic.lower().strip()
        audience_lower = audience.lower().strip()
        
        # PRIMARY TAGS (Most important - put first)
        # The first tag carries the most weight
        tags.append(topic_lower)  # Exact match
        
        # LONG-TAIL KEYWORD TAGS (Specific - less competition)
        tags.append(f"{topic_lower} tutorial")
        tags.append(f"{topic_lower} for {audience_lower}")
        tags.append(f"how to {topic_lower}")
        tags.append(f"learn {topic_lower}")
        tags.append(f"{topic_lower} guide")
        tags.append(f"{topic_lower} explained")
        tags.append(f"{topic_lower} step by step")
        tags.append(f"{topic_lower} tips")
        tags.append(f"{topic_lower} course")
        tags.append(f"{topic_lower} 2024")
        tags.append(f"best {topic_lower} tutorial")
        tags.append(f"{topic_lower} for beginners")
        tags.append(f"{topic_lower} crash course")
        
        # AUDIENCE-SPECIFIC TAGS
        tags.append(f"{audience_lower} {topic_lower}")
        tags.append(f"{topic_lower} {audience_lower} guide")
        
        # KEYWORD-BASED TAGS (from user input)
        if keywords:
            for kw in keywords:
                kw_clean = kw.lower().strip()
                if kw_clean and kw_clean not in tags:
                    tags.append(kw_clean)
                    # Also add variations
                    tags.append(f"{kw_clean} tutorial")
                    tags.append(f"how to {kw_clean}")
        
        # BROAD/GENERIC TAGS (Higher competition but more reach)
        generic_tags = [
            "tutorial",
            "how to",
            "guide",
            "tips",
            "learn",
            "education",
            "training",
            "course",
            "lesson",
            "beginner friendly",
            "step by step",
            "easy tutorial",
            "quick tutorial",
            "complete guide",
            "full tutorial",
            "2024 tutorial",
        ]
        tags.extend(generic_tags)
        
        # Remove duplicates while preserving order (first occurrence)
        seen = set()
        unique_tags = []
        for tag in tags:
            tag_normalized = tag.lower().strip()
            if tag_normalized and tag_normalized not in seen:
                seen.add(tag_normalized)
                unique_tags.append(tag)
        
        # Enforce 500 character limit
        final_tags = []
        total_chars = 0
        for tag in unique_tags:
            # Each tag plus comma separator
            tag_length = len(tag) + 1
            if total_chars + tag_length <= 498:  # Leave buffer
                final_tags.append(tag)
                total_chars += tag_length
            else:
                break
        
        return final_tags


# Initialize the SEO generator
seo_generator = YouTubeSEOGenerator()


@app.get("/")
async def root():
    return {
        "message": "YouTube SEO Metadata Generator API v2.0",
        "status": "active",
        "features": [
            "SEO-optimized titles (60-70 char limit)",
            "Engaging descriptions with timestamps and CTAs",
            "Strategic hashtags (max 15)",
            "Tags optimized for 500 char limit",
            "2024 YouTube algorithm best practices"
        ]
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}


@app.post("/generate/metadata", response_model=MetadataResponse)
async def generate_metadata(request: MetadataRequest):
    """
    Generate complete YouTube metadata optimized for SEO and the 2024 algorithm.
    
    Returns:
    - titles: 5 SEO-optimized title options (under 70 chars each)
    - description: Engaging description with timestamps, CTAs, and keywords
    - hashtags: 10-15 relevant hashtags
    - tags: Up to 500 characters of relevant tags
    """
    try:
        audience = request.target_audience or "beginners"

        titles = seo_generator.generate_titles(
            request.video_topic, 
            audience,
            request.keywords
        )
        description = seo_generator.generate_description(
            request.video_topic, 
            request.video_description, 
            audience, 
            request.keywords
        )
        hashtags = seo_generator.generate_hashtags(
            request.video_topic, 
            audience,
            request.keywords
        )
        tags = seo_generator.generate_tags(
            request.video_topic, 
            audience, 
            request.keywords
        )

        return MetadataResponse(
            titles=titles, 
            description=description, 
            hashtags=hashtags, 
            tags=tags
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating metadata: {str(e)}"
        )


@app.post("/generate/titles")
async def generate_titles(request: MetadataRequest):
    """Generate SEO-optimized video titles"""
    try:
        audience = request.target_audience or "beginners"
        titles = seo_generator.generate_titles(
            request.video_topic, 
            audience,
            request.keywords
        )
        return {"titles": titles}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating titles: {str(e)}"
        )


@app.post("/generate/description")
async def generate_description(request: MetadataRequest):
    """Generate SEO-optimized video description with timestamps and CTAs"""
    try:
        audience = request.target_audience or "beginners"
        description = seo_generator.generate_description(
            request.video_topic, 
            request.video_description, 
            audience, 
            request.keywords
        )
        return {"description": description}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating description: {str(e)}"
        )


@app.post("/generate/hashtags")
async def generate_hashtags(request: MetadataRequest):
    """Generate optimized hashtags (max 15 as per YouTube guidelines)"""
    try:
        audience = request.target_audience or "beginners"
        hashtags = seo_generator.generate_hashtags(
            request.video_topic, 
            audience,
            request.keywords
        )
        return {"hashtags": hashtags}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating hashtags: {str(e)}"
        )


@app.post("/generate/tags")
async def generate_tags(request: MetadataRequest):
    """Generate SEO tags optimized for 500 character limit"""
    try:
        audience = request.target_audience or "beginners"
        tags = seo_generator.generate_tags(
            request.video_topic, 
            audience, 
            request.keywords
        )
        return {"tags": tags, "total_characters": sum(len(t) for t in tags) + len(tags)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating tags: {str(e)}")


@app.post("/generate/dynamic")
async def generate_dynamic(request: DynamicGenerateRequest):
    """
    Generate YouTube metadata based on the structure provided by the frontend.
    
    Only generates the fields specified in the 'structure' parameter.
    The response will mirror the structure with generated values.
    
    Example request:
    {
        "video_topic": "Python Programming",
        "target_audience": "beginners",
        "structure": {
            "title": ""
        }
    }
    
    Example response:
    {
        "title": "Python Programming: Complete Guide for beginners"
    }
    
    Supported structure keys:
    - "title" or "titles": Returns a single best title or list of titles
    - "description": Returns SEO-optimized description
    - "hashtags": Returns list of hashtags
    - "tags": Returns list of tags
    
    You can request any combination:
    - {"title": ""} -> only title
    - {"title": "", "description": ""} -> title and description
    - {"hashtags": [], "tags": []} -> hashtags and tags
    """
    try:
        audience = request.target_audience or "beginners"
        structure = request.structure
        response = {}
        
        # Normalize structure keys to lowercase for matching
        structure_keys = {k.lower(): k for k in structure.keys()}
        
        # Generate only the requested fields
        
        # Handle title/titles
        if "title" in structure_keys or "titles" in structure_keys:
            titles = seo_generator.generate_titles(
                request.video_topic,
                audience,
                request.keywords
            )
            # Use the original key from the structure
            if "title" in structure_keys:
                # If singular "title", return just the best one
                original_key = structure_keys["title"]
                response[original_key] = titles[0] if titles else ""
            if "titles" in structure_keys:
                # If plural "titles", return the full list
                original_key = structure_keys["titles"]
                response[original_key] = titles
        
        # Handle description
        if "description" in structure_keys:
            original_key = structure_keys["description"]
            description = seo_generator.generate_description(
                request.video_topic,
                request.video_description,
                audience,
                request.keywords
            )
            response[original_key] = description
        
        # Handle hashtags
        if "hashtags" in structure_keys:
            original_key = structure_keys["hashtags"]
            hashtags = seo_generator.generate_hashtags(
                request.video_topic,
                audience,
                request.keywords
            )
            response[original_key] = hashtags
        
        # Handle tags
        if "tags" in structure_keys:
            original_key = structure_keys["tags"]
            tags = seo_generator.generate_tags(
                request.video_topic,
                audience,
                request.keywords
            )
            response[original_key] = tags
        
        # If no valid keys were found in structure
        if not response:
            raise HTTPException(
                status_code=400,
                detail="Invalid structure. Supported keys: title, titles, description, hashtags, tags"
            )
        
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating metadata: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
