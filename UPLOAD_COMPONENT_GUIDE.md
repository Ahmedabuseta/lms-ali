# 🎨 Arabic File Upload Component Guide

## Overview

The `FileUploadArabic` component is a modern, Arabic-themed file upload solution that integrates with Digital Ocean Spaces. It provides a beautiful UI with drag-and-drop functionality, progress indicators, and comprehensive Arabic language support.

## 🚀 Features

- ✅ **Arabic Language Support** - All text in Arabic with proper RTL styling
- ✅ **Drag & Drop** - Modern file upload experience
- ✅ **File Type Validation** - Customizable accepted file types
- ✅ **File Size Limits** - Configurable size restrictions
- ✅ **Progress Indicators** - Visual upload progress with Arabic text
- ✅ **Preview Support** - Image previews and file info display
- ✅ **Error Handling** - Arabic error messages
- ✅ **Dark Mode Support** - Beautiful dark theme compatibility
- ✅ **Digital Ocean Spaces** - Optimized for DO Spaces storage

## 📦 Installation

The component is already created at `components/file-upload-arabic.tsx` and ready to use.

## 🎯 Usage Examples

### 1. Course Image Upload

```tsx
import { FileUploadArabic } from '@/components/file-upload-arabic';

const [imageUrl, setImageUrl] = useState<string>('');

<FileUploadArabic
  value={imageUrl}
  onChange={(url) => setImageUrl(url || '')}
  folder="course-images"
  acceptedFileTypes="image/*"
  maxFileSize={4 * 1024 * 1024} // 4MB
  description="يُنصح بنسبة عرض إلى ارتفاع 16:9 للحصول على أفضل عرض"
/>
```

### 2. Chapter Video Upload

```tsx
<FileUploadArabic
  value={videoUrl}
  onChange={(url) => setVideoUrl(url || '')}
  folder="chapter-videos"
  acceptedFileTypes="video/*"
  maxFileSize={500 * 1024 * 1024} // 500MB
  description="ارفع فيديو للفصل. قد يستغرق الأمر بضع دقائق للمعالجة"
/>
```

### 3. Course Attachments

```tsx
<FileUploadArabic
  onChange={(url) => {
    if (url) {
      // Handle attachment upload
      handleAttachmentSubmit({ url });
    }
  }}
  folder="course-attachments"
  acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
  maxFileSize={50 * 1024 * 1024} // 50MB
  description="أضف أي ملفات قد يحتاجها الطلاب لإكمال الدورة"
/>
```

### 4. Profile Picture Upload

```tsx
<FileUploadArabic
  value={profileUrl}
  onChange={(url) => setProfileUrl(url || '')}
  folder="profile-pictures"
  acceptedFileTypes="image/*"
  maxFileSize={2 * 1024 * 1024} // 2MB
  description="ارفع صورة شخصية واضحة بحجم مربع"
  className="max-w-xs mx-auto"
/>
```

### 5. Quiz Attachments

```tsx
<FileUploadArabic
  value={quizAttachmentUrl}
  onChange={(url) => setQuizAttachmentUrl(url || '')}
  folder="quiz-attachments"
  acceptedFileTypes="image/*,.pdf"
  maxFileSize={10 * 1024 * 1024} // 10MB
  description="ارفع صورة أو ملف PDF للسؤال"
/>
```

## 🔧 Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onChange` | `(url?: string) => void` | **Required** | Callback when file upload completes |
| `value` | `string` | `undefined` | Current file URL for display |
| `folder` | `string` | `'uploads'` | Digital Ocean Spaces folder |
| `acceptedFileTypes` | `string` | `'*/*'` | Accepted file types (MIME or extensions) |
| `maxFileSize` | `number` | `10MB` | Maximum file size in bytes |
| `className` | `string` | `undefined` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the upload component |
| `description` | `string` | `undefined` | Additional description text |
| `showProgress` | `boolean` | `true` | Show upload progress bar |

## 📁 File Type Examples

### Common File Types

```tsx
// Images only
acceptedFileTypes="image/*"

// Videos only
acceptedFileTypes="video/*"

// Documents only
acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"

// Archives
acceptedFileTypes=".zip,.rar,.7z"

// Specific types
acceptedFileTypes="image/jpeg,image/png,.pdf"

// All files
acceptedFileTypes="*/*"
```

