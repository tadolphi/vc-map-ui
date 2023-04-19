import Vue from 'vue';
import { check, checkMaybe, is } from '@vcsuite/check';
import { VcsModule } from '@vcmap/core';
import VcsAppComponentWrapper from './application/vcsAppWrapper.vue';
import { vuetify } from './vuePlugins/vuetify.js';
import { createVueI18n, setupI18n } from './vuePlugins/i18n.js';
import VcsUiApp from './vcsUiApp.js';

/**
 * Base pattern to check VcsObjects
 * @type {import("vcsuite/check").PatternFor<import("@vcmap/core").VcsObject>}
 */
const VcsObjectPattern = {
  type: String,
  name: String,
};

/**
 * Base pattern to check VcsUiAppConfig
 * @type {import("vcsuite/check").PatternFor<VcsUiAppConfig>}
 */
export const VcsUiAppConfigPattern = {
  id: [undefined, String],
  layers: [undefined, [VcsObjectPattern]],
  maps: [undefined, [VcsObjectPattern]],
  styles: [undefined, [VcsObjectPattern]],
  viewpoints: [undefined, [VcsObjectPattern]],
  startingViewpointName: [undefined, String],
  startingMapName: [undefined, String],
  projection: [undefined, Object],
  categories: [undefined, [{ name: String, items: [Object] }]],
  obliqueCollections: [undefined, [VcsObjectPattern]],
  plugins: [undefined, [Object]],
  contentTree: [undefined, [Object]],
  uiConfig: [undefined, [Object]],
  featureInfo: [undefined, [VcsObjectPattern]],
  i18n: [undefined, [Object]],
};

/**
 * creates and mounts a vcsApp
 * @param {string} mountTarget
 * @returns {Promise<VcsUiApp>}
 */
export default async function initApp(mountTarget) {
  check(mountTarget, String);
  const app = new VcsUiApp();
  const i18n = createVueI18n();
  new Vue({
    vuetify,
    i18n,
    render: (h) =>
      h(VcsAppComponentWrapper, {
        props: {
          appId: app.id,
        },
      }),
  }).$mount(mountTarget);

  setupI18n(app, i18n);
  return app;
}

/**
 * Initializes app with an optional single config
 * @param {string} mountTarget
 * @param {string=} configUrl optional config
 * @returns {Promise<VcsUiApp>}
 */
export async function initAppFromModule(mountTarget, configUrl) {
  check(mountTarget, String);
  checkMaybe(configUrl, String);

  const app = await initApp(mountTarget);
  if (configUrl) {
    const config = await fetch(configUrl).then((response) => response.json());
    const module = new VcsModule(config);
    await app.addModule(module);
  }

  return app;
}

/**
 * Initializes app with a map config containing a set of config urls
 * @param {string} mountTarget
 * @param {string} appUrl app config containing further modules to be loaded
 * @returns {Promise<VcsUiApp>}
 */
export async function initAppFromAppConfig(mountTarget, appUrl) {
  check(mountTarget, String);
  check(appUrl, String);

  const app = await initApp(mountTarget);
  /**
   * @type {{modules: Array<string|VcsUiAppConfig>}}
   */
  const appConfig = await fetch(appUrl).then((response) => response.json());

  check(appConfig.modules, [String, Object]);

  const modules = await Promise.all(
    appConfig.modules.map(async (c) => {
      if (is(c, VcsUiAppConfigPattern)) {
        return new VcsModule(
          /** @type{import("@vcmap/core").VcsAppConfig} */ c,
        );
      } else if (is(c, String)) {
        const response = await fetch(c);
        if (response.ok) {
          const config = await response.json();
          return new VcsModule(config);
        }
      }
      return null;
    }),
  );
  // eslint-disable-next-line no-restricted-syntax
  for await (const module of modules) {
    if (module) {
      await app.addModule(module);
    }
  }
}
