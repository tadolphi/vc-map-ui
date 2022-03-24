import { ref, reactive, watch } from '@vue/composition-api';
import { getLogger as getLoggerByName } from '@vcsuite/logger';


import { ButtonLocation, createToggleAction, WindowSlot } from '@vcmap/ui';
import packageJSON from './package.json';
import defaultConfig from './config.json';
import { conditionalTest, isValidEmail, isValidText } from './validation.js';
import pluginExampleComponent from './pluginExampleComponent.vue';

/**
 * @returns {Logger}
 */
function getLogger() {
  return getLoggerByName('@vcmap/pluginExample');
}

/**
 * @typedef PluginExampleConfig
 * @property {string} nonReactiveProp
 * @property {string[]} selectOptions
 * @property {string} initialTextInput
 */

/**
 * @typedef PluginExampleState
 * @property {string} selected
 * @property {string} conditionalInput
 * @property {string} initialTextInput
 * @property {number} numberInput
 * @property {boolean} checkboxInput
 * @property {string} email
 */

/**
 * @returns {PluginExampleConfig}
 */
export function getDefaultConfig() {
  return defaultConfig;
}

/**
 *
 * @param {PluginExampleConfig} config
 * @returns {VcsPlugin}
 */
export default function (config) {
  /**
   * @type {PluginExampleConfig}
   */
  const pluginConfig = {
    // not reactive can be put without using reactive or ref
    nonReactiveProp: 'nonReactive',
    // no validation, ref to track config changes; use reactive on nested arrays or objects
    selectOptions: ref([...config.selectOptions] || [...defaultConfig.selectOptions]),
    // ref prop with getter setter --> validation
    _initialTextInput: ref(defaultConfig.initialTextInput),
    set initialTextInput(value) {
      const validation = isValidText(value);
      if (validation === true) {
        this._initialTextInput.value = value;
      } else {
        getLogger().error('Error setting initialTextInput on plugin config:', validation);
      }
    },
    get initialTextInput() { return this._initialTextInput; },
  };
  if (config.initialTextInput) {
    pluginConfig.initialTextInput = config.initialTextInput;
  }

  /**
   * @type {PluginExampleState}
   */
  const pluginState = reactive({
    selected: pluginConfig.selectOptions.value[0],
    conditionalInput: '',
    initialTextInput: pluginConfig.initialTextInput.value,
    numberInput: 100.156,
    checkboxInput: false,
    email: '',
  });


  /**
   * watcher to update state, when specific config properties are changed
   * @see https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-multiple-sources
   *
   * additional notes:
   * - watching refs, changes are only triggered on resigning the value
   * - if reactive objects or arrays shall be watched, you'll need to add option `{ deep: true }`
   *   @see https://v3.vuejs.org/guide/reactivity-computed-watchers.html#watching-reactive-objects
   *   in this case you may need a separate watcher, since watching multiple sources seems only to work for refs
   * @returns {WatchStopHandle}
   */
  const stopWatching = watch(
    [pluginConfig.selectOptions, pluginConfig.initialTextInput],
    ([selectOptions, initialTextInput]) => {
      if (!selectOptions.includes(pluginState.selected)) {
        getLogger().error('invalid state', pluginState.selected);
        pluginState.selected = selectOptions[0];
      }
      // XXX should initial states be overwritten on config change?
      pluginState.initialTextInput = initialTextInput;
    },
  );

  /**
   * returns serializable state object
   * @returns {PluginExampleState}
   */
  function getSerializedState() {
    // use destruction to get rid of reactive getter/ setter. be careful with nested props!
    return { ...pluginState };
  }

  /**
   * can be async
   * @param {PluginExampleState} stateObject
   */
  function setSerializedState(stateObject) {
    /**
     * string returns of the validation functions are treated as error
     * @type {Object<string, true|string>}
     */
    const validation = {
      conditionalInput: conditionalTest(stateObject.conditionalInput, stateObject.selected),
      initialTextInput: isValidText(stateObject.initialTextInput),
      email: isValidEmail(stateObject.email),
    };
    Object.keys(validation).forEach((key) => {
      if (validation[key] !== true) {
        // XXX warning or error???
        getLogger().warning(`Validation failed for state property "${key}":`, validation[key]);
        // XXX should invalid props be assigned or not?
        delete stateObject[key];
      }
    });
    Object.assign(pluginState, stateObject);
  }

  return {
    get name() { return packageJSON.name; },
    get version() { return packageJSON.version; },
    get vcMapVersion() { return packageJSON.vcMapVersion; },
    config: pluginConfig,
    state: pluginState,
    getSerializedState,
    setSerializedState,
    onVcsAppMounted(app) {
      const { action, destroy } = createToggleAction(
        {
          name: 'Plugin Example',
          icon: '$vcsHealthCareIndustries',
          title: 'Example Plugin Map Button Tooltip',
        },
        {
          id: 'pluginExample',
          component: pluginExampleComponent,
          slot: WindowSlot.STATIC,
          state: {
            headerTitle: 'Plugin Example',
            headerIcon: '$vcsCircle',
          },
        },
        app.windowManager,
        packageJSON.name,
      );
      app.navbarManager.add({
        id: 'pluginExample',
        location: ButtonLocation.TOOL,
        action,
      }, packageJSON.name);
      this._destroyAction = destroy;
    },
    toJSON: async () => {
      const configJson = {};
      configJson.selectOptions = pluginConfig.selectOptions;
      if (pluginConfig.initialTextInput !== defaultConfig.initialTextInput) {
        configJson.initialTextInput = defaultConfig.initialTextInput;
      }
      return configJson;
    },
    destroy() {
      // destroy watcher
      stopWatching();
      if (this._destroyAction) {
        this._destroyAction();
        this._destroyAction = null;
      }
    },
  };
}
