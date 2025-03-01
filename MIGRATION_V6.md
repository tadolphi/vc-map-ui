# Breaking Changes

- VcsDatePicker now expects a `Date` input.
- `vuetify` is no longer global, but attached to the `VcsUiApp`.
  - `getDefaultPrimaryColor` now requires the app as a parameter.
  - `getColorByKey` now requires the app as a parameter.
- `i18n` update
  - We use the new `Composition API` and not the legacy API.
  - The `$t` mixin no longer supports any other type of input but `string`. If you have potentially undefined input (user input or configurations such as `item.tooltip`) you can use the `safe translate`mixin `$st` which will return `''` on null or undefined.
- `ContentTreeCollection.getTreeOpenStateRef` now returns `string[]` instead of `Ref<string[]>` and was renamed to `getTreeOpenState`
- Changed the `Notification.open` type, it is now a boolean. To get the ref, there is a readonly `openRef` property.
- access to color scss variables changed, `var(--v-primary-base)` becomes `rgb(var(--v-theme-primary))` see:https://vuetifyjs.com/en/getting-started/upgrade-guide/#theme
- `VcsList` component now only accepts reactive items via the API (using v-model still works the same).
  - `createListItemRenameAction` and `@rename-item` event has been removed.
  - Renaming is now handled directly by the new `VcsListItem` component. You need to provide a titleChanged function on the item!
  - The `VcsListItem` interface is extended by a prop `renamable`, which can be a boolean or action options.
