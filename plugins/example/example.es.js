/* eslint-disable no-console */
import { inject } from '@vue/composition-api';
import { WINDOW_POSITIONS, WINDOW_SLOTS } from '../../src/modules/window-manager/window.manager.js';
import mySuperComponent from './mySuperComponent.vue';

export default {
  registerUiPlugin: async (config) => {
    console.log('registerUIPlugin', config);
    return {
      supportedMaps: ['vcs.vcm.maps.Openlayers', 'vcs.vcm.maps.Cesium'],
      name: 'example',
      mapButton: [{
        template: '<Button @click="switchWindow()">Example</Button>',
        setup() {
          const app = inject('vcsApp');
          return {
            app,
          };
        },
        methods: {
          switchWindow() {
            this.app.windowManager.onRemoved.addEventListener((test) => {
              console.log(test);
            });
            if (this.app.windowManager.has('test')) {
              this.app.windowManager.remove('test');
            } else {
              this.app.windowManager.add({
                id: 'test',
                component: mySuperComponent,
                windowSlot: WINDOW_SLOTS.dynamicRight,
              });
            }
          },
        },
      }, {
        template: '<Button @click="switchWindow()">ADD</Button>',
        setup() {
          const app = inject('vcsApp');
          return {
            app,
          };
        },
        methods: {
          switchWindow() {
            if (this.app.windowManager.has(228)) {
              this.app.windowManager.remove('test');
            } else {
              this.app.windowManager.add({
                id: 'test',
                component: mySuperComponent,
                windowSlot: WINDOW_SLOTS.dynamicRight,
              });
            }
          },
        },
      }],
    };
  },
  postInitialize: async (config) => {
    console.log('postInitialize', config);
  },
  preInitialize: async (config) => {
    console.log('preInitialize', config);
  },
  postUiInitialize: async (config, app) => {
    app.windowManager.add({
      id: 228,
      component: mySuperComponent,
      width: 250,
      position: WINDOW_POSITIONS.topRight,
      windowSlot: WINDOW_SLOTS.dynamicRight,
    });

    app.toolboxManager.addToolboxGroup(
      {
        type: 'toggleButton',
        icon: '$vcsPointSelect',
        id: 15,
        active: true,
      },
      15,
    );
    const button = app.toolboxManager.get(15);

    console.log(button);
    console.log('postUiInitialize', config);
  },
};
