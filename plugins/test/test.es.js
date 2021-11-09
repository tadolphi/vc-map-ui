import { getCurrentInstance, inject } from '@vue/composition-api';
import { Cartesian2 } from '@vcmap/cesium';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { toolboxData } from './toolbox-data';

let source;

function getSource() {
  if (!source) {
    source = new VectorSource();
  }
  return source;
}


export default {
  registerUiPlugin: async () => ({
    mapButton: {
      template: "<Button @click=\"alert('check')\">VC Systems</Button>",
      setup() {
        const app = inject('vcsApp');
        const cartesian3 = new Cartesian2(1, 2);

        const toolboxManager = inject("toolboxManager");

        toolboxData.forEach(([group, id]) => toolboxManager.addToolboxGroup(group, id));

        return {
          app,
          cartesian3,
        };
      },
      methods: {
        alert(msg) {
          getSource().addFeature(new Feature({}));
          window.alert(`
there are ${getSource().getFeatures().length} features
          ${this.app.maps.activeMap.name}`);
        },
      },
    },
  }),
};