## 🎨 Styling & Theming

The component automatically adapts to:
- ✅ **Arabic Language** - All text in Arabic
- ✅ **RTL Support** - Right-to-left layout
- ✅ **Dark Mode** - Beautiful dark theme
- ✅ **Font Arabic Class** - Uses `font-arabic` for proper Arabic fonts

### Custom Styling

```tsx
<FileUploadArabic
  className="border-2 border-blue-500 rounded-xl"
  // ... other props
/>
```

## 🔄 Integration with Forms

### React Hook Form Example

```tsx
import { useForm } from 'react-hook-form';
import { FileUploadArabic } from '@/components/file-upload-arabic';

const MyForm = () => {
  const { register, handleSubmit, setValue, watch } = useForm();
  const imageUrl = watch('imageUrl');

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FileUploadArabic
        value={imageUrl}
        onChange={(url) => setValue('imageUrl', url)}
        folder="form-images"
        acceptedFileTypes="image/*"
        maxFileSize={5 * 1024 * 1024}
      />
      
      <button type="submit">حفظ</button>
    </form>
  );
};
```

## 🚨 Error Handling

The component handles various error scenarios:

- **File size too large**: `حجم الملف يتجاوز الحد المسموح`
- **Invalid file type**: `نوع الملف غير مدعوم`
- **Upload failed**: `فشل في رفع الملف`
- **General error**: `حدث خطأ ما`

## 🔧 Customization

### Custom Error Messages

You can customize error handling by wrapping the component:

```tsx
const CustomFileUpload = (props) => {
  const handleChange = (url) => {
    if (url) {
      toast.success('تم رفع الملف بنجاح! 🎉');
      props.onChange(url);
    }
  };

  return (
    <FileUploadArabic
      {...props}
      onChange={handleChange}
    />
  );
};
```

## 📱 Responsive Design

The component is fully responsive and works on:
- ✅ **Desktop** - Full drag & drop experience
- ✅ **Tablet** - Touch-friendly interface
- ✅ **Mobile** - Optimized touch interactions

## 🔐 Security

- ✅ **Teacher-only uploads** - Only teachers can upload files
- ✅ **File type validation** - Client and server-side validation
- ✅ **Size limits** - Configurable file size limits
- ✅ **Secure storage** - Digital Ocean Spaces with proper ACL

## 🚀 Performance

- ✅ **Optimized uploads** - Direct to Digital Ocean Spaces
- ✅ **Progress tracking** - Real-time upload progress
- ✅ **Error recovery** - Automatic retry on failure
- ✅ **Memory efficient** - Streaming uploads for large files

## 🔄 Migration from Old Component

If you're migrating from `FileUploadSpaces`:

```tsx
// Old component
<FileUploadSpaces
  onChange={(url) => handleChange(url)}
  folder="uploads"
  acceptedFileTypes="image/*"
  maxFileSize={5 * 1024 * 1024}
/>

// New Arabic component
<FileUploadArabic
  onChange={(url) => handleChange(url)}
  folder="uploads"
  acceptedFileTypes="image/*"
  maxFileSize={5 * 1024 * 1024}
  description="ارفع صورة واضحة"
/>
```

## 🆘 Troubleshooting

### Common Issues

1. **Upload fails**: Check Digital Ocean Spaces configuration
2. **Progress not showing**: Ensure `showProgress={true}`
3. **Wrong file types**: Verify `acceptedFileTypes` prop
4. **Size limits**: Check `maxFileSize` setting

### Debug Mode

Add console logging for debugging:

```tsx
<FileUploadArabic
  onChange={(url) => {
    console.log('Upload completed:', url);
    setFileUrl(url);
  }}
  // ... other props
/>
```

## 🎯 Best Practices

1. **Use descriptive folders**: `course-images`, `chapter-videos`, etc.
2. **Set appropriate size limits**: Images (4MB), Videos (500MB), Documents (50MB)
3. **Provide clear descriptions**: Help users understand what to upload
4. **Handle errors gracefully**: Provide feedback for failed uploads
5. **Show upload progress**: Keep users informed during uploads

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify Digital Ocean Spaces configuration
- Ensure proper authentication
- Test with smaller files first

---

*Component created with ❤️ for Arabic LMS platform* 