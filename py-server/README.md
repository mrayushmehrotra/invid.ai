# YouTube Metadata Generator API

A FastAPI backend for generating YouTube metadata including titles, descriptions, hashtags, and tags using template-based text generation.

## Features

- Generate catchy YouTube titles
- Create compelling video descriptions
- Generate relevant hashtags
- Create discoverable tags
- RESTful API endpoints
- Template-based generation (no heavy AI models required)

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python app/index.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Generate Complete Metadata
```http
POST /generate/metadata
```

**Request Body:**
```json
{
  "video_topic": "Python Programming",
  "video_description": "Learn Python basics for beginners",
  "target_audience": "beginners",
  "keywords": ["python", "programming", "coding"]
}
```

**Response:**
```json
{
  "titles": [
    "Python Programming - Complete Guide for Beginners",
    "How to Python Programming (Step by Step Tutorial)",
    "Python Programming Explained: Everything You Need to Know",
    "Master Python Programming in 10 Minutes | Quick Tutorial",
    "Python Programming for beginners - Tips and Tricks"
  ],
  "description": "Learn all about Python Programming in this comprehensive tutorial...",
  "hashtags": [
    "#pythonprogramming",
    "#pythonprogrammingtutorial",
    "#howtopythonprogramming",
    "#learnpythonprogramming",
    "#pythonprogrammingguide"
  ],
  "tags": [
    "python programming",
    "python programming tutorial",
    "how to python programming",
    "learn python programming",
    "python programming guide"
  ]
}
```

### Individual Endpoints

- `POST /generate/titles` - Generate titles only
- `POST /generate/description` - Generate description only
- `POST /generate/hashtags` - Generate hashtags only
- `POST /generate/tags` - Generate tags only

### Utility Endpoints

- `GET /` - API status
- `GET /health` - Health check

## Usage Examples

### Using curl
```bash
curl -X POST "http://localhost:8000/generate/metadata" \
     -H "Content-Type: application/json" \
     -d '{
       "video_topic": "Web Development",
       "target_audience": "beginners"
     }'
```

### Using Python
```python
import requests

url = "http://localhost:8000/generate/metadata"
data = {
    "video_topic": "Web Development",
    "video_description": "Learn HTML, CSS, and JavaScript",
    "target_audience": "beginners",
    "keywords": ["web", "development", "html", "css", "javascript"]
}

response = requests.post(url, json=data)
metadata = response.json()
print(metadata)
```

## Request Parameters

- `video_topic` (required): The main topic of your video
- `video_description` (optional): Additional context about the video
- `target_audience` (optional): Who the video is for (defaults to "beginners")
- `keywords` (optional): List of relevant keywords for better SEO

## Customization

The templates used for generation can be customized by modifying the `SimpleTextGenerator` class in `app/index.py`. You can:

- Add new title templates
- Modify description templates
- Update hashtag patterns
- Customize tag generation

## Performance

This API uses template-based generation rather than heavy AI models, making it:
- Fast (sub-second response times)
- Lightweight (minimal resource usage)
- Reliable (no external dependencies)
- Easy to deploy

## Future Enhancements

- Integration with local AI models (Ollama, etc.)
- Custom template management
- Batch processing
- Analytics and tracking
- Export to different formats