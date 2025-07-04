import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';

const outdir = 'dist';

// These packages are handled by the importmap in index.html,
// so we mark them as external to prevent esbuild from trying to bundle them from node_modules.
// This is crucial for avoiding Node.js polyfill issues (e.g., 'crypto', 'stream')
// that arise from server-side dependencies being bundled for the client.
const externalPackages = [
    'react',
    'react-dom',
    'react/*',
    'react-dom/*',
    '@solana/*',
    '@metaplex-foundation/*'
];

async function build() {
  try {
    // Ensure the output directory exists
    await fs.mkdir(outdir, { recursive: true });

    // Run esbuild to bundle the application
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(outdir, 'index.js'),
      format: 'esm',
      minify: true,
      sourcemap: true,
      external: externalPackages, // Mark packages from importmap as external
      // To handle React 17+ JSX transform automatically
      jsx: 'automatic',
      loader: {
        '.ts': 'tsx',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        // Polyfill for Node.js `global` object. Some dependencies like wallet-adapter rely on this.
        'global': 'globalThis',
      },
    });
    console.log('✅ JavaScript bundled successfully.');

    // Copy index.html to the output directory
    await fs.copyFile('index.html', path.join(outdir, 'index.html'));
    console.log('✅ Copied index.html');
    
    // Copy favicon.ico if it exists, otherwise ignore
    try {
        await fs.copyFile('favicon.ico', path.join(outdir, 'favicon.ico'));
        console.log('✅ Copied favicon.ico');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn('⚠️ favicon.ico not found, skipping copy.');
        } else {
            throw error;
        }
    }
    
    console.log(`\nBuild complete! Your app is ready in the ./${outdir} directory.`);

  } catch (e) {
    console.error('❌ Build failed:', e);
    process.exit(1);
  }
}

build();
