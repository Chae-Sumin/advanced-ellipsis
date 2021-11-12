var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options) {
        this.isStart = false;
        this.nodes = [];
        this.options = {
            defalutStyles: true,
            useDataAttribute: true,
            useVirtualNode: false,
            showOption: 'static',
            selector: '[data-ellipsis]',
            flowDelay: 1000,
            flowAfterDelay: 1000,
            flowSpeed: 50,
            flowPadding: 20,
            flowCount: 1,
            flowAutoCount: Infinity,
            tooltipElementId: 'float_box',
            tooltipElementClass: 'float_box',
            tooltipDuration: 2000,
            customTooltipStyle: {},
        };
        this.defalutTooltipStyle = function (event) {
            var X = event.type === "touchend" ? event.changedTouches[0].clientX : event.clientX;
            var Y = event.type === "touchend" ? event.changedTouches[0].clientY : event.clientY;
            var isLeft = X < window.innerWidth / 2;
            var isTop = Y < window.innerHeight / 2;
            var boxGap = 10;
            return {
                width: 'auto',
                height: 'auto',
                maxWidth: (isLeft ? window.innerWidth - X : X) + 'px',
                padding: '5px',
                backgroundColor: '#fff',
                border: '1px solid #000',
                position: 'fixed',
                fontSize: '12px',
                left: isLeft ? Math.floor(X + boxGap) + 'px' : 'unset',
                right: !isLeft ? Math.floor(window.innerWidth - X - boxGap) + 'px' : 'unset',
                top: isTop ? Math.floor(Y + boxGap) + 'px' : 'unset',
                bottom: !isTop ? Math.floor(window.innerHeight - Y + boxGap) + 'px' : 'unset',
            };
        };
        if (typeof options === 'string') {
            this.setElements(options);
        }
        else {
            this.setOptions(options || {});
        }
    }
    AdvancedEllipsis.prototype.objectOverwrite = function (obj1, obj2) {
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
            return;
        Object.keys(obj2).forEach(function (key) {
            if (obj1.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        });
    };
    AdvancedEllipsis.prototype.start = function () {
        if (this.nodes.length) {
            this.nodes.forEach(this.addSetting.bind(this));
            this.isStart = true;
        }
    };
    AdvancedEllipsis.prototype.destory = function () {
        if (!this.isStart)
            return;
        if (this.nodes.length) {
            this.nodes.forEach(this.removeSetting.bind(this));
            this.nodes = [];
            this.isStart = false;
        }
    };
    AdvancedEllipsis.prototype.setElements = function (selector) {
        var _this = this;
        var elements = document.querySelectorAll(selector);
        if (this.isStart) {
            this.destory();
        }
        elements.forEach(function (element) {
            var node = {
                element: element,
                eventOn: false,
                timer: null,
                listener: null,
                beforeDefalutStyles: {
                    textOverflow: element.style.textOverflow,
                    overflow: element.style.overflow,
                    whiteSpace: element.style.whiteSpace
                }
            };
            _this.nodes.push(node);
        });
    };
    AdvancedEllipsis.prototype.addElements = function (selector) {
        var elements = document.querySelectorAll(selector);
        var nodes = this.nodes;
        elements.forEach(function (element) {
            if (nodes.some(function (node) { return element === node.element; }))
                return; // 중복 제거
            var node = {
                element: element,
                eventOn: false,
                timer: null,
                listener: null,
                beforeDefalutStyles: {
                    textOverflow: element.style.textOverflow,
                    overflow: element.style.overflow,
                    whiteSpace: element.style.whiteSpace
                }
            };
            nodes.push(node);
        });
    };
    AdvancedEllipsis.prototype.setOptions = function (options) {
        this.objectOverwrite(this.options, options);
        this.setElements(this.options.selector);
    };
    AdvancedEllipsis.prototype.addSetting = function (node) {
        var styles = node.element.style;
        var data = node.element.dataset;
        if (this.options.defalutStyles) {
            styles.textOverflow = 'ellipsis';
            styles.overflow = 'hidden';
            styles.whiteSpace = 'nowrap';
        }
        var showOption = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static');
        var lengthDiff = this.options.useVirtualNode ? this.checkEllipsisUseCloneNode(node.element) : this.checkEllipsis(node.element);
        if (lengthDiff && !node.listener) {
            node.element.dispatchEvent(new CustomEvent("addSetting", {
                bubbles: true,
                detail: {
                    element: node.element,
                    ellipsised: Boolean(lengthDiff),
                    lengthDiff: lengthDiff,
                    showOption: showOption,
                }
            }));
            switch (showOption) {
                case 'flow':
                    var flow_listener = this.flowListener(node, lengthDiff);
                    node.listener = flow_listener;
                    node.element.addEventListener('mouseover', node.listener);
                    break;
                case 'flow-auto':
                    var count = parseFloat(node.element.dataset.ellipsisFlowCount) || this.options.flowAutoCount || Infinity;
                    this.flowAnitate(node, lengthDiff, count);
                    break;
                case 'title':
                    this.titleText(node);
                    break;
                case 'tooltip':
                    var tooltip_listener = this.tooltipListener(node);
                    node.listener = tooltip_listener;
                    node.element.addEventListener('mouseover', node.listener);
                    node.element.addEventListener('touchend', node.listener);
                    break;
                default:
                    break;
            }
        }
    };
    AdvancedEllipsis.prototype.removeSetting = function (node) {
        var styles = node.element.style;
        var data = node.element.dataset;
        var showOption = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static');
        if (this.options.defalutStyles) {
            styles.textOverflow = node.beforeDefalutStyles.textOverflow;
            styles.overflow = node.beforeDefalutStyles.overflow;
            styles.whiteSpace = node.beforeDefalutStyles.whiteSpace;
        }
        node.element.dispatchEvent(new CustomEvent("addSetting", {
            bubbles: true,
            detail: {
                element: node.element,
                showOption: showOption,
            }
        }));
        switch (showOption) {
            case 'flow':
                node.element.removeEventListener('mouseover', node.listener);
                node.listener = null;
                break;
            case 'flow-auto':
                node.eventOn = false;
                break;
            case 'title':
                node.element.title = '';
                break;
            case 'tooltip':
                node.element.removeEventListener('mouseover', node.listener);
                node.element.removeEventListener('touchend', node.listener);
                node.listener = null;
                break;
            default:
                break;
        }
    };
    AdvancedEllipsis.prototype.checkEllipsis = function (element) {
        return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
    };
    AdvancedEllipsis.prototype.checkEllipsisUseCloneNode = function (element) {
        var contrast = element.cloneNode(true);
        contrast.style.display = 'inline';
        contrast.style.width = 'auto';
        contrast.style.visibility = 'hidden';
        element.parentNode.appendChild(contrast);
        var res = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
        element.parentNode.removeChild(contrast);
        return res;
    };
    AdvancedEllipsis.prototype.flowListener = function (node, length) {
        var _this = this;
        var count = parseFloat(node.element.dataset.ellipsisFlowCount);
        var listener = function () {
            if (!node.eventOn) {
                _this.flowAnitate(node, length, count);
            }
        };
        return listener;
    };
    AdvancedEllipsis.prototype.flowAnitate = function (node, length, repeatCount) {
        length = length + this.options.flowPadding;
        var start = null;
        var duration = length / this.options.flowSpeed * 1000;
        var delay = this.options.flowDelay;
        var afterDelay = this.options.flowAfterDelay;
        node.element.style.textOverflow = 'clip';
        node.eventOn = true;
        var flowAnitate = function (timestamp) {
            if (!node.eventOn)
                return;
            if (!start)
                start = timestamp;
            var timediff = timestamp - start;
            if (repeatCount > 0) {
                node.element.style.transition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
                node.element.style.textIndent = '-' + length + 'px';
                if (timediff >= delay + duration + afterDelay) {
                    repeatCount--;
                    node.element.style.transition = 'none';
                    node.element.style.textIndent = '0';
                    start = timestamp;
                    window.requestAnimationFrame(flowAnitate);
                }
                else {
                    window.requestAnimationFrame(flowAnitate);
                }
            }
            else {
                node.element.style.textOverflow = 'ellipsis';
                node.eventOn = false;
            }
        };
        window.requestAnimationFrame(flowAnitate);
    };
    AdvancedEllipsis.prototype.tooltipListener = function (node) {
        var _a;
        var _this = this;
        var floatElement = document.createElement("div");
        floatElement.id = this.options.tooltipElementId;
        (_a = floatElement.classList).add.apply(_a, this.options.tooltipElementClass.split(' '));
        var listener = function (event) {
            if (!node.eventOn) {
                floatElement.innerText = node.element.innerText;
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyle(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyle);
                document.body.appendChild(floatElement);
                node.eventOn = true;
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
            else {
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyle(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyle);
                clearTimeout(node.timer);
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
        };
        return listener;
    };
    AdvancedEllipsis.prototype.titleText = function (node) {
        node.element.title = node.element.innerText;
    };
    return AdvancedEllipsis;
}());
export default AdvancedEllipsis;
