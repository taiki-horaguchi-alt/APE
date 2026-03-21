import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ape/shared'],
  experimental: {
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
  },
}

export default config