- @vcmap/ui css utility classes are removed (https://github.com/virtualcitySYSTEMS/map-ui/tree/release-v5.2/src/styles/utils), use vuetify utility classes: https://vuetifyjs.com/en/styles/borders/#usage
- Globally removed `dense` property of all Components, which supported `dense` Components will now render in the vcs default
- Globally removed `noPadding` property of all Components, which supported `noPadding`, default component padding can be deactivated by adding py-0 to the component
- `VcsTooltip.vue` is removed. Use `v-tooltip` instead.
- Legacy style `legend` handling was completely removed. Use the new `properties.legend`.
- VcsTextField
  - `showSpinButtons` has been removed, this is now the default behaviour, can be changed with the vuetify `hideSpinButtons` api
  - added `tooltip` to show a tooltip on hover over the element
  - progress bar changes: loading="primary" can now be used to get a progress bar in the primary color
  - input type `file` has been moved to a new component `VcsFileInput.vue`
- `VcsRadioGrid.vue` is removed. Use `VcsRadio` with properties `inline`, `labelPosition="top"` and `class="d-flex justify-center"` instead.
- `ImportComponent.vue` has been renamed to `VcsImportComponent.vue` and is now exported as `VcsImportComponent`
- `FileDrop.vue` has been renamed to `VcsFileDrop.vue` and is now exported as `VcsFileDrop`
- `setupExtentComponentActions()` has no longer a param `disabled`. Change the disabled state on the returned actions instead.
- `PluginEditorComponent` is more strictly typed. You must ensure the types of the `setConfig` and `getConfig` props actually fit the interface.
- There is a new VcsMarkdown Component that should be used for rendering Markdown Text.
- There is a new VcsExpansionPanel Component that should be used for expandable sections.
- `VcsLabel`
  - added tooltip and tooltipPosition
- `VcsFormattedNumber`
  - added tooltip and tooltipPosition
- `VcsSlider`
  - added tooltip and tooltipPosition
- Removed `VcsCustomScreen.vue`. Use `VcsTextPage.vue` instead.
- Added new templating capabilities to markdown:
  - Removed `replaceAttributes` and renamed to `renderTemplate`.
  - Top level attributes with spaces in their names shall no longer be expanded with
    `["spaced attributes"]`, but `"spaced attribute"`. Nested spaced attributes remain as `nested["spaced attribute"]`
  - Templates now support ol style expressions which evaluate to a string in normal attribute expansion (`{{ attribute }}` can now
    also be written as `{{ ["get", "attribute"] }}` or any other style expression).
  - Templates can now be rendered with expressions. These follow mustache syntax using the special
    expansions `{{#if $expression}}`, `{{elseif $expression}}`, `{{else}}` and
    have to be closed with `{{/if}}`. Expression can be attribute keys directly or
    any ol style expression that will evaluate to a boolean (same as with normal attribute expansion, just not a string).
  - Templates can now iterate over Arrays and Objects to render a block multiple times using the `{{#each (item) in object}}` syntax.
- `UIConfig`
  - changed the `config` accessor from `ref` to `reactive` use `app.uiConfig.config.x` instead of `app.uiConfig.config.value.x`
  - added new config options: `hideHeader`, `hideSearch`, `hideMapButtons`, `hideToolbox`, `hideMapNavigation`,
    `hideFooter`, `hideMyWorkspace`, `hideMyWorkspace`, `hideLegend`, `hideSettings`, `overviewMapActiveOnStartup`
- Changed interface of `VcsTable.vue`. You can provide `keyHeader` and `valueHeader` props instead of a `headers` array.
- Changed featureInfo classes `IframeFeatureInfoView`, `MarkdownFeatureInfoView` and `MarkdownBalloonFeatureInfoView` to all support same markdown template syntax and style expressions for attribute replacement.
- panelManager now has a `positionChanged` event, which is raised whenever a panel position changes
- VcsTextPage now uses i18n to translate the url, can be used to configure a locale aware imprint or dataprivacy
- Removed `show` property from `VcsHelp.vue`. Use `<VcsHelp v-if="">` instead.
- Changed API of `AbstractConfigEditor.vue`.
  - No longer calls callback props `onSubmit`, `onCancel` and `onReset`. Use event handler instead.
  - Removed prop `setConfigOnCancel`. Explicitly add a `@cancel` event listener, if required.
- The `title` property for pluin editors has moved from `PluginConfigEditorComponent` to the `PluginConfigEditor`.
- Plugins which provide editors can no longer return promises from `getConfig` or `setConfig`.
- Use newly introduced `useComponentId()` helper to generate unique html ids for inputs with labels.
- `StyleSelector.vue` expects now a layerNames `Array<string>` prop instead of a single layerName
- Changed the parameters of `getAllowedEditorTransformationModes` to respect new capabilities.
- Changed the type of `WindowComponentOptions.state`. The state now has its own type and accepts `Ref` or `ComputedRef` for certain properties.
- Components used in custom feature info views, must either define a prop `attributes` or set `inheritAttrs: false`. Otherwise, vue will try to assign attributes to the read only attributes key of the dom element.

# Features

- Added an `openLegendOnAdd` ui config to open the legend, if new legend entries become available.

# Extended Theming

Vuetify Theming can now be used to create custom css variables, see `vuetify.js` we will use this to configure the following
themes

- `vcs-font-size` To globally set the default fontsize. Allows customers to configure a map with larger fonts.
  The fontsize should have valid values between 10 and 24px.
- `vcs-font-family` Sets font Family

These variables can be used in CSS with `var(--v-vcs-font-size)`
Also CSS can be used to calculate values `calc(var(--v-vcs-font-size) - 1px)`;
Most height values like the height of the buttons/listItems/navbar/toolbar ... is calculated based on the `fontSize`

For the fontSize a helper function is exported, which can be used to set size properties in html:
There is also `useIconSize` helper which will return the default small Icons Size as a computed based on the `fontSize`

```js
const fontSize = useFontSize();
const iconSize = useIconSize();
```

```vue
<v-btn :size="fontSize * 2"></v-btn>
<v-icon :size="iconSize">mdi-chevron</v-icon>
```

For Development the darkTheme has a larger FontSize;

Todo:

- Write documentation for Theming Support

# Component Stories

We now provide a Story framework to test and document components. See: https://histoire.dev/
For each `dumb` component which do not have any interaction with the `vcsApp` or the `map` we need to write a story.
For an example see: `story/components/button/VcsButton.story.vue`
You can use story meta to wrap your component either in a `v-row`, `v-card` or `v-sheet`. See [StoryWrapper](./story/StoryWrapper.vue) and [checkbox story](./story/components/form-inputs-controls/VcsCheckbox.story.vue).

Story development can be done by calling `npm run story:dev`. This will start a development server at http://localhost:6006

# Typical Migrations

- update all `@input` `:value` and custom `emit('input')` in `v-model` components update to the [new syntax](https://v3-migration.vuejs.org/breaking-changes/v-model.html).
- replace `::v-deep` with `:deep()` in `scss`.
- replace old vcs utility css classes `border-1--primary`, `border-2--primary`, `user-select-none`, `d-contents`, `fade-in-100...`, `pos-...`, `w-full` --> `w-100`, `w-half` --> `w-50`,
  `h-...`, `w-...`, `slide-from...`, `-m...`, `z-index...`, `transition...`, `flip-vertical`, `rotate`, `gap...` --> `gc-`, `text--disabled` --> `text-disabled`
- check css, use provided css variables to calculate values for fonts and heights.
- Write new story for the component.
- replace `VcsTooltip` with `v-tooltip`, see [VcsCheckbox](./src/components/form-inputs-controls/VcsCheckbox.vue) for an example how to implement tooltip and error tooltips.
- Make sure you set `:hide-details=false` when using `VcsTooltip` inside your component. This will ensure that the message slot is available and can be used for displaying the error tooltip.
- Check order of `v-bind="{ ...$attrs }"`, see https://v3-migration.vuejs.org/breaking-changes/v-bind.html#_3-x-syntax the behaviour to Vue2 has changed.
- A new `VcsExtentEditor.vue` component is exported.
- use new helper for components:
  - `useProxiedAtomicModel` when creating a component with an atomic model value
  - `useProxiedComplexModel` when creating a component with an array or object model value
  - `removeListenersFromAttrs` when binding attrs without listener
- Update Wizard steps beginning from 0 instead of 1
- `@vcsuite/check` should be updated to v2 if used

# Troubleshooting & Solutions

| Problem                                                                                                                        | Solution                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I have weird issues where something is trying to bind `modelValue` to a tooltip or other undefined property validation failing | this is auto bind, add `inheritAttrs: false` to the component you are using                                                                                                                                               |
| where did ::v-deep go?                                                                                                         | it has been replaced with :deep() pseudo element                                                                                                                                                                          |
| my custom v-model no longer updates                                                                                            | be sure to update to the [new syntax](https://v3-migration.vuejs.org/breaking-changes/v-model.html)                                                                                                                       |
| my array refs no longer work properly                                                                                          | arrays can now be `reactive`. refactor to that                                                                                                                                                                            |
| my actions of list items do not work properly                                                                                  | use an `reactive` array of list items: `const items = reactive([{ name: 'example', actions: [{ ... }] }]);`                                                                                                               |
| my list entries look weird                                                                                                     | the list apis have changed. use slots `prepend` and `append` for most things                                                                                                                                              |
| my action is not reactive anymore                                                                                              | actions need to be reactive, for changes to the action object to be tracked reactive(action) before                                                                                                                       |
| ...                                                                                                                            | changing the state, action.active = true                                                                                                                                                                                  |
| my component options are no longer part of lists                                                                               | with the change to Proxy objects, adding stuff to reactive arrays will add a _proxy_. You must use `toRaw` when checking if a value is included (typically with actions or other places where we dont check using `name`) |
| my component used VcsTooltip to display error messages                                                                         | See [VcsCheckbox](./src/components/form-inputs-controls/VcsCheckbox.vue) for an example how to implement tooltip and error tooltips.                                                                                      |
| what happened to `var(--v-base-xxx)`                                                                                           | you must use `rgb(var(--v-theme-base-lighten-2))` or similar. prefix with theme                                                                                                                                           |
| my VcsTextField component doesn't work any more for input type file                                                            | use new component [VcsFileInput](./src/components/form-inputs-controls/VcsFileInput.vue) instead.                                                                                                                         |
| my `PluginEditorComponent` has type errors now                                                                                 | you must ensure you actually adhere to the interface and use `PropType` for the functions so it conforms with the interface                                                                                               |
| my VcsWizard actions are not shown for the active step                                                                         | Check the step counting. It has to start with 0, not with 1!                                                                                                                                                              |
| rename no longer works on list items                                                                                           | make sure your list item _is reactive_ before passing it to the create rename helper                                                                                                                                      |

# ToDos & Issues

- fix `useErrorSync`
- fix crash if loading a window which has a child element which fails property validation
- fix chip array input remove visualizations (remove something from the middle to see)
- fix search result component.

- fix `ThemeChangerComponent.vue`
- fix `VcsFormButtons` disabled color
- fix `VcsToolButton` disabled state
- fix `VcsButton` disabled State
- refactor Specs using `spec helpers which mount vue` needed to switch to vue3 setup
- VRadioGroup: `row` prop has been changed to `inline`. Should edit all occurrences.

- cleanup styles, remove all styles not needed from `styles` folder

- remove `VcsTooltip.vue` and `form-inputs-controls/composables.js` (useErrorSync)

## Vue 3 Reactivity

- reactive()
  - accessing properties on the original Object will not be reactive, this changed to vue2.
  - Vue3 is using Proxy Objects now, so the reactive Object is not the same as the original Object

```
  const o = {
    test: '1'
  };

  const reactiveO = reactive(o);

  // not reactive in vue3, but did work in vue2
  o.test = '2';

  // reactive
  reactiveO.test = '2';
```

- using `props` Object for a component, used by the windowManager

```
  const atomicRef = ref(string);
  const complexRef = ref(['test']);

  const reactiveObject = reactive({ test: 'test' });

  windowManager.add({
    component: MyComponent,
    props: {
      atomicRef,
      complexRef,
      reactiveObject,
    },
  });

  `MyComponent.vue`
  <template>
     {{ atomicRef }} // works atomicRefs get Unwrapped in the Template
     {{ complexRef[0] }} // does not work, complex Refs do not get unwrapped in the Template
     {{ complexRefSetup[0] }} // does work, complex Refs will get unwrapped in the Setup
     {{ reactiveObject.test }} // works
  </template>
  <script>
    export default {
      name: 'MyComponent',
      props: {
        atomicRef:Object,
        complexRef:Object,
        reactiveObject:Object,
      },
      setup(props) {
          const complexRefSetup = props.complexRefSetup;
          return {
             complexRefSetup,
          }
      }
    }
  </script>
```

- If you want to provide reactivity through the props Object in the WindowManager, use reactive, and try to avoid
- passing refs through the `props` Object. If necessary refs can be injected using `provide/inject`
- using `ref` on an Array will cause _every_ entry added to the array
  to be reactive, thus `const foo = ref([]); const bar = {}; foo.value = [bar];` will
  lead to `foo.value.filter(a => a === bar);` will be empty, because it contains _the proxy of bar_.
  If you actually require deep reactivity on the array, use `toRaw` for comparisons
  otherwise, as in most cases use `shallowRef` and have the providing interface allow
  the adding of reactive objects, thus moving proxy creation to where it is
  actually required.
  > using `ref` or `reactive` in an underlying API will always
  > have side effects unless
  > you only allow `UnwrapRef`or`UnwrapNestedRef` as the input type.
  >
  > ```typescript
  > class ActionList {
  >   _actions = ref<VcsAction[]>([]);
  >
  >   add(action: VcsAction): void {
  >     this._actions.value = [...this._actions.value, action];
  >   }
  >
  >   has(action: VcsAction): boolean {
  >     return this._actions.value.findIndex((a) => a === action) > -1;
  >   }
  > }
  >
  > const action: VcsAction = { name: 'bar', callback(): void {} };
  > const list = new ActionList();
  > list.add(action);
  > // throws list actually does not inlcude action, but a Proxy.
  > assert(list.has(action));
  >
  > const reactiveAction = reactive(action);
  > list.add(reactiveAction);
  > // true since the proxy is added as is
  > assert(list.has(reactiveAction));
  > ```

## Wrapping Vuetify Components

### Slots

For Wrapper Components we should forward all Slots. This can be done by using the `getForwardSlots` function

```vue

<template>
  <v-component>
    // If we want to use a slot in the wrapper, we normally should forward the same slot to vuetify, this can be done in
    two ways.
    <template #default="scope">
      Custom Content which cannot be overwritten.
      <slot name="default" v-bind="scope ?? {}"> Custom Content which will be overwritten if default content is
        provided
      </slot>
    </template>
    // forward all other slots which are not `default`
    // we need to bind the scope.
    <template v-for="slot of forwardSlots" #[slot]="scope">
      <slot :name="slot" v-bind="scope ?? {}" />
    </template>
    <v-component>
</template>

<script>
  export default {
    setup(props, { slots }) {
      const forwardSlots = getForwardSlots(slots, ['default']);
      return {
        forwardSlots
      }
    }
  }
</script>
```
