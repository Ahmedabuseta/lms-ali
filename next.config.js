/** @type {import('next').NextConfig} */

// We need to use an async function because remark-math is an ES Module
const nextConfig = async () => {
  // Dynamically import ES Modules
  const [remarkMath, rehypeKatex, rehypeRaw] = await Promise.all([
    import('remark-math').then((mod) => mod.default || mod),
    import('rehype-katex').then((mod) => mod.default || mod),
    import('rehype-raw').then((mod) => mod.default || mod),
  ]);

  // Configure withMDX with the imported plugins
  const withMDX = require('@next/mdx')({
    options: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeRaw],
    },
  });

  return withMDX({
    // Configure pageExtensions to include md and mdx
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],

    // Configure webpack
    webpack: (config) => {
      config.resolve.alias.canvas = false;
      config.resolve.alias.encoding = false;
      return config; // Return the modified config
    },

    // CORS and Security Headers Configuration
    async headers() {
      return [
        {
          // Apply CORS headers to all API routes
          source: '/api/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*', // Allow all origins (or specify your domain)
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, HEAD, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control',
            },
            {
              key: 'Access-Control-Max-Age',
              value: '86400', // 24 hours
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
        {
          // Special headers for video proxy API
          source: '/api/video-proxy',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, HEAD, OPTIONS',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: '*',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400', // Cache for 24 hours
            },
          ],
        },
        {
          // CORS headers for static video files (if serving locally)
          source: '/intro-video/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, HEAD',
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Range, Content-Range, Content-Length, Content-Type',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable', // Cache for 1 year
            },
          ],
        },
      ];
    },

    // Configure rewrites for better video handling
    async rewrites() {
      return [
        {
          source: '/video-proxy/:path*',
          destination: '/api/video-proxy?url=:path*',
        },
      ];
    },

    images: {
      domains: [
        'images.unsplash.com',
        'fra1.digitaloceanspaces.com', // Add DigitalOcean Spaces domain
        'lh3.googleusercontent.com', // Google user profile images
        // Add your DigitalOcean Spaces domain here
        // Example: 'your-space-name.your-region.digitaloceanspaces.com'
      ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.digitaloceanspaces.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'fra1.digitaloceanspaces.com',
          port: '',
          pathname: '/lms-ali-p2s/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
      ],
    },

    // MDX configuration
    experimental: {
      mdxRs: true,
    },
  });
};

// Export the async config
module.exports = nextConfig;
