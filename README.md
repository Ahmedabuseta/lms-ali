# LMS-Ali - Modern Learning Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-darkblue)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-teal)](https://tailwindcss.com/)

A comprehensive and modern learning management system (LMS) built with Next.js, TypeScript, and Prisma. This platform allows educators to create and manage courses with rich content, while students can learn through interactive materials, take exams, and track their progress.

![LMS-Ali Screenshot](public/logo.svg)

## 🌟 Features

- **Authentication & Authorization** - Secure user management with Clerk
- **Course Management** - Create, update, and organize educational content
- **Interactive Learning** - Rich content editing with MDX and math support
- **Exam System** - Create and take exams with time limits
- **Flashcards** - Study with flashcards for better retention
- **Practice Questions** - Test your knowledge with practice questions
- **Progress Tracking** - Monitor student performance and learning journey
- **AI Tutor** - Get help from an AI-powered tutor (experimental)
- **Video Content** - Integrated video streaming with Mux
- **Image Processing** - OCR capabilities for extracting text from images
- **Mobile Responsive** - Works on all devices and screen sizes
- **Analytics Dashboard** - Visualize learning data with Recharts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Compatible with PostgreSQL, MySQL, SQLite (via Prisma)
- **Authentication**: Clerk
- **Content**: MDX, React-Markdown, KaTeX for math rendering
- **Media**: Mux for video, UploadThing for file uploads
- **Payment Processing**: Stripe
- **Deployment**: Docker-ready with docker-compose

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/lms-ali.git
   cd lms-ali
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your configuration values.

4. Set up the database
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

```bash
docker-compose up -d
```

## 📊 Project Structure

```
lms-ali/
├── actions/          # Server actions for data fetching
├── app/              # App router components and routes
│   ├── (auth)/       # Authentication routes
│   ├── (course)/     # Course content pages
│   ├── (dashboard)/  # User dashboard
│   └── api/          # API routes
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── prisma/           # Database schema and migrations
└── public/           # Static assets
```

## 🔧 Configuration

The application can be configured through environment variables:

- **Database**: Connection strings for your database
- **Authentication**: Clerk API keys
- **Storage**: UploadThing API keys
- **Video**: Mux API keys
- **Payment**: Stripe API keys

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

If you have any questions, feel free to reach out or open an issue.

---

Built with ❤️ using Next.js and TypeScript
