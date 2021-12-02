# Advanced Ellipsis

> It provides advanced ellipsis capabilities when the content box is small and only a part of the content needs to be shown, and part of the content is important.

## Usage

### Module usage without npm
```bash
npm i advanced-ellipsis
```
```js
import AdvancedEllipsis from 'advanced-ellipsis';
const advancedEllipsis = new AdvancedEllipsis();
advancedEllipsis.start();
```
>
### Module usage with CDN
```html
<script type="module">
	import AdvancedEllipsis from 'https://cdn.jsdelivr.net/npm/advanced-ellipsis/dist/advanced-ellipsis.esm.js';
	const advancedEllipsis = new AdvancedEllipsis();
	advancedEllipsis.start();
</script>
```
>
### &lt;script&gt; tag Usage with CDN
```html
<script src="https://cdn.jsdelivr.net/npm/advanced-ellipsis/dist/advanced-ellipsis.js"></script>
<script>
	var advancedEllipsis;
	window.onload = function () {
		advancedEllipsis = new AdvancedEllipsis();
		advancedEllipsis.start();
	};
</script>
```

<br><br>
## Demo

https://chae-sumin.github.io/advanced-ellipsis/

<br><br>
## Methods

### constructor
```js
const advancedEllipsis = new AdvancedEllipsis($selector);
or
const advancedEllipsis = new AdvancedEllipsis($options);
or
const advancedEllipsis = new AdvancedEllipsis($options, $selector);
// $selector is a string
// $options is an object
```
If `$selector` is not entered, `'[data-ellipsis]'` is set as the default.

### Methods

|Methods|Description|Parameter|return|
|-|-|-|-|
|`start`|Set ellipsis according to the set `$options` and `$attributes`.<br>`$status` becomes true|-|`this`|
|`destroy`|Restore the ellipsis set through the `start()`.<br>`$status` becomes false|-|`this`|
|`restart`|Restart when `$status` is start(true).|-|`this`|

<br>

|Methods|Description|Parameter|Parameter type|return|
|-|-|-|-|-|
|`setElements`|Set the element according to the `$selector`.<br>Existing elements are automatically `destroy()`|`$selector`|string|`this`|
|`getElements`|Returns the set elements in an array.<br>Changing the returned array does not change the elements<br>(it is possible to change the element itself).|-|-|Array&lt;HTMLElement&gt;|
|`setOptions`|Set the options according to the `$options`.<br>Calls `restart()` when options have changed|`$options`|object|`this`|
|`getOptions`|Calls the set option.<br>Converting the returned object does not change the options.|-|-|object|
|`getOption`|Returns the option value corresponding to `$optionKey`|`$optionKey`|string|boolean &#124; number &#124; string &#124; object|
|`getStatus`|Returns `$status`. If it is true, `start()` is in operation. If false, it is before `start()` or after `destroy()`.|-|-|`$status` (boolean)|

<br><br>
## Options and Attributes

### common options <span id="options"></span>
|Option|Description|Type|Default|
|-|-|-|-|
|`mutationObserver`|When this value is true and `$status` is start(true),<br>change the set element is detected.<br>Elements whose changes are detected are reset.|boolean|true|
|`defalutStyles`|If the value is true, apply ellipsis by default.<br>If false, you have to modify the style yourself to ellipsis.<br>`defalutStyles` = {<br>&emsp;overflow: hidden;<br>&emsp;white-space: nowrap;<br>&emsp;text-overflow: ellipsis;<br>}|boolean|true|
|`useCloneNode`|If the value is true, use cloneNode to determine ellipsis.<br>If false, use scrollWidth.|boolean|false|
|`showOption`|It gives special effects to ellipsis processed nodes.<br>`'static'`: I only apply ellipsis.<br>`'flow'`: Text flows sideways when a mouse hover or touch is touched.<br>`'flow-auto'`: Text automatically flows sideways.<br>`'tooltip'`: Text flows sideways when a mouse hover or touch is touched.|string|'static'|

### flow options <span id="flow_options"></span>
When `showOption` or `data-ellipsis-show-option` is `'flow'` or `'flow-auto'`
|Option|Description|Type|Unit|Default|
|-|-|-|-|-|
|`flowDelay`|The delay time before the text flows.|number|ms|1000|
|`flowAfterDelay`|The delay time after text flow is over.|number|ms|1000|
|`flowSpeed`|The speed at which the text flows.|number|px / s|50|
|`flowPadding`|Add the space at the end as the text flows.|number|px|20|
|`flowCount`|The number of flows running after the event occurs.<br>when the `showOption` is `'flow'`.|number|-|1|
|`flowCountPre`|The number of flows that are executed as soon as the setting is made.<br>when the `showOption` is `'flow'`.|number|-|0|
|`flowAutoCount`|The number of flows when `showOption` is `'flow-auto'`.|number|-|Infinity|

### tooltip options <span id="tooltip_options"></span>
When `showOption` or `data-ellipsis-show-option` is `'tooltip'`
|Option|Description|Type|Default|
|-|-|-|-|
|`tooltipShowAlways`|Set to true if you want tooltips to appear even in non-ellipsis text.|boolean|false|
|`tooltipClass`|The class applied to the tooltip that is created.<br>(Strings separated by spacebars)|string|'ellipsis_tooltip_box'|
|`tooltipDuration`|The time when the tool tip is maintained. (unit: ms)|number|Default|
|`customTooltipStyles`|Apply custom style to tool tip.|object|{ }|

### attributes <span id="attribute"></span>
If the element has the following prop, overwrite the options.
>
example:
``` html
<div data-ellipsis data-ellipsis-show-option="flow-auto">ellipsis text...</div>
```
|Attributes|Description|
|---|----|
|`data-show-option`|overwrite [`showOption`](#options)|
|`data-flow-count`|overwrite both [`flowCount`](#flow_options) and [`flowAutoCount`](#flow_options)|
|`data-flow-count-pre`|overwrite [`flowCountPre`](#flow_options)|
|`data-tooltip-show-always`|overwrite [`tooltipShowAlways`](#tooltip_options)|
|`data-tooltip-id`|The class applied to the tooltip that is created.|
|`data-tooltip-class`|The id applied to the tooltip that is created.<br>(Strings separated by spacebars)|

<br><br>
## Description

- Elements only apply if they have only one text note as a child.
- when [`showOption`](#options) is `'flow'`, `'flow-auto'` or `'tooltip'`,<br>it detects `mouseover` or `touchstart` and operates.
- The default value of elements is `'[data-ellipsis]'`.
- Always follow the priority below
> Options
> > [`Attributes`](#attribute) > [`custom Options`](#options) > [`default Options`](#options)
> ___
> Tooltip Element Class
> > [`Attributes`](#attribute) > [`tooltipElementClass`](#tooltip_options)
> ___
> Tooltip Element Styles
> > `!important styles` > `customTooltipStyles` > `defalutTooltipStyles` > `User-entered inline styles` > `css styles`
> >
> >`customTooltipStyles` and `defalutTooltipStyles` will be override `User-entered inline styles`


## License

[![NPM](https://img.shields.io/npm/l/advanced-ellipsis)](https://github.com/Chae-Sumin/advanced-ellipsis/blob/master/LICENSE)

## Contact

cotnmin@gmail.com
