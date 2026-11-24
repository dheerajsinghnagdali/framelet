import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@framelet/core', '@framelet/react', '@framelet/solid', '@framelet/angular'],
};

export default withMDX(config);
