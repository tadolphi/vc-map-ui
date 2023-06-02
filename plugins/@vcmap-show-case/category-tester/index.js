import { ButtonLocation, createToggleAction, WindowSlot } from '@vcmap/ui';
import packageJSON from './package.json';
import Categories from './CategoriesExample.vue';

/**
 * @returns {VcsPlugin}
 */
export default async function categoryTest() {
  return {
    get name() {
      return packageJSON.name;
    },
    get version() {
      return packageJSON.version;
    },
    get vcMapVersion() {
      return packageJSON.vcMapVersion;
    },
    initialize(app) {
      const { action, destroy } = createToggleAction(
        {
          name: 'Category Tester',
          title: 'Category Tester Plugin',
          icon: '$vcsPen',
        },
        {
          id: 'category-editor',
          component: Categories,
          slot: WindowSlot.DETACHED,
          state: {
            headerTitle: 'Category Tester',
            headerIcon: '$vcsPen',
          },
          position: {
            width: 500,
          },
        },
        app.windowManager,
        packageJSON.name,
      );
      app.navbarManager.add(
        { id: 'category-editor', action },
        packageJSON.name,
        ButtonLocation.TOOL,
      );
      this._destroyAction = destroy;
    },
    i18n: {
      de: {
        categoryTester: {
          title: 'Titel',
          draggable: 'verschiebbar',
          selectable: 'selektierbar',
          singleSelect: 'Einfachauswahl',
        },
      },
      en: {
        categoryTester: {
          title: 'Title',
          draggable: 'draggable',
          selectable: 'selectable',
          singleSelect: 'single select',
        },
      },
    },
    destroy() {
      if (this._destroyAction) {
        this._destroyAction();
        this._destroyAction = null;
      }
    },
  };
}
