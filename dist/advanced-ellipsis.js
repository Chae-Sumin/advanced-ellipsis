var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options, selector) {
        this.isStart = false;
        this.elements = [];
        this.observer = new MutationObserver(function (mutations) {
            var _this = this;
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'style')
                    return;
                if (mutation.target.childNodes.length === 1 && mutation.target.childNodes[0].nodeType === 3) {
                    _this.addSetting(mutation.target);
                    console.log(mutation);
                }
            });
        }.bind(this));
        // private methods
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
                        _this.elements.push(element);
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
                if (hidden['options'])
                    this.objectOverwrite(hidden['options'], value);
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
        if (this.elements.length) {
            this.elements.forEach(this.addSetting.bind(this));
            this.isStart = true;
        }
        return this.isStart;
    };
    AdvancedEllipsis.prototype.destroy = function () {
        if (this.elements.length) {
            this.elements.forEach(this.removeSetting.bind(this));
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
    // public getElements(): Array<HTMLElement> {
    // 	return this.elements.map((node: EllipsisNode) => node.element);
    // }
    AdvancedEllipsis.prototype.setOptions = function (options) {
        this.options = options;
        // this.objectOverwrite(this.options, options);
        return this;
    };
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
        console.log(element.dataset);
        option.showOption = element.dataset.hasOwnProperty('ellipsisShowOption') ? element.dataset.ellipsisShowOption : (this.options.showOption || 'static');
        var lengthDiff = this.checkEllipsis(element, this.options.useCloneNode);
        if (lengthDiff) {
            if (this.options.mutationObserver) {
                this.observer.observe(element, { childList: true, attributes: true });
            }
            switch (option.showOption) {
                case 'flow':
                    var flow_listener = this.flowListener(element, lengthDiff);
                    option.listener = flow_listener;
                    element.addEventListener('mouseover', option.listener);
                    break;
                case 'flow-auto':
                    var count = parseFloat(element.dataset.ellipsisFlowCount) || this.options.flowAutoCount || Infinity;
                    this.flowAnitate(element, lengthDiff, count);
                    break;
                case 'tooltip':
                    var tooltip_listener = this.tooltipListener(element);
                    option.listener = tooltip_listener;
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
        // remove listener
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
        floatElement.id = element.dataset.tooltipElementId;
        var newClass = element.dataset.tooltipElementClass || this.options.tooltipElementClass;
        if (newClass) {
            (_a = floatElement.classList).add.apply(_a, newClass.split(' '));
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
