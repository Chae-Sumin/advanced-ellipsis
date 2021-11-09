var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options) {
        this.nodes = [];
        this.options = {
            defalutStyles: true,
            useDataAttribute: true,
            useVirtualNode: false,
            ellipsisOption: 'ellipsis',
            showOption: 'static',
            animationDelay: 500,
            animationAfterDelay: 1000,
            flowSpeed: 40,
            flowPadding: 20,
            floatDuration: 1000,
            customFloatStyle: {},
        };
        this.defalutFloatStyle = function (event) {
            console.log(event);
            var X = event.type === "touchend" ? event.changedTouches[0].clientX : event.clientX;
            var Y = event.type === "touchend" ? event.changedTouches[0].clientY : event.clientY;
            var isLeft = X < window.innerWidth / 2;
            var isTop = Y < window.innerHeight / 2;
            var boxGap = 20;
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
        this.setOptions(options);
    }
    AdvancedEllipsis.prototype.objectOverwrite = function (obj1, obj2) {
        if (typeof obj1 !== 'object' && typeof obj2 !== 'object')
            return;
        Object.keys(obj2).forEach(function (key) {
            if (obj1.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        });
    };
    AdvancedEllipsis.prototype.start = function () {
        if (this.nodes.length) {
            this.nodes.forEach(this.addEvent.bind(this));
        }
    };
    AdvancedEllipsis.prototype.setElements = function (selector, reset) {
        var elements = document.querySelectorAll(selector);
        if (reset) {
            this.nodes.forEach(this.removeEvent.bind(this));
            this.nodes = [];
        }
        ;
        var nodes = this.nodes;
        elements.forEach(function (element) {
            var node = {
                element: element,
                eventOn: false,
                timer: null,
                listener: null,
            };
            nodes.push(node);
        });
    };
    AdvancedEllipsis.prototype.setOptions = function (options) {
        this.objectOverwrite(this.options, options);
        if (options.selector && typeof options.selector === 'string') {
            this.setElements(options.selector, true);
        }
        else if (this.nodes.length === 0) {
            this.setElements('[data-ellipsis]');
        }
    };
    AdvancedEllipsis.prototype.addEvent = function (node) {
        var element = node.element;
        var styles = element.style;
        var data = element.dataset;
        if (this.options.defalutStyles) {
            styles.textOverflow = this.options.ellipsisOption;
            styles.overflow = 'hidden';
            styles.whiteSpace = 'nowrap';
        }
        var showOption = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static');
        var lengthDiff = this.options.useVirtualNode ? this.checkEllipsisVirtualNode(element) : this.checkEllipsis(element);
        if (lengthDiff) {
            element.dispatchEvent(new CustomEvent("ellipsis", {
                bubbles: true,
                detail: {
                    ellipsised: Boolean(lengthDiff),
                    lengthDiff: lengthDiff,
                    showOption: showOption,
                }
            }));
            if (node.listener)
                return;
            switch (showOption) {
                case 'flow':
                    var flow_listener = this.flowFunc(node, lengthDiff);
                    node.listener = flow_listener;
                    element.addEventListener('mouseover', node.listener);
                    break;
                case 'flow-auto':
                    var count = parseFloat(node.element.dataset.ellipsisFlowCount) || Infinity;
                    this.flowAnitate(node, lengthDiff, count);
                    break;
                case 'title':
                    this.titleText(node);
                    break;
                case 'float':
                    var float_listener = this.floatFunc(node);
                    node.listener = float_listener;
                    element.addEventListener('mouseover', node.listener);
                    element.addEventListener('touchend', node.listener);
                    break;
                default:
                    break;
            }
        }
    };
    AdvancedEllipsis.prototype.removeEvent = function (node) {
        var data = node.element.dataset;
        var showOption = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static');
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
            case 'float':
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
    AdvancedEllipsis.prototype.checkEllipsisVirtualNode = function (element) {
        var contrast = element.cloneNode(true);
        contrast.style.display = 'inline';
        contrast.style.width = 'auto';
        contrast.style.visibility = 'hidden';
        element.parentNode.appendChild(contrast);
        var res = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
        element.parentNode.removeChild(contrast);
        return res;
    };
    AdvancedEllipsis.prototype.flowFunc = function (node, length) {
        var _this = this;
        var count = parseFloat(node.element.dataset.ellipsisFlowCount);
        var flowFunc = function () {
            if (!node.eventOn) {
                _this.flowAnitate(node, length, count);
            }
        };
        return flowFunc;
    };
    AdvancedEllipsis.prototype.flowAnitate = function (node, length, repeat) {
        var _this = this;
        length = length + this.options.flowPadding;
        var start = null;
        var duration = length / this.options.flowSpeed * 1000;
        var delay = this.options.animationDelay;
        var afterDelay = this.options.animationAfterDelay;
        node.element.style.textOverflow = 'clip';
        node.eventOn = true;
        var flowAnitate = function (timestamp) {
            if (!node.eventOn)
                return;
            if (!start)
                start = timestamp;
            var timediff = timestamp - start;
            node.element.style.transition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
            node.element.style.textIndent = '-' + length + 'px';
            if (timediff >= delay + duration + afterDelay) {
                repeat--;
                node.element.style.transition = 'none';
                node.element.style.textIndent = '0';
                start = timestamp;
                console.log(repeat);
                if (repeat > 0) {
                    window.requestAnimationFrame(flowAnitate);
                }
                else {
                    node.element.style.textOverflow = _this.options.ellipsisOption;
                    node.eventOn = false;
                }
            }
            else {
                window.requestAnimationFrame(flowAnitate);
            }
        };
        window.requestAnimationFrame(flowAnitate);
    };
    AdvancedEllipsis.prototype.floatFunc = function (node) {
        var _this = this;
        var floatElement = document.createElement("div");
        var floatFunc = function (event) {
            if (!node.eventOn) {
                floatElement.innerText = node.element.innerText;
                _this.objectOverwrite(floatElement.style, _this.defalutFloatStyle(event));
                _this.objectOverwrite(floatElement.style, _this.options.customFloatStyle);
                document.body.appendChild(floatElement);
                node.eventOn = true;
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.floatDuration + _this.options.animationDelay + _this.options.animationAfterDelay);
            }
            else {
                _this.objectOverwrite(floatElement.style, _this.defalutFloatStyle(event));
                _this.objectOverwrite(floatElement.style, _this.options.customFloatStyle);
                clearTimeout(node.timer);
                node.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(node.timer);
                    node.eventOn = false;
                }.bind(_this), _this.options.floatDuration + _this.options.animationDelay + _this.options.animationAfterDelay);
            }
        };
        return floatFunc;
    };
    AdvancedEllipsis.prototype.titleText = function (node) {
        node.element.title = node.element.innerText;
    };
    return AdvancedEllipsis;
}());
