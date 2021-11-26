var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options) {
        this.isStart = false;
        this.nodes = [];
        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation && mutation.attributeName == 'style') {
                    return;
                }
                console.log(mutation);
            });
        });
        this.defalutTooltipStyles = function (event) {
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
        var thisClass = this;
        var hidden = {};
        Object.defineProperty(this, 'selector', {
            get: function () {
                return hidden['selector'];
            },
            set: function (value) {
                var elements = document.querySelectorAll(value);
                if (!elements.length)
                    return;
                elements.forEach(function (element) {
                    var node = {
                        element: element,
                        eventOn: false,
                        timer: null,
                        listener: null,
                        originalElement: element.cloneNode(true)
                    };
                    thisClass.nodes.push(node);
                });
                hidden['selector'] = value;
            }
        });
        Object.defineProperty(this, 'options', {
            get: function () {
                return thisClass.objectOverwrite({}, hidden['options'], true);
            },
            set: function (value) {
                console.log(value);
                if (hidden['options'])
                    thisClass.objectOverwrite(hidden['options'], value);
                else
                    hidden['options'] = value;
            }
        });
        this.selector = '[data-ellipsis]';
        this.options = {
            mutationObserver: true,
            defalutStyles: true,
            useCloneNode: false,
            showOption: 'static',
            flowDelay: 1000,
            flowAfterDelay: 1000,
            flowSpeed: 50,
            flowPadding: 20,
            flowCount: 1,
            flowAutoCount: Infinity,
            tooltipElementClass: 'ellipsis_tooltip_box',
            tooltipDuration: 2000,
            customTooltipStyles: {},
        };
        if (typeof options === 'string') {
            this.setElements(options);
        }
        else {
            this.setOptions(options || {});
        }
    }
    AdvancedEllipsis.prototype.objectOverwrite = function (obj1, obj2, propertyOverwrite) {
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
            return;
        Object.keys(obj2).forEach(function (key) {
            if (propertyOverwrite || obj1.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        });
        return obj1;
    };
    AdvancedEllipsis.prototype.start = function () {
        if (this.nodes.length) {
            this.nodes.forEach(this.setSetting.bind(this));
            this.isStart = true;
        }
        return this.isStart;
    };
    AdvancedEllipsis.prototype.destroy = function () {
        if (this.nodes.length) {
            this.nodes.forEach(this.removeSetting.bind(this));
            this.nodes = [];
            this.isStart = false;
        }
        return this.isStart;
    };
    AdvancedEllipsis.prototype.setElements = function (selector) {
        if (!selector)
            return;
        this.destroy();
        this.selector = selector;
        return this;
    };
    AdvancedEllipsis.prototype.getElements = function () {
        return this.nodes.map(function (node) { return node.element; });
    };
    AdvancedEllipsis.prototype.setOptions = function (options) {
        this.options = options;
        // this.objectOverwrite(this.options, options);
        return this;
    };
    AdvancedEllipsis.prototype.setSetting = function (node) {
        if (node.listener)
            return;
        var styles = node.element.style;
        var data = node.element.dataset;
        if (this.options.defalutStyles) {
            styles.textOverflow = 'ellipsis';
            styles.overflow = 'hidden';
            styles.whiteSpace = 'nowrap';
        }
        var showOption = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static');
        var lengthDiff = this.checkEllipsis(node.element, this.options.useCloneNode);
        if (lengthDiff) {
            if (this.options.mutationObserver) {
                this.observer.observe(node.element, { childList: true, attributes: true });
            }
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
        node.element.parentNode.insertBefore(node.originalElement, node.element);
        node.element.parentNode.removeChild(node.element);
    };
    AdvancedEllipsis.prototype.checkEllipsis = function (element, useCloneNode) {
        if (useCloneNode) {
            var contrast = element.cloneNode(true);
            contrast.style.display = 'inline';
            contrast.style.width = 'auto';
            contrast.style.visibility = 'hidden';
            element.parentNode.appendChild(contrast);
            var res = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
            element.parentNode.removeChild(contrast);
            return res;
        }
        return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
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
            if (!node.eventOn) {
                node.element.style.transition = 'none';
                node.element.style.textIndent = '0';
                return;
            }
            if (!start)
                start = timestamp;
            var timediff = timestamp - start;
            if (repeatCount > 0) {
                var newTransition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
                if (newTransition !== node.element.style.transition) {
                    node.element.style.transition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
                    node.element.style.textIndent = '-' + length + 'px';
                }
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
    // event listener
    AdvancedEllipsis.prototype.flowListener = function (node, length) {
        var _this = this;
        var count = parseFloat(node.element.dataset.ellipsisFlowCount);
        return function () {
            if (!node.eventOn) {
                _this.flowAnitate(node, length, count);
            }
        };
    };
    AdvancedEllipsis.prototype.tooltipListener = function (node) {
        var _a;
        var _this = this;
        var floatElement = document.createElement("div");
        floatElement.id = node.element.dataset.tooltipElementId;
        var newClass = node.element.dataset.tooltipElementClass || this.options.tooltipElementClass;
        if (newClass) {
            (_a = floatElement.classList).add.apply(_a, newClass.split(' '));
        }
        return function (event) {
            if (!node.eventOn) {
                floatElement.innerText = node.element.innerText;
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyles(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyles);
                document.body.appendChild(floatElement);
                node.eventOn = true;
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
            else {
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyles(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyles);
                clearTimeout(node.timer);
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
        };
    };
    return AdvancedEllipsis;
}());
export default AdvancedEllipsis;
