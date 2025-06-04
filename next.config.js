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

    images: {
      domains: [
        'images.unsplash.com',
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
      ],
    },

    // MDX configuration
    experimental: {
      mdxRs: true,
    },
  });
};

// Export the async config
module.exports = nextConfig();
