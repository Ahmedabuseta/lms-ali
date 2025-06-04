# Video Setup Guide

## Required Files

You need to add the following video files to your `public` directory:

### 1. HLS Video File
- **File**: `public/promo.m3u8` (HLS playlist file)
- **Description**: The main promo video in HLS format for adaptive streaming
- **Benefits**: Better streaming quality, adaptive bitrate, and mobile support

### 2. Video Poster Image
- **File**: `public/promo-poster.jpg`
- **Description**: Thumbnail image shown before video starts
- **Recommended Size**: 1920x1080 or 16:9 aspect ratio

## How to Convert Video to HLS

If you have an MP4 file, you can convert it to HLS format using FFmpeg:

```bash
# Install FFmpeg first
# Then run this command to convert MP4 to HLS
ffmpeg -i promo.mp4 \
  -profile:v baseline \
  -level 3.0 \
  -s 1920x1080 \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -f hls \
  public/promo.m3u8
```

## Alternative: Use MP4 File

If you prefer to use a regular MP4 file instead of HLS:

1. Place your video file as `public/promo.mp4`
2. Update the VideoPlayer src in `app/page.tsx`:
   ```tsx
   <VideoPlayer 
     src="/promo.mp4"  // Change from .m3u8 to .mp4
     poster="/promo-poster.jpg"
     className="w-full"
     title="الفيديو الترويجي للمنصة"
     description="من P2S إلى كلية التجارة .. خطوة بثقة!"
   />
   ```

## Video Recommendations

- **Resolution**: 1920x1080 (Full HD) or higher
- **Format**: MP4 (H.264) or HLS for streaming
- **Duration**: 1-3 minutes for optimal engagement
- **File Size**: Under 50MB for MP4, unlimited for HLS
- **Content**: Showcase the platform's key features and the Arabic slogan

## Arabic Slogan Integration

The landing page now features the slogan "من P2S إلى كلية التجارة .. خطوة بثقة!" prominently:

1. **Hero Section**: Displayed as a badge above the main title
2. **Video Description**: Used as the video description overlay
3. **Styling**: Gradient background with Arabic font support

## Browser Support

The enhanced VideoPlayer component supports:
- ✅ HLS streaming (all modern browsers via hls.js)
- ✅ Safari native HLS support
- ✅ Fallback to regular MP4
- ✅ Mobile-responsive design
- ✅ Custom controls with Arabic support
- ✅ Progress tracking and time display
- ✅ Fullscreen support 