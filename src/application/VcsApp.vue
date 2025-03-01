<template>
  <v-container class="fill-height pa-0 vcs-app" absolute fluid>
    <VcsSplashScreen
      v-if="splashScreen"
      :options="splashScreen"
      v-model="splashScreenRef"
    ></VcsSplashScreen>
    <VcsNavbar v-if="!config.hideHeader" />
    <VcsContainer :attribution-action="attributionAction" />
    <v-footer
      v-if="showFooter"
      app
      absolute
      :height="footerHeight"
      class="d-flex gc-1 pa-0"
    >
      <VcsPositionDisplay />
      <VcsObliqueFooter />
      <VcsTextPageFooter
        v-if="imprint"
        :text-page="imprint"
        :window-id="'imprintWindow'"
      />
      <VcsTextPageFooter
        v-if="dataProtection"
        :text-page="dataProtection"
        :window-id="'dataProtectionWindow'"
      />
      <v-spacer />
      <VcsAttributionsFooter
        :entries="attributionEntries"
        :attribution-action="attributionAction"
      />
    </v-footer>
  </v-container>
</template>

<style scoped lang="scss">
  :deep(.v-application--wrap) {
    min-height: fit-content;
  }
</style>

<script>
  import { computed, onMounted, onUnmounted, provide, watch, ref } from 'vue';
  import { useDisplay } from 'vuetify';
  import { getVcsAppById, moduleIdSymbol } from '@vcmap/core';
  import { VContainer, VFooter, VSpacer } from 'vuetify/components';
  import { getLogger } from '@vcsuite/logger';
  import VcsContainer from './VcsContainer.vue';
  import { ButtonLocation } from '../manager/navbarManager.js';
  import { vcsAppSymbol } from '../pluginHelper.js';
  import VcsNavbar from './VcsNavbar.vue';
  import {
    createLinkAction,
    createMapButtonAction,
    createToggleAction,
  } from '../actions/actionHelper.js';
  import VcsSettings from './VcsSettings.vue';
  import { WindowSlot } from '../manager/window/windowManager.js';
  import CollectionManager from '../manager/collectionManager/CollectionManager.vue';
  import {
    createVcsThemes,
    setTheme,
    useFontSize,
  } from '../vuePlugins/vuetify.js';
  import VcsLegend from '../legend/VcsLegend.vue';
  import { getLegendEntries } from '../legend/legendHelper.js';
  import VcsAttributionsFooter from './VcsAttributionsFooter.vue';
  import VcsObliqueFooter from './VcsObliqueFooter.vue';
  import VcsTextPageFooter from './VcsTextPageFooter.vue';
  import VcsSplashScreen from './VcsSplashScreen.vue';
  import VcsTextPage from './VcsTextPage.vue';
  import VcsAttributions from './VcsAttributions.vue';
  import { getAttributions } from './attributionsHelper.js';
  import VcsDefaultLogoMobile from '../logo-mobile.svg';
  import VcsPositionDisplay from './VcsPositionDisplay.vue';

  /**
   * This helper checks the uiConfig and depending on the value will setup/teardown the providedSetupFunction
   * @param {import("../vcsUiApp.js").default} app
   * @param {(import("../vcsUiApp.js").default) => () => void} setupFunction
   * @param {string} configOption parameter name of a uiConfig parameter, for example `app.uiConfig.config.hideContentTree`
   * @returns {function():void} - cleanup function
   */
  export function setupUIConfigDependency(app, setupFunction, configOption) {
    let destroyFunction = null;
    function handler() {
      if (!app.uiConfig.config[configOption] && !destroyFunction) {
        destroyFunction = setupFunction(app);
      } else if (app.uiConfig.config[configOption] && destroyFunction) {
        destroyFunction();
        destroyFunction = null;
      }
    }
    handler();
    const listeners = [
      app.uiConfig.added.addEventListener(handler),
      app.uiConfig.added.addEventListener(handler),
    ];

    return () => {
      if (destroyFunction) {
        destroyFunction();
      }
      listeners.forEach((cb) => cb());
    };
  }

  /**
   * You should call this function in the component providing the vcsUiApp to your
   * application in the components mounted hook. This will call VcsAppMounted on all plugins in the app
   * and add a listener to call. Returns a destroy hook to stop listening to the added event. If you use the VcsApp
   * component, do not call this function, since the component will do this for you.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  export function setupPluginMountedListeners(app) {
    /**
     * wrapped execution of onVcsAppMounted hook
     * @param {import("@src/vcsUiApp.js").VcsPlugin} plugin
     */
    function onVcsAppMounted(plugin) {
      if (plugin.onVcsAppMounted) {
        try {
          plugin.onVcsAppMounted(app);
        } catch (e) {
          getLogger('VcsUiApp').error(
            `Error in plugin ${plugin.name} onVcsAppMounted hook`,
            e,
          );
        }
      }
    }

    [...app.plugins].forEach(onVcsAppMounted);

    return app.plugins.added.addEventListener(onVcsAppMounted);
  }

  /**
   * This helper function will add a map action button based on the default icons
   * to the apps NavbarManager. Furthermore, all maps on the app are synced for adding and removing.
   * The buttons can be removed with the uiConfig hideMapButtons
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  export function setupMapNavbar(app) {
    const iconMap = {
      OpenlayersMap: '$vcs2d',
      CesiumMap: '$vcs3d',
      ObliqueMap: '$vcsObliqueView',
    };
    const mapBtnWeight = {
      OpenlayersMap: 3,
      CesiumMap: 2,
      ObliqueMap: 1,
    };

    const mapButtonActionDestroy = {};
    const setupMap = ({ className, name }) => {
      if (mapButtonActionDestroy[name]) {
        mapButtonActionDestroy[name]();
      }
      const { action, destroy } = createMapButtonAction(
        {
          name,
          icon: iconMap[className],
          title: `navbar.maps.${className}`,
        },
        name,
        app.maps,
      );
      app.navbarManager.add(
        {
          id: `mapButton-${name}`,
          action,
          weight: mapBtnWeight[className],
        },
        vcsAppSymbol,
        ButtonLocation.MAP,
      );
      mapButtonActionDestroy[name] = () => {
        app.navbarManager.remove(`mapButton-${name}`);
        destroy();
      };
    };
    [...app.maps].forEach(setupMap);
    const mapAddedListener = app.maps.added.addEventListener(setupMap);

    const mapRemovedListener = app.maps.removed.addEventListener(({ name }) => {
      if (mapButtonActionDestroy[name]) {
        mapButtonActionDestroy[name]();
        delete mapButtonActionDestroy[name];
      }
    });

    return () => {
      mapAddedListener();
      mapRemovedListener();
      Object.values(mapButtonActionDestroy).forEach((cb) => cb());
    };
  }

  /**
   * This helper function will add a legend action button to the apps NavbarManager TOOL location, if legend entries are available.
   * Watches number of legend entries.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  export function setupLegendWindow(app) {
    const { entries, destroy } = getLegendEntries(app);

    const { action: legendAction, destroy: legendDestroy } = createToggleAction(
      {
        name: 'legendToggle',
        icon: '$vcsLegend',
        title: 'legend.tooltip',
      },
      {
        id: 'legend',
        component: VcsLegend,
        state: {
          headerTitle: 'legend.title',
          headerIcon: '$vcsLegend',
          infoUrl: app.getHelpUrlCallback(
            '/components/contentspace.html#id_legend',
          ),
        },
        slot: WindowSlot.DYNAMIC_RIGHT,
        props: { entries },
      },
      app.windowManager,
      vcsAppSymbol,
    );

    /**
     * Adds a legend button, if not existing
     */
    const addLegend = () => {
      if (!app.navbarManager.has('legend')) {
        app.navbarManager.add(
          {
            id: 'legend',
            action: legendAction,
          },
          vcsAppSymbol,
          ButtonLocation.CONTENT,
        );
      }
    };

    let currentEntryLength = entries.length;
    const watchEntries = watch(entries, (newValue) => {
      if (
        app.uiConfig.config.openLegendOnAdd &&
        newValue.length > currentEntryLength &&
        !app.windowManager.has('legend')
      ) {
        app.windowManager.add(
          {
            id: 'legend',
            component: VcsLegend,
            state: {
              headerTitle: 'legend.title',
              headerIcon: '$vcsLegend',
              infoUrl: app.getHelpUrlCallback(
                '/components/contentspace.html#id_legend',
              ),
            },
            slot: WindowSlot.DYNAMIC_RIGHT,
            props: { entries },
          },
          vcsAppSymbol,
        );
      }
      currentEntryLength = newValue.length;
    });

    /**
     * Handles legend button and window.
     * Adds a button, if legend definitions are available or removes legend otherwise.
     */
    const handleLegend = () => {
      const layersWithLegend = [...app.layers].filter(
        (layer) => layer.style?.properties?.legend ?? layer.properties?.legend,
      );
      const stylesWithLegend = [...app.styles].filter(
        (style) => style?.properties?.legend,
      );
      if (layersWithLegend < 1 && stylesWithLegend < 1) {
        app.navbarManager.remove('legend');
        app.windowManager.remove('legend');
      } else {
        addLegend();
      }
    };
    handleLegend();

    const listeners = [
      app.layers.added.addEventListener((layer) => {
        if (layer.style?.properties?.legend ?? layer.properties?.legend) {
          addLegend();
        }
      }),
      app.styles.added.addEventListener((style) => {
        if (style?.properties?.legend) {
          addLegend();
        }
      }),
      app.layers.removed.addEventListener(handleLegend),
      app.styles.removed.addEventListener(handleLegend),
    ];

    return () => {
      watchEntries();
      app.navbarManager.remove('legend');
      app.windowManager.remove('legend');
      destroy();
      legendDestroy();
      listeners.forEach((cb) => cb());
    };
  }

  /**
   * This helper function will add a customScreen action button to the apps NavbarManager MENU location.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  function setupCustomScreen(app) {
    function setupCustomScreenAction() {
      const { customScreen } = app.uiConfig.config;
      const { action: customScreenAction, destroy: customScreenDestroy } =
        createToggleAction(
          {
            name: customScreen.name || 'components.customScreen.name',
            icon: customScreen.icon || 'mdi-information',
            title: customScreen.title,
          },
          {
            id: 'customScreenId',
            component: VcsTextPage,
            state: {
              headerIcon: customScreen.icon,
              headerTitle: customScreen.name,
            },
            slot: WindowSlot.DETACHED,
            position: customScreen.windowPosition,
            props: {
              content: customScreen.content,
            },
          },
          app.windowManager,
          vcsAppSymbol,
        );
      app.navbarManager.add(
        {
          id: 'customScreenToggle',
          action: customScreenAction,
        },
        vcsAppSymbol,
        ButtonLocation.MENU,
      );
      return () => {
        customScreenDestroy();
      };
    }
    let customScreen;
    const stopCustomScreenWatcher = watch(
      () => app.uiConfig.config.customScreen,
      (newCustomScreen) => {
        if (app.navbarManager.has('customScreenToggle')) {
          app.navbarManager.remove('customScreenToggle');
        }
        if (newCustomScreen) {
          customScreen = setupCustomScreenAction();
        }
      },
      { immediate: true },
    );
    return () => {
      if (customScreen) {
        customScreen();
      }
      stopCustomScreenWatcher();
    };
  }
  /**
   * This helper function will add a Splash Screen action button to the apps NavbarManager MENU location.
   * @param {import("../vcsUiApp.js").default} app
   * @param {import("vue").Ref} splashScreenRef
   * @returns {WatchStopHandle}
   */
  function setupSplashScreen(app, splashScreenRef) {
    function setupSplashScreenAction(moduleId) {
      const { splashScreen } = app.uiConfig.config;
      if (splashScreen && moduleId !== app.dynamicModuleId) {
        splashScreenRef.value = true;
      }
      if (splashScreen && splashScreen.menuEntry) {
        const splashScreenAction = {
          name: splashScreen.name || 'components.splashScreen.name',
          icon: splashScreen.icon || 'mdi-alert-box',
          title: splashScreen.title,
          callback() {
            splashScreenRef.value = !splashScreenRef.value;
          },
        };
        app.navbarManager.add(
          {
            id: 'splashScreenToggle',
            action: splashScreenAction,
          },
          vcsAppSymbol,
          ButtonLocation.MENU,
        );
      }
    }
    setupSplashScreenAction();
    const removeAddedListener = app.uiConfig.added.addEventListener((item) => {
      if (item.name === 'splashScreen') {
        if (app.navbarManager.has('splashScreenToggle')) {
          app.navbarManager.remove('splashScreenToggle');
        }
        setupSplashScreenAction(item[moduleIdSymbol]);
      }
    });
    const removeRemovedListener = app.uiConfig.removed.addEventListener(
      (item) => {
        if (item.name === 'splashScreen') {
          if (app.navbarManager.has('splashScreenToggle')) {
            app.navbarManager.remove('splashScreenToggle');
          }
        }
      },
    );
    return () => {
      removeAddedListener();
      removeRemovedListener();
    };
  }
  /**
   * This helper function will add a settings action button to the apps NavbarManager MENU location.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  export function setupSettingsWindow(app) {
    const settingsWindowId = 'vcsSettings';
    const { action: settingsAction, destroy: settingsDestroy } =
      createToggleAction(
        {
          name: 'settings.title',
          icon: 'mdi-cog',
          title: 'settings.tooltip',
        },
        {
          id: settingsWindowId,
          component: VcsSettings,
          state: { headerIcon: 'mdi-cog', headerTitle: 'settings.title' },
          slot: WindowSlot.DYNAMIC_RIGHT,
        },
        app.windowManager,
        vcsAppSymbol,
      );
    app.navbarManager.add(
      {
        id: settingsWindowId,
        action: settingsAction,
      },
      vcsAppSymbol,
      ButtonLocation.MENU,
    );
    return () => {
      app.navbarManager.remove(settingsWindowId);
      app.windowManager.remove(settingsWindowId);
      settingsDestroy();
    };
  }

  /**
   * This helper function will add a help action button referencing VC Map help page to the apps NavbarManager MENU location.
   * @param {import("../vcsUiApp.js").default} app
   */
  export function setupHelpButton(app) {
    const helpAction = createLinkAction(
      {
        name: 'help.title',
        title: 'help.tooltip',
        icon: '$vcsHelp',
      },
      app.getHelpUrlCallback(),
    );
    app.navbarManager.add(
      {
        id: 'helpButton',
        action: helpAction,
      },
      vcsAppSymbol,
      ButtonLocation.MENU,
    );
  }

  /**
   * @type {string}
   */
  export const categoryManagerWindowId = 'category-manager';

  /**
   * This helper function will add a category manager button to the navbar. The category Manager
   * will only be shown if there is at least one category under management in the categoryManager.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void}
   */
  export function setupCategoryManagerWindow(app) {
    const { action: categoryManagerAction, destroy } = createToggleAction(
      {
        name: categoryManagerWindowId,
        icon: '$vcsComponents',
        title: 'categoryManager.tooltip',
      },
      {
        id: categoryManagerWindowId,
        state: {
          headerTitle: 'categoryManager.title',
          headerIcon: '$vcsComponents',
          infoUrl: app.getHelpUrlCallback(
            '/components/contentspace.html#id_myWorkspace',
          ),
        },
        component: CollectionManager,
        provides: {
          collectionManager: app.categoryManager,
        },
        slot: WindowSlot.DYNAMIC_LEFT,
      },
      app.windowManager,
      vcsAppSymbol,
    );

    const collectionListeners = new Map();

    /**
     * Makes sure that the category-manager button is in the navbar.
     * Adds listener to the collectionComponents collection to display hasUpdate if new item is added to collection AND category-manager window is closed.
     * @param {import("../manager/collectionManager/collectionComponentClass.js").default} collectionComponent
     */
    function handleAdded(collectionComponent) {
      if (!app.navbarManager.has(categoryManagerWindowId)) {
        app.navbarManager.add(
          { id: categoryManagerWindowId, action: categoryManagerAction },
          vcsAppSymbol,
          ButtonLocation.CONTENT,
        );
      }
      collectionListeners.set(
        collectionComponent.id,
        collectionComponent.collection.added.addEventListener((item) => {
          if (
            !app.windowManager.has(categoryManagerWindowId) &&
            item[moduleIdSymbol] === app.dynamicModuleId
          ) {
            categoryManagerAction.hasUpdate = true;
          }
        }),
      );
    }

    /**
     * Removes listener on collection of collectionComponent.
     * Removes collection-manager button in navbar, if categoryManager has no more collectionComponents.
     * @param {import("../manager/collectionManager/collectionComponentClass.js").default} collectionComponent
     */
    function handleRemoved(collectionComponent) {
      collectionListeners.get(collectionComponent.id)?.();
      collectionListeners.delete(collectionComponent.id);

      if (!app.categoryManager.componentIds.length) {
        app.windowManager.remove(categoryManagerWindowId);
        app.navbarManager.remove(categoryManagerWindowId);
        categoryManagerAction.hasUpdate = false;
      }
    }

    const addedListener =
      app.categoryManager.added.addEventListener(handleAdded);
    const removedListener =
      app.categoryManager.removed.addEventListener(handleRemoved);

    // setup existing collectionComponents
    app.categoryManager.componentIds.forEach((componentId) =>
      handleAdded(app.categoryManager.get(componentId)),
    );

    const windowListener = app.windowManager.added.addEventListener(
      (windowComponent) => {
        if (windowComponent.id === categoryManagerWindowId) {
          categoryManagerAction.hasUpdate = false;
        }
      },
    );

    return () => {
      app.windowManager.remove(categoryManagerWindowId);
      app.navbarManager.remove(categoryManagerWindowId);
      destroy();
      addedListener();
      removedListener();
      collectionListeners.forEach((value) => value());
      windowListener();
    };
  }

  /**
   * This helper sets up a listener to sync the theming relevant keys from the {@see UiConfigObject}
   * with a given vuetify instance. Use this helper, if you do not use the VcsApp component and wish to evaluate
   * the theming keys. Returns a function to stop syncing.
   * Also adds a watcher to vuetify theme, which triggers themeChanged event on the VcsUiApp.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void} - call to stop syncing
   */
  export function setupUiConfigTheming(app) {
    function updateTheme(item) {
      if (item.name === 'primaryColor' || item.name === 'vuetifyTheme') {
        const mergedThemes = createVcsThemes(
          app.uiConfig.getByKey('vuetifyTheme')?.value,
          app.uiConfig.getByKey('primaryColor')?.value,
        );
        setTheme(app.vuetify, mergedThemes);
        app.themeChanged.raiseEvent();
      }
    }
    const listeners = [
      app.uiConfig.added.addEventListener(updateTheme),
      app.uiConfig.removed.addEventListener(updateTheme),
    ];
    const stopWatching = watch(
      () => app.vuetify.theme.current.value.dark,
      () => app.themeChanged.raiseEvent(),
    );

    return () => {
      listeners.forEach((cb) => {
        cb();
      });
      listeners.splice(0);
      stopWatching();
    };
  }

  /**
   * This helper sets up a listener to sync the display quality settings from the {@see UiConfigObject}
   * @param {import("../vcsUiApp.js").default} app
   * @returns {function():void} - call to stop syncing
   */
  export function setupUiConfigDisplayQuality(app) {
    const listeners = [
      app.uiConfig.added.addEventListener((item) => {
        if (item.name === 'displayQuality') {
          app.displayQuality.updateOptions(item.value);
        }
      }),
      app.uiConfig.removed.addEventListener((item) => {
        if (item.name === 'displayQuality') {
          app.displayQuality.updateOptions({});
        }
      }),
    ];

    return () => {
      listeners.forEach((cb) => {
        cb();
      });
      listeners.splice(0);
    };
  }

  /**
   * This helper gets attributions of all active maps, layers and oblique collections and returns an array of entries.
   * It also returns a attributionAction to toggle the attributions window and a destroy function.
   * @param {import("../vcsUiApp.js").default} app
   * @returns {{ attributionEntries: import("vue").Ref<Array<import("./attributionsHelper.js").AttributionEntry>>, attributionAction: import("../actions/actionHelper.js").VcsAction, destroyAttributions: function():void }}
   */
  export function setupAttributions(app) {
    const { entries, destroy } = getAttributions(app);

    const { action: attributionAction, destroy: attributionDestroy } =
      createToggleAction(
        {
          name: 'attributionToggle',
          icon: 'mdi-chevron-double-right',
          title: 'footer.attributions.tooltip',
        },
        {
          id: 'attribution',
          component: VcsAttributions,
          state: {
            headerTitle: 'footer.attributions.title',
            headerIcon: 'mdi-copyright',
          },
          slot: WindowSlot.DYNAMIC_RIGHT,
          props: { entries },
        },
        app.windowManager,
        vcsAppSymbol,
      );

    return {
      attributionEntries: entries,
      attributionAction,
      destroyAttributions: () => {
        destroy();
        attributionDestroy();
      },
    };
  }

  /**
   * @description The base component to setup the entire application. To embed the VcsApp, use this component.
   * @vue-prop {string} appId - the id of the app to inject. this will setup listeners on the app to call vcsAppMounted on plugins
   * @vue-provide
   */
  export default {
    components: {
      VcsContainer,
      VcsPositionDisplay,
      VcsAttributionsFooter,
      VcsTextPageFooter,
      VcsObliqueFooter,
      VcsSplashScreen,
      VcsNavbar,
      VContainer,
      VFooter,
      VSpacer,
    },
    props: {
      appId: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      /** @type {import("../vcsUiApp.js").default} */
      const app = getVcsAppById(props.appId);
      provide('vcsApp', app);
      const mapNavbarListener = setupUIConfigDependency(
        app,
        setupMapNavbar,
        'hideMapButtons',
      );
      const legendDestroy = setupUIConfigDependency(
        app,
        setupLegendWindow,
        'hideLegend',
      );
      const settingsDestroy = setupUIConfigDependency(
        app,
        setupSettingsWindow,
        'hideSettings',
      );
      const stopCustomScreen = setupCustomScreen(app);
      const splashScreenRef = ref(false);
      const stopSplashScreen = setupSplashScreen(app, splashScreenRef);
      setupHelpButton(app);
      const destroyMyWorkspace = setupUIConfigDependency(
        app,
        setupCategoryManagerWindow,
        'hideMyWorkspace',
      );
      const destroyThemingListener = setupUiConfigTheming(app);
      const destroyDisplayQualityListener = setupUiConfigDisplayQuality(app);
      const { attributionEntries, attributionAction, destroyAttributions } =
        setupAttributions(app);

      let pluginMountedListener;
      onMounted(() => {
        pluginMountedListener = setupPluginMountedListeners(app);
      });

      onUnmounted(() => {
        if (pluginMountedListener) {
          pluginMountedListener();
        }
        mapNavbarListener();
        legendDestroy();
        settingsDestroy();
        stopCustomScreen();
        stopSplashScreen();
        destroyMyWorkspace();
        destroyThemingListener();
        destroyDisplayQualityListener();
        destroyAttributions();
      });

      const { smAndUp } = useDisplay();
      const fontSize = useFontSize();
      const footerHeight = computed(() => {
        return Math.ceil(fontSize.value * 1.65);
      });

      return {
        config: app.uiConfig.config,
        showFooter: computed(() => {
          return !app.uiConfig.config.hideFooter && smAndUp.value;
        }),
        footerHeight,
        mobileLogo: computed(
          () =>
            app.uiConfig.config.mobileLogo ??
            app.uiConfig.config.logo ??
            VcsDefaultLogoMobile,
        ),
        imprint: computed(() => {
          if (app.uiConfig.config.imprint) {
            return {
              title: 'footer.imprint.title',
              tooltip: 'footer.imprint.tooltip',
              ...app.uiConfig.config.imprint,
            };
          }
          return undefined;
        }),
        dataProtection: computed(() => {
          if (app.uiConfig.config.dataProtection) {
            return {
              title: 'footer.dataProtection.title',
              tooltip: 'footer.dataProtection.tooltip',
              ...app.uiConfig.config.dataProtection,
            };
          }
          return undefined;
        }),
        splashScreenRef,
        splashScreen: computed(() => {
          if (app.uiConfig.config.splashScreen) {
            return {
              title: 'components.splashScreen.name',
              tooltip: 'components.splashScreen.tooltip',
              position: {
                width: '800px',
                height: '400px',
              },
              ...app.uiConfig.config.splashScreen,
            };
          }
          return undefined;
        }),
        attributionEntries,
        attributionAction,
      };
    },
  };
</script>
