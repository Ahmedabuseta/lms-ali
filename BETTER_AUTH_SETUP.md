# Better Auth Migration Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Admin Configuration
ADMIN_EMAIL="your-admin-email@gmail.com"

# Database (keep your existing DATABASE_URL)
DATABASE_URL="your-existing-database-url"
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-domain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your environment variables

## Database Migration

Run the following commands to update your database schema:

```bash
# Generate Prisma client with new schema
bun prisma generate

# Create and apply migration
bun prisma migrate dev --name "migrate-to-better-auth"

# Or if you want to reset the database (WARNING: This will delete all data)
bun prisma migrate reset
```

## Install Dependencies

```bash
bun install
```

## Data Migration (Optional)

If you have existing Clerk users, you may need to migrate them manually. The new User model structure is:

- `id`: Primary key (auto-generated)
- `email`: User email from Google
- `name`: User name from Google
- `image`: User profile image from Google
- `role`: STUDENT or TEACHER (defaults to STUDENT)
- Other custom fields for access control

## Key Changes Made

1. **Replaced Clerk with Better Auth**
   - Removed `@clerk/nextjs` dependency
   - Added `better-auth` with admin plugin

2. **Updated Database Schema**
   - Modified User model to work with Better Auth
   - Added Account and Session models for OAuth
   - Removed `userId` field (Clerk-specific)

3. **Updated Authentication Logic**
   - Created `lib/auth.ts` with admin plugin configuration
   - Created `lib/auth-client.ts` for client-side auth
   - Created `lib/auth-helpers.ts` with auto admin promotion
   - Updated middleware for Better Auth

4. **Admin & One-Tap Features**
   - **Admin Plugin**: Automatically grants admin privileges to specified email
   - **Auto Teacher Promotion**: Admin email automatically becomes teacher with full access
   - **One-Tap Sign-in**: Auto-triggers Google OAuth for seamless experience
   - **Enhanced UI**: Modern sign-in page with improved styling

5. **Updated Components**
   - Enhanced navbar with admin/teacher detection
   - One-tap sign-in page with auto-trigger functionality
   - Modified landing page for seamless auth flow

6. **Updated Server Components**
   - Replaced `auth()` from Clerk with `getCurrentUser()` helper
   - Enhanced teacher role checking with admin detection

## Admin & Teacher Setup

### Admin User (Automatic)
The admin user is automatically granted teacher privileges when they sign in:

1. Set `ADMIN_EMAIL` in your environment variables
2. When the admin signs in with Google, they automatically become a teacher with full access
3. No manual database updates needed!

### Manual Teacher Promotion
To manually make other users teachers:

```sql
UPDATE "User" SET role = 'TEACHER', "accessType" = 'FULL_ACCESS', "paymentReceived" = true WHERE email = 'teacher@example.com';
```

### One-Tap Experience
- Visit `/sign-in?auto=true` for automatic Google OAuth trigger
- Landing page buttons automatically redirect to one-tap sign-in
- Seamless authentication experience

## Testing

1. Start the development server: `bun dev`
2. Navigate to `http://localhost:3000`
3. Click "تسجيل الدخول" to test Google OAuth
4. Verify that authentication works and user data is stored correctly

## Production Deployment

1. Update `BETTER_AUTH_URL` to your production domain
2. Add production redirect URI to Google OAuth settings
3. Deploy your application
4. Test authentication flow in production

## Troubleshooting

- **"Invalid redirect URI"**: Make sure the redirect URI in Google Console matches exactly
- **"Invalid client ID"**: Double-check your Google OAuth credentials
- **Database errors**: Ensure migrations have been applied
- **Session issues**: Clear browser cookies and local storage