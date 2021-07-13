import { reactive } from '@vue/composition-api';
import Vue from 'vue';
import { Subject } from 'rxjs';

/**
 * @typedef Coordinates
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef PopoverState
 * @property {string | VueComponent} component
 * @property {Coordinates} coordinates
 * @property {Function} callback
 * @property {boolean} visible
 * @property {string | number} id
 */
/**
 * @typedef PopoversState
 * @property {Object.<string, PopoverState>} items
 */

/* eslint-disable import/prefer-default-export */
/**
 * @class PopoverManager
 * @description Manages a set of popovers. Should be instanciated with a reactive state and injected at root.
 */
export class PopoverManager {
  onAdded = new Subject();

  constructor() {
    /** @type {PopoversState} */
    this.state = reactive({
      items: {},
    });
    /** @type {Map<string, HTMLElement>} overlayRefs */
    this.overlayRefs = new Map();
  }

  /**
   * @method
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return !!this.get(id);
  }

  /**
   * @method
   * @param {string} id
   * @returns {Object}
   */
  get(id) {
    return this.state.items[id];
  }

  /**
   * @method
   * @description
   * @param {PopoverState} popover
   * @param {Coordinates} coordinates
   * Assigns the current x and v value of a popover to the ref.
   */
  setCoordinates(popover, coordinates) {
    Vue.set(this.state.items, popover.id, {
      ...popover,
      coordinates: { ...coordinates },
    });
  }

  /**
   * @method
   * @param {Object} obj
   * @param {string} obj.name
   * @param {string | number} obj.id
   * @param {HTMLElement} obj.parent
   * @param {boolean} obj.visible
   * @param {Vue.Component} obj.cmp
   * @param {Function} obj.callback
   * @param {Object} obj.coordinates
   * @returns {Object}
   */
  registerPopover({
    name,
    id,
    cmp,
    parent,
    visible = true,
    callback = () => {},
    coordinates = {},
  }) {
    Vue.component(name, cmp.default || cmp);
    this.overlayRefs.set(id, parent);

    const popover = {
      component: name,
      coordinates,
      visible,
      callback,
      id,
      parent,
    };

    return popover;
  }

  /**
   * @method
   * @param {PopoverState} popover
   * @param {Element} parent
   */
  add(popover, parent) {
    Object.values(this.state.items).forEach((item) => {
      if (parent.contains(item.parent)) {
        this.removePopover(item.id);
      }
    });
    Vue.set(this.state.items, popover.id, popover);
    this.onAdded.next(popover);
  }

  /**
   * @method
   * @param {string | number} id ID of popover to be removed
   * @returns {boolean}
   */
  removePopover(id) {
    if (this.state.items[id]) {
      Vue.delete(this.state.items, id);
      this.overlayRefs.delete(id);
      return true;
    }
    return false;
  }


  /**
   * @method
   * @description
   * Removes all popovers whose parent elements have been removed from the DOM
   */
  removeOrphaned() {
    Array.from(this.overlayRefs.keys()).forEach((key) => {
      if (!document.contains(this.overlayRefs.get(key))) {
        this.removePopover(key);
      }
    });
  }

  /**
   * @method
   * @param {Node} ref parent node of the nodes which shall be removed
   */
  removeAllFrom(ref) {
    Array.from(this.overlayRefs).forEach(([key, popover]) => {
      if (ref.contains(popover)) {
        this.removePopover(key);
      }
    });
  }
}
