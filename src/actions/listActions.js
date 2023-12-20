import { reactive, watch } from 'vue';
import { check } from '@vcsuite/check';
import { createToggleAction } from './actionHelper.js';
import ImportComponent from '../components/import/ImportComponent.vue';
import { WindowSlot } from '../manager/window/windowManager.js';
import { vcsAppSymbol } from '../pluginHelper.js';

/**
 * Creates an action for renaming an item in a VcsList. Sho VcsTextfield in VcsList.
 * @param {import("../components/lists/VcsList.vue").VcsListItem} item
 * @param {Partial<import("./actionHelper.js").ActionOptions>} [actionOptions={}]
 * @returns {import("./actionHelper.js").VcsAction}
 */
export function createListItemRenameAction(item, actionOptions = {}) {
  return {
    name: 'list.renameItem',
    ...actionOptions,
    callback: () => {
      item.rename = true;
    },
  };
}

/**
 * Creates an action for renaming an item in a VcsList.
 * @param {import("@vcmap/core").Collection<T>} collection
 * @param {T} item
 * @param {Partial<import("./actionHelper.js").ActionOptions>} [actionOptions={}]
 * @template {Object} T
 * @returns {import("./actionHelper.js").VcsAction}
 */
export function createListItemDeleteAction(
  collection,
  item,
  actionOptions = {},
) {
  return {
    name: 'list.deleteItem',
    ...actionOptions,
    callback: () => {
      if (collection.has(item)) {
        collection.remove(item);
      }
    },
  };
}

/**
 * Creates an action based on a provided selection
 * @param {import("vue").Ref<Array<import("../components/lists/VcsList.vue").VcsListItem>>} selection
 * @param {ActionOptions & {callback:import("./actionHelper.js").ActionCallback}} [actionOptions]
 * @returns {{action: import("vue").UnwrapedRef<import("actionHelper.js").VcsAction>, destroy: import("vue").WatchStopHandle}}
 */
export function createListItemBulkAction(selection, actionOptions) {
  check(actionOptions, {
    name: String,
    icon: [undefined, String],
    title: [undefined, String],
    callback: Function,
  });

  const action = reactive({
    disabled: true,
    ...actionOptions,
  });

  const destroy = watch(selection, () => {
    action.disabled = selection.value.length < 1;
  });

  return { action, destroy };
}

/**
 * @param {import("vue").Ref<Array<import("../components/lists/VcsList.vue").VcsListItem>>} selection
 * @param {import("./actionHelper.js").ActionCallback} exportCallback
 * @param {string|symbol} owner
 * @returns {{action: import("../manager/collectionManager/collectionManager.js").OwnedAction, destroy: (function(): void)}}
 */
export function createListExportAction(selection, exportCallback, owner) {
  const { action, destroy } = createListItemBulkAction(selection, {
    name: 'list.export',
    callback: exportCallback,
  });

  return {
    action: {
      action,
      owner,
      weight: 99,
    },
    destroy,
  };
}

/**
 *
 * @param {function(files: File[]):void|Promise<void>} importCallback
 * @param {import("../manager/window/windowManager.js").WindowManager} windowManager
 * @param {string|symbol} owner
 * @param {string} parentId
 * @returns {{ownedAction: import("../manager/collectionManager/collectionManager.js").OwnedAction, destroy: (function(): void)}}
 */
export function createListImportAction(
  importCallback,
  windowManager,
  owner,
  parentId,
) {
  check(importCallback, Function);
  check(owner, [String, vcsAppSymbol]);
  check(parentId, String);

  const { action, destroy } = createToggleAction(
    {
      name: `list.import`,
    },
    {
      id: `list-import`,
      parentId,
      component: ImportComponent,
      slot: WindowSlot.DYNAMIC_CHILD,
      state: {
        headerTitle: `list.import`,
        headerIcon: '$vcsPlus',
      },
      props: {
        importFiles: importCallback,
      },
    },
    windowManager,
    owner,
  );

  return {
    action: {
      action,
      owner,
      weight: 98,
    },
    destroy,
  };
}
