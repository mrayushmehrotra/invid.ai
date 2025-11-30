# YouTube Manager - Save Changes Pipeline Documentation

## Overview
Complete implementation of the video metadata update feature with AI-powered suggestions and one-click application.

## Pipeline Flow

### 1. Frontend (Dashboard Page)
**File**: `/app/dashboard/youtube-manager/dashboard/page.tsx`

#### User Actions:
1. User clicks "Edit" button on a video card
2. Opens edit dialog with current metadata
3. Can manually edit OR use AI suggestions
4. Clicks "Save Changes" to update

#### State Management:
- `editingVideo`: Currently selected video object
- `editTitle`: Editable title state
- `editDescription`: Editable description state
- `editTags`: Comma-separated tags
- `saving`: Loading state during save operation
- `aiHints`: Structured AI suggestions

#### Key Functions:

**`handleEditVideo(video)`**
- Opens edit dialog
- Populates form with current video metadata
- Resets AI hints

**`handleSaveMetadata()`**
```typescript
- Validates title is not empty
- Sets saving state to true
- Shows loading toast
- Sends POST request to /api/google with:
  - action: 'updateVideo'
  - accessToken: from localStorage
  - videoId: video identifier
  - title: updated title
  - description: updated description  
  - tags: array of trimmed tags
- On success:
  - Shows success toast
  - Closes dialog
  - Clears AI hints
  - Refreshes channel data
- On error:
  - Shows error toast
  - Keeps dialog open
- Finally:
  - Sets saving state to false
```

**`handleGenerateHints()`**
- Generates structured AI suggestions
- Returns JSON with:
  - titles: Array of 3 title variations
  - descriptions: Array of 2 description options
  - tags: Array of 2 tag sets
  - general: Overall optimization tips

---

### 2. Backend API (Google Route)
**File**: `/app/api/google/route.ts`

#### Action: `updateVideo`

**Input Validation:**
- Checks videoId is provided
- Validates title is not empty

**Process:**
1. **Fetch Current Video**:
   ```typescript
   const currentVideo = await youtube.videos.list({
     part: ["snippet"],
     id: [data.videoId],
   });
   ```
   - Retrieves existing video data
   - Ensures categoryId and other required fields are preserved

2. **Update Video**:
   ```typescript
   const response = await youtube.videos.update({
     part: ["snippet"],
     requestBody: {
       id: data.videoId,
       snippet: {
         ...currentSnippet,      // Preserve existing data
         title: data.title,      // Update with new title
         description: data.description || "",
         tags: data.tags && data.tags.length > 0 ? data.tags : [],
         categoryId: currentSnippet.categoryId, // Required
       },
     },
   });
   ```

3. **Response**:
   - Success: `{ success: true, data: response.data }`
   - Error: `{ success: false, error: errorMessage }`

**Error Handling:**
- 400: Missing videoId or title
- 404: Video not found
- 500: YouTube API error (with detailed message)

---

### 3. YouTube Data API v3
**API**: `youtube.videos.update`

#### Requirements:
- **Part**: ["snippet"]
- **Required Fields**:
  - id: Video ID
  - snippet.title
  - snippet.categoryId (must be from existing video)

#### Authorization:
- OAuth 2.0 scope: `https://www.googleapis.com/auth/youtube`
- Access token from localStorage

---

## AI Suggestions Feature

### Structured Output Format
```json
{
  "titles": [
    "SEO-optimized title 1",
    "Engaging title 2",  
    "Keyword-rich title 3"
  ],
  "descriptions": [
    "Well-structured description with keywords and CTA",
    "Alternative description option"
  ],
  "tags": [
    "tag1, tag2, tag3, hashtag1, hashtag2",
    "alternative1, alternative2, alternative3"
  ],
  "general": "Overall optimization tips and best practices"
}
```

### UI Display
- **Title Suggestions** (Purple theme): Plus button → applies to title field
- **Description Suggestions** (Cyan theme): Plus button → applies to description
- **Tags Suggestions** (Pink theme): Plus button → applies to tags
- **General Tips** (Green theme): Display only

---

## User Experience Flow

### Complete Workflow:
1. **Open Editor**: Click edit button on video card
2. **Review Current Data**: See existing title, description, tags
3. **Get AI Help** (Optional):
   - Click "Get AI Improvement Hints"
   - Review 3 title options, 2 descriptions, 2 tag sets
   - Click Plus button to apply any suggestion
4. **Manual Edits**: Make further refinements
5. **Save Changes**:
   - Button shows "Saving..." with spinner
   - Both buttons disabled during save
   - Toast notifications for feedback
6. **Success**: Dialog closes, video list refreshes

### Loading States:
- **Generating AI**: Button shows spinner, "Generating AI Suggestions..."
- **Saving**: Button shows spinner, "Saving..."
- **Disabled States**: Can't close or save during operation

---

## Error Scenarios

### Frontend Errors:
- Empty title: "Title is required"
- AI generation fails: "Failed to generate suggestions"
- Save fails: Shows specific error message

### Backend Errors:
- 401: Missing/invalid access token → Redirect to reconnect
- 400: Validation error → Show validation message
- 404: Video not found → "Video not found"
- 500: YouTube API error → Show detailed error message

---

## Security & Validation

### Frontend Validation:
- Title: Required, max 100 characters
- Description: Optional, max 5000 characters
- Tags: Comma-separated, trimmed, empty values filtered

### Backend Validation:
- Access token required
- Video ID required
- Title required and non-empty
- Preserves existing categoryId

### Access Control:
- YouTube OAuth 2.0
- User can only edit their own videos
- Token stored in localStorage

---

## Performance Optimizations

1. **Optimistic UI**: Immediate feedback on button clicks
2. **State Management**: Minimal re-renders
3. **API Efficiency**: 
   - Single update call
   - Preserves existing data to avoid data loss
4. **Error Recovery**: Keeps dialog open on errors

---

## Testing Checklist

- [ ] Edit button opens dialog with correct data
- [ ] Title validation works (empty title blocked)
- [ ] AI suggestions generate correctly
- [ ] Plus buttons apply suggestions
- [ ] Manual edits work
- [ ] Save button shows loading state
- [ ] Success closes dialog and refreshes
- [ ] Error keeps dialog open with message
- [ ] Cancel button works
- [ ] Dialog can't close during save

---

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
OPENAI_API_KEY=your_openai_api_key  # For AI suggestions
```

---

## API Endpoints Used

### Google API:
- POST `/api/google` with action `updateVideo`
- POST `/api/google` with action `getChannelData`

### AI API:
- POST `/api/gemini` with prompt for suggestions

---

## Future Enhancements

1. Batch update multiple videos
2. Schedule metadata updates
3. A/B testing for titles
4. SEO score calculation
5. Thumbnail upload
6. Privacy status updates
7. Category change option
