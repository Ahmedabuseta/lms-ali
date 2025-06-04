# 🎓 LMS Ali - Complete Learning Management System

A modern, full-featured Learning Management System built with Next.js 14, featuring comprehensive course management, interactive learning tools, and AI-powered assistance.

## ✨ Features

### 🎯 Core Functionality
- **Course Management**: Complete CRUD operations for courses and chapters
- **File Uploads**: DigitalOcean Spaces integration for images, videos, and documents
- **Video Streaming**: Mux integration for high-quality video content
- **Progress Tracking**: Detailed student progress monitoring
- **Purchase System**: Stripe integration for course purchases
- **Authentication**: Secure user management with Clerk

### 🤖 AI-Powered Features
- **AI Tutor**: Intelligent chat assistant for student support
- **Image-to-Text**: OCR functionality for extracting text from images
- **Interactive Learning**: Real-time assistance and guidance

### 📚 Learning Tools
- **Rich Text Editor**: Advanced content creation with React Quill
- **Math Support**: LaTeX rendering for mathematical expressions
- **Responsive Design**: Optimized for all devices
- **Dark Mode**: Complete theme support
- **Arabic Support**: Full RTL and Arabic language support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Prisma
- **Authentication**: Clerk
- **Payments**: Stripe
- **Media**: Mux for video, DigitalOcean Spaces for file storage
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- DigitalOcean Spaces account
- Mux account (for video)
- Stripe account (for payments)
- Clerk account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lms-ali.git
   cd lms-ali
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment variables**
   ```env
   # Database
   DATABASE_URL="your_postgresql_connection_string"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # DigitalOcean Spaces
   DO_SPACES_KEY=your_spaces_access_key
   DO_SPACES_SECRET=your_spaces_secret_key
   DO_SPACES_ENDPOINT=your_endpoint_url
   DO_SPACES_BUCKET=your_bucket_name
   DO_SPACES_REGION=nyc3
   
   # Mux (for video processing)
   MUX_TOKEN_ID=
   MUX_TOKEN_SECRET=
   
   # Stripe
   STRIPE_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   STRIPE_WEBHOOK_SECRET=
   
   # Teacher Authorization
   NEXT_PUBLIC_TEACHER_ID=your_teacher_user_id
   ```

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
├── app/                    # Next.js 14 app directory
│   ├── (course)/          # Course pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── landing/          # Landing page components
│   └── ...
├── lib/                   # Utility functions
│   ├── digitalocean-spaces.ts  # File upload utilities
│   ├── db.ts             # Database connection
│   └── ...
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🎨 Features Showcase

### Course Management
- Create and edit courses with rich content
- Chapter-based course structure
- Video upload and streaming
- File attachments and resources
- Progress tracking

### AI Integration
- **AI Tutor**: Intelligent chat assistant
- **Image-to-Text**: OCR for text extraction
- **Interactive Learning**: Real-time guidance

### User Experience
- **Responsive Design**: Works on all devices
- **Dark Mode**: Complete theme support
- **Arabic Support**: Full RTL language support
- **Smooth Animations**: Enhanced user interactions

## 🌍 Internationalization

The platform supports:
- **Arabic (العربية)**: Full RTL support with Arabic fonts
- **English**: Default language
- **Mixed Content**: Seamless Arabic-English content mixing

## 🔧 Configuration

### DigitalOcean Spaces Setup

1. Create a DigitalOcean Spaces bucket
2. Generate API keys
3. Configure CORS settings
4. Update environment variables

See [DIGITALOCEAN_SPACES_SETUP.md](./DIGITALOCEAN_SPACES_SETUP.md) for detailed instructions.

### Video Setup

For HLS video streaming, see [VIDEO_SETUP.md](./VIDEO_SETUP.md) for configuration instructions.

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure environment variables**
4. **Deploy**

### Environment Variables for Production

Make sure to set all required environment variables in your production environment:

- Database connection string
- Clerk authentication keys
- DigitalOcean Spaces credentials
- Mux API keys
- Stripe API keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation files
- Review the setup guides

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Live streaming capabilities
- [ ] Multi-language course content
- [ ] Gamification features
- [ ] Advanced AI tutoring features

---

**Built with ❤️ by LMS Ali Team**
