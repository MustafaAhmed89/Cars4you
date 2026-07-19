// Monorepo-aware Metro config: watch the workspace root and resolve packages
// from both the app and the root node_modules. Required for pnpm + Turborepo.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// The workspace packages use TypeScript's ESM convention of writing relative
// imports with a `.js` extension that actually resolve to `.ts`/`.tsx` source
// (tsconfig moduleResolution: "Bundler"). Metro doesn't do that mapping, so a
// `.js` specifier pointing at a `.ts` file fails to resolve. Retry such a
// failure with the extension stripped; only kicks in when normal resolution
// fails, so real `.js` files in node_modules are unaffected.
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  try {
    return resolve(context, moduleName, platform);
  } catch (error) {
    if (moduleName.startsWith('.') && moduleName.endsWith('.js')) {
      return resolve(context, moduleName.slice(0, -'.js'.length), platform);
    }
    throw error;
  }
};

module.exports = config;
