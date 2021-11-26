# Advanced Ellipsis

> this is not yet finished
>
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
const advancedEllipsis = new AdvancedEllipsis( $selector | $options );
// If props is string, run getElements(), and if object, run setOptions().
```
### Methods
|Methods|Description|Parameter|Parameter type|return|
|-|-|-|-|-|
|`start`|Set ellipsis according to the set `options` and `attributes`.|-|-|-|
|`destroy`|Restore the ellipsis set through the `start()`|-|-|-|
|`setElements`|Reset elements to `$selector`.<br>Since `destroy()` is called, `start()` should be called again.|`$selector`|string|-|-|
|`getElements`|Returns the currently added `elements`.<br>(Includes elements that haven't started)|-|-|Array&lt;HTMLElement&gt;|
|`setOptions`|Set `$options` and Run `setElements(option.selector)`<br>(see options below for content)|`$options`|object|-|

<br><br>
## Options and Attributes

### common options
|Option|Description|Type|Default|
|-|-|-|-|
|`defalutStyles`|If the value is true, apply ellipsis by default.<br>If false, you have to modify the style yourself to ellipsis.|boolean|true|
|`useCloneNode`|If the value is true, use cloneNode to determine ellipsis.<br>If false, use scrollWidth.|boolean|false|
|`showOption`|It gives special effects to ellipsis processed nodes.<br>`'static'`: I only apply ellipsis.<br>`'flow'`: Text flows sideways when a mouse hover or touch is touched.<br>`'flow-auto'`: Text automatically flows sideways.<br>`'tooltip'`: Text flows sideways when a mouse hover or touch is touched.|string|'static'|
|`selector`|Selector to select nodes to which ellipsis will be applied.|string|'[data-ellipsis]'|
___
### flow options
When `showOption` or `data-ellipsis-show-option` is `'flow'` or `'flow-auto'`
|Option|Description|Type|Unit|Default|
|-|-|-|-|-|
|`flowDelay`|The delay time before the text flows.|number|ms|1000|
|`flowAfterDelay`|The delay time after text flow is over.|number|ms|1000|
|`flowSpeed`|The speed at which the text flows.|number|px / s|50|
|`flowPadding`|Add the space at the end as the text flows.|number|px|20|
|`flowCount`|The number of flows at once when the `showOption` is `'flow'`.|number|Unit|1|
|`flowAutoCount`|The number of flows when `showOption` is `'flow-auto'`.|number|Unit|Infinity|
___
### tooltip options
When `showOption` or `data-ellipsis-show-option` is `'tooltip'`
|Option|Description|Type|Default|
|-|-|-|-|
|`tooltipElementClass`|The class applied to the tooltip that is created.<br>(Strings separated by spacebars)|string|'ellipsis_tooltip_box'|
|`tooltipDuration`|The time when the tool tip is maintained. (unit: ms)|number|Default|
|`customTooltipStyles`|Apply custom style to tool tip.|object|{ }|
___
### attributes
If the element has the following prop, overwrite the options.
>
example:
``` html
<div data-ellipsis data-ellipsis-show-option="flow-auto">ellipsis text...</div>
```
|Attributes|Description|
|-|-|
|`data-ellipsis-show-option`|The class applied to the tooltip that is created.|
|`data-ellipsis-flow-count`|The number of flows<br>(overwrite both `flowCount` and `flowAutoCount`)|
|`data-tooltip-element-id`|The class applied to the tooltip that is created.|
|`data-tooltip-element-class`|The id applied to the tooltip that is created.<br>(Strings separated by spacebars)|

<br><br>
## tip

Always follow the priority below

Options
> `Attributes` > `custom Options` > `default Options`
___
Tooltip Element Class
> `Attributes` > `tooltipElementClass`
___
Tooltip Element Styles
> `!important styles` > `customTooltipStyles` > `defalutTooltipStyles` > `User-entered inline styles` > `css styles`
>
>`customTooltipStyles` and `defalutTooltipStyles` will be override `User-entered inline styles`

## License

[![NPM](https://img.shields.io/npm/l/advanced-ellipsis)](https://github.com/Chae-Sumin/advanced-ellipsis/blob/master/LICENSE)

## Contact

cotnmin@gmail.com
