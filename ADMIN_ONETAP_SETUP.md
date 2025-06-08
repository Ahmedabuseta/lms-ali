# Admin Plugin & One-Tap Sign-In Setup

## 🎯 What's Been Implemented

### ✅ Admin Plugin
- **Auto-promotion**: Admin email automatically becomes teacher with full access
- **Role Detection**: Enhanced teacher checking includes admin email
- **Seamless Experience**: No manual database updates needed for admin

### ✅ One-Tap Sign-In
- **Auto-trigger**: Sign-in page can automatically start Google OAuth
- **Enhanced UI**: Modern, animated sign-in button
- **URL Parameter**: `/sign-in?auto=true` triggers immediate sign-in
- **Landing Integration**: All auth flows redirect to one-tap experience

## 🔧 Environment Setup

Add this to your `.env.local`:

```env
# Your admin email (gets automatic teacher access)
ADMIN_EMAIL="your-admin-email@gmail.com"

# Better Auth (generate with: npx @better-auth/cli secret)
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🚀 How It Works

### Admin Flow:
1. Admin visits the website
2. Clicks sign-in → Redirects to `/sign-in?auto=true`
3. Google OAuth automatically triggers
4. On successful sign-in, user is auto-promoted to teacher
5. Gets full access to all features immediately

### Regular User Flow:
1. User visits website
2. Clicks sign-in → One-tap Google OAuth
3. Gets student access by default
4. Admin can manually promote them later

## 🔄 Auto-Promotion Logic

The admin auto-promotion happens in `lib/auth-helpers.ts`:

```typescript
// Auto-promote admin to teacher if needed
if (user && user.email === process.env.ADMIN_EMAIL && user.role !== "TEACHER") {
  user = await db.user.update({
    where: { id: user.id },
    data: {
      role: "TEACHER",
      accessType: "FULL_ACCESS",
      paymentReceived: true,
      accessGrantedAt: new Date(),
    },
  });
}
```

## 🎨 UI Enhancements

### Sign-In Page Features:
- **Gradient Button**: Beautiful blue-to-purple gradient
- **Auto-trigger**: Automatically starts OAuth when `?auto=true`
- **Loading States**: Smooth loading animation
- **Arabic Text**: Localized for your audience
- **Responsive**: Works on all devices

### Navigation Features:
- **Auto-detection**: Shows teacher mode for admin automatically
- **User Dropdown**: Clean profile menu with sign-out
- **Role-based UI**: Different buttons based on user role

## 🧪 Testing the Setup

1. **Set your admin email** in `.env.local`
2. **Start the app**: `bun dev`
3. **Visit homepage**: Click any sign-in button
4. **Auto-redirect**: Should go to `/sign-in?auto=true`
5. **Google OAuth**: Should trigger automatically
6. **Check role**: Admin should see "Teacher mode" in navbar
7. **Verify access**: Admin should have full access to teacher features

## 🔧 Customization Options

### Change Auto-Trigger Behavior:
```typescript
// In sign-in page, modify the useEffect:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const autoSignIn = params.get('auto');
  
  if (autoSignIn === 'true') {
    // Add delay if needed:
    setTimeout(() => handleGoogleSignIn(), 1000);
  }
}, []);
```

### Add More Admin Emails:
```typescript
// In lib/auth.ts, update adminEmails array:
admin({
  defaultRole: "user",
  adminEmails: [
    process.env.ADMIN_EMAIL!,
    "another-admin@gmail.com",
    "third-admin@gmail.com"
  ],
}),
```

### Customize Teacher Detection:
```typescript
// In lib/teacher.ts, modify isTeacher function:
export function isTeacher(userRole?: UserRole | string | null, userEmail?: string | null) {
  const isTeacherRole = userRole === 'TEACHER' || userRole === UserRole.TEACHER;
  const isAdminEmail = userEmail === process.env.ADMIN_EMAIL;
  const isOtherAdmin = userEmail === "another-admin@gmail.com";
  
  return isTeacherRole || isAdminEmail || isOtherAdmin;
}
```

## 🎯 Next Steps

1. **Test the admin flow** with your Google account
2. **Verify teacher features** work correctly
3. **Test regular user flow** with different account
4. **Update remaining API routes** (see MIGRATION_STATUS.md)
5. **Customize styling** if needed

The admin plugin and one-tap sign-in are now fully configured! 🎉 