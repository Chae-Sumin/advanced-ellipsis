var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options, selector) {
        this.isStart = false;
        this.elements = (function () {
            var objectOverwrite = this.objectOverwrite;
            var elements = [];
            return {
                get: function () {
                    return objectOverwrite([], elements, true);
                },
                add: function (item) {
                    return elements.push(item);
                },
                reset: function () {
                    elements = [];
                }
            };
        }.bind(this))();
        this.observer = new MutationObserver(function (mutations) {
            var _this = this;
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'style')
                    return;
                if (mutation.target.childNodes.length === 1 && mutation.target.childNodes[0].nodeType === 3) {
                    _this.addSetting(mutation.target);
                }
            });
        }.bind(this));
        var hidden = {};
        Object.defineProperty(this, 'selector', {
            get: function () {
                return hidden['selector'];
            },
            set: function (value) {
                var _this = this;
                var elements = document.querySelectorAll(value);
                if (!elements.length)
                    return;
                elements.forEach(function (element) {
                    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                        var ellipsisOption = {
                            originalElement: element.cloneNode(true),
                            showOption: '',
                            eventOn: false,
                            timer: null,
                            listener: null,
                        };
                        element['options'] = ellipsisOption;
                        _this.elements.add(element);
                    }
                });
                hidden['selector'] = value;
            }
        });
        Object.defineProperty(this, 'options', {
            get: function () {
                return this.objectOverwrite({}, hidden['options'], true);
            },
            set: function (value) {
                var before = JSON.stringify(hidden['options']);
                if (hidden['options'])
                    this.objectOverwrite(hidden['options'], value);
                else
                    hidden['options'] = value;
                if (before !== JSON.stringify(hidden['options'])) {
                    this.restart();
                }
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
            flowAutoPre: 0,
            tooltipElementClass: 'ellipsis_tooltip_box',
            tooltipDuration: 2000,
            customTooltipStyles: {},
        };
        if (typeof selector === 'string') {
            this.setElements(selector);
        }
        else if (typeof options === 'string') {
            this.setElements(options);
        }
        else if (typeof options === 'object') {
            this.setOptions(options);
        }
    }
    // public methods
    AdvancedEllipsis.prototype.start = function () {
        var elements = this.elements.get();
        if (elements.length) {
            elements.forEach(this.addSetting.bind(this));
            this.isStart = true;
        }
        return this;
    };
    AdvancedEllipsis.prototype.destroy = function () {
        var elements = this.elements.get();
        if (elements.length) {
            elements.forEach(this.removeSetting.bind(this));
            this.elements.reset();
            this.isStart = false;
        }
        return this;
    };
    AdvancedEllipsis.prototype.restart = function () {
        var elements = this.elements.get();
        if (this.isStart && elements.length) {
            elements.forEach(this.removeSetting.bind(this));
            elements.forEach(this.addSetting.bind(this));
        }
        return this;
    };
    AdvancedEllipsis.prototype.setElements = function (selector) {
        if (!selector)
            return;
        this.destroy();
        this.selector = selector;
        return this;
    };
    AdvancedEllipsis.prototype.setOptions = function (options) {
        this.options = options;
        return this;
    };
    // private methods
    AdvancedEllipsis.prototype.defalutTooltipStyles = function (event) {
        var X = event.type === "touchend" ? event.changedTouches[0].pageX : event.pageX;
        var Y = event.type === "touchend" ? event.changedTouches[0].pageY : event.pageY;
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
            position: 'absolute',
            fontSize: '12px',
            left: isLeft ? Math.floor(X + boxGap) + 'px' : 'unset',
            right: !isLeft ? Math.floor(window.innerWidth - X - boxGap) + 'px' : 'unset',
            top: isTop ? Math.floor(Y + boxGap) + 'px' : 'unset',
            bottom: !isTop ? Math.floor(window.innerHeight - Y + boxGap) + 'px' : 'unset',
        };
    };
    AdvancedEllipsis.prototype.objectOverwrite = function (obj1, obj2, propertyOverwrite) {
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
            return;
        Object.keys(obj2).forEach(function (key) {
            if (propertyOverwrite || Object.prototype.hasOwnProperty.call(obj1, key)) {
                obj1[key] = obj2[key];
            }
        });
        return obj1;
    };
    AdvancedEllipsis.prototype.addSetting = function (element) {
        var option = element['options'];
        if (option.showOption)
            this.removeSetting(element);
        if (this.options.defalutStyles) {
            this.objectOverwrite(element.style, {
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
            });
        }
        if (this.options.mutationObserver) {
            this.observer.observe(element, { childList: true, attributes: true });
        }
        option.showOption = Object.prototype.hasOwnProperty.call(element.dataset, 'ellipsisShowOption') ? element.dataset.ellipsisShowOption : (this.options.showOption || 'static');
        var lengthDiff = this.checkEllipsis(element, this.options.useCloneNode);
        if (lengthDiff) {
            var count = 0;
            var listener = null;
            switch (option.showOption) {
                case 'flow':
                    listener = this.flowListener(element, lengthDiff);
                    option.listener = listener;
                    element.addEventListener('mouseover', option.listener);
                    if ((count = this.options.flowAutoPre || parseFloat(element.dataset.flowAutoPre))) {
                        this.flowAnitate(element, lengthDiff, count);
                    }
                    break;
                case 'flow-auto':
                    count = parseFloat(element.dataset.ellipsisFlowCount) || this.options.flowAutoCount || Infinity;
                    this.flowAnitate(element, lengthDiff, count);
                    break;
                case 'tooltip':
                    listener = this.tooltipListener(element);
                    option.listener = listener;
                    element.addEventListener('mouseover', option.listener);
                    element.addEventListener('touchend', option.listener);
                    break;
                default:
                    break;
            }
        }
    };
    AdvancedEllipsis.prototype.removeSetting = function (element) {
        var option = element['options'];
        this.observer.disconnect();
        switch (option.showOption) {
            case 'flow':
                element.removeEventListener('mouseover', option.listener);
                break;
            case 'flow-auto':
                break;
            case 'tooltip':
                element.removeEventListener('mouseover', option.listener);
                element.removeEventListener('touchend', option.listener);
                break;
            default:
                break;
        }
        this.objectOverwrite(option, {
            showOption: '',
            eventOn: false,
            timer: null,
            listener: null,
        });
        this.objectOverwrite(element.style, option.originalElement.style);
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
    AdvancedEllipsis.prototype.flowAnitate = function (element, length, repeatCount) {
        var option = element['options'];
        length = length + this.options.flowPadding;
        var start = null;
        var duration = length / this.options.flowSpeed * 1000;
        var delay = this.options.flowDelay;
        var afterDelay = this.options.flowAfterDelay;
        element.style.textOverflow = 'clip';
        option.eventOn = true;
        var flowAnitate = function (timestamp) {
            if (!option.eventOn) {
                element.style.transition = 'none';
                element.style.textIndent = '0';
                return;
            }
            if (!start)
                start = timestamp;
            var timediff = timestamp - start;
            if (repeatCount > 0) {
                var newTransition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
                if (newTransition !== element.style.transition) {
                    element.style.transition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
                    element.style.textIndent = '-' + length + 'px';
                }
                if (timediff >= delay + duration + afterDelay) {
                    repeatCount--;
                    element.style.transition = 'none';
                    element.style.textIndent = '0';
                    start = timestamp;
                    window.requestAnimationFrame(flowAnitate);
                }
                else {
                    window.requestAnimationFrame(flowAnitate);
                }
            }
            else {
                element.style.textOverflow = 'ellipsis';
                option.eventOn = false;
            }
        };
        window.requestAnimationFrame(flowAnitate);
    };
    // event listener
    AdvancedEllipsis.prototype.flowListener = function (element, length) {
        var _this = this;
        var option = element['options'];
        var count = element.dataset.ellipsisFlowCount ? parseFloat(element.dataset.ellipsisFlowCount) : this.options.flowCount;
        return function () {
            if (!option.eventOn) {
                _this.flowAnitate(element, length, count);
            }
        };
    };
    AdvancedEllipsis.prototype.tooltipListener = function (element) {
        var _a;
        var _this = this;
        var option = element['options'];
        var floatElement = document.createElement("div");
        if (element.dataset.tooltipElementId) {
            floatElement.id = element.dataset.tooltipElementId;
        }
        var tooltipClass = element.dataset.tooltipElementClass || this.options.tooltipElementClass;
        if (tooltipClass) {
            (_a = floatElement.classList).add.apply(_a, tooltipClass.split(' '));
        }
        return function (event) {
            if (!option.eventOn) {
                floatElement.innerText = element.innerText;
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyles(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyles);
                document.body.appendChild(floatElement);
                option.eventOn = true;
                option.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(option.timer);
                    option.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
            else {
                _this.objectOverwrite(floatElement.style, _this.defalutTooltipStyles(event));
                _this.objectOverwrite(floatElement.style, _this.options.customTooltipStyles);
                clearTimeout(option.timer);
                option.timer = setTimeout(function () {
                    document.body.removeChild(floatElement);
                    clearTimeout(option.timer);
                    option.eventOn = false;
                }.bind(_this), _this.options.tooltipDuration);
            }
        };
    };
    return AdvancedEllipsis;
}());
export default AdvancedEllipsis;
