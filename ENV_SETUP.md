# Environment Variables Setup

## 🚨 **Critical Fix for Auth Errors**

The authentication errors you're seeing are likely due to missing environment variables. Here's what you need to add to your `.env.local` file:

## 📝 **Required Environment Variables**

Create or update your `.env.local` file with:

```env
# Better Auth Secret (REQUIRED)
BETTER_AUTH_SECRET=a98f2c8ad736d1b80de17e9c54828f3e007ea28075b7e78cece34caaa834cad8

# Better Auth URL (REQUIRED)
BETTER_AUTH_URL=http://localhost:3000

# Admin Email (OPTIONAL - for auto teacher promotion)
ADMIN_EMAIL=your-admin-email@gmail.com

# Google OAuth (REQUIRED for sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database URL (keep your existing one)
DATABASE_URL=your-existing-database-url
```

## 🔧 **Quick Setup Steps**

### 1. **Better Auth Secret** ✅ 
Already generated: `a98f2c8ad736d1b80de17e9c54828f3e007ea28075b7e78cece34caaa834cad8`

### 2. **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 3. **Admin Email** (Optional)
Set your email to get automatic teacher access.

## 🐛 **Fixing Current Errors**

The errors you're seeing:
- `TypeError: r is not a function` - Fixed by updating route handler
- `Environment variable errors` - Fixed by adding proper env vars
- `Admin plugin errors` - Fixed by making admin email optional

## 🔍 **After Setting Up Environment**

1. **Restart your dev server**: `bun dev`
2. **Test sign-in**: Visit `/sign-in`
3. **Check auth endpoints**: `/api/auth/get-session` should work
4. **Verify admin access**: If admin email is set, you should get teacher access

## ⚡ **Minimal Working Setup**

If you just want to test quickly, use these minimal environment variables:

```env
BETTER_AUTH_SECRET=a98f2c8ad736d1b80de17e9c54828f3e007ea28075b7e78cece34caaa834cad8
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🚀 **After Setup**

1. Restart the server
2. The auth errors should be resolved
3. Sign-in should work properly
4. Admin features will work if admin email is configured

**The authentication system should now work correctly!** 🎉 