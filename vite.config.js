/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import commonViteConfig from './build/commonViteConfig.js';
import getPluginProxies from './build/getPluginProxies.js';
import { determineHostFromArgv } from './build/determineHost.js';

const configMain = defineConfig(async ({ mode }) => {
  const production = mode === 'production';
  const https = false;
  const port = production ? 4173 : 8080;
  let proxy = {};
  if (!production) {
    const host = determineHostFromArgv(port, https);
    proxy = await getPluginProxies(host, production);
  }


  return {
    ...commonViteConfig,
    server: {
      https,
      strictPort: true,
      port,
      proxy,
    },
  };
});

export default configMain;
