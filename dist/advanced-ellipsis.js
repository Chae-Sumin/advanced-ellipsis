var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options, selector) {
        var _this = this;
        // private value
        var _observer = new MutationObserver(function (mutations) {
            var _this = this;
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'style')
                    return;
                console.log(mutation);
                if (mutation.target.childNodes.length === 1 && mutation.target.childNodes[0].nodeType === 3) {
                    _this.addSetting(mutation.target);
                }
            });
        }.bind(this));
        var _options = {
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
            flowCountPre: 0,
            tooltipElementClass: 'ellipsis_tooltip_box',
            tooltipDuration: 2000,
            customTooltipStyles: {},
        };
        var _elements = [];
        var _selector = '';
        var _isStart = false;
        // private methods
        var objectOverwrite = function (obj1, obj2, propertyOverwrite) {
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
                return;
            Object.keys(obj2).forEach(function (key) {
                if (propertyOverwrite || Object.prototype.hasOwnProperty.call(obj1, key)) {
                    obj1[key] = obj2[key];
                }
            });
            return obj1;
        };
        var defalutTooltipStyles = function (event) {
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
        var checkEllipsis = function (element, useCloneNode) {
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
        var flowAnitate = function (element, length, repeatCount) {
            var e_option = element['ellipsisOption'];
            var this_options = _this.getOptions();
            length = length + this_options.flowPadding;
            var start = null;
            var duration = length / this_options.flowSpeed * 1000;
            var delay = this_options.flowDelay;
            var afterDelay = this_options.flowAfterDelay;
            element.style.textOverflow = 'clip';
            e_option.eventOn = true;
            var flowAnitate = function (timestamp) {
                if (!e_option.eventOn) {
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
                    e_option.eventOn = false;
                }
            };
            window.requestAnimationFrame(flowAnitate);
        };
        // event listener
        var flowListener = function (element, length) {
            var e_option = element['ellipsisOption'];
            var count = element.dataset.ellipsisFlowCount ? parseFloat(element.dataset.ellipsisFlowCount) : _this.getOption('flowCount');
            return function () {
                if (!e_option.eventOn) {
                    flowAnitate(element, length, count);
                }
            };
        };
        var tooltipListener = function (element) {
            var _a;
            var e_option = element['ellipsisOption'];
            var this_options = _this.getOptions();
            var floatElement = document.createElement("div");
            if (element.dataset.tooltipElementId) {
                floatElement.id = element.dataset.tooltipElementId;
            }
            var tooltipClass = element.dataset.tooltipElementClass || this_options.tooltipElementClass;
            if (tooltipClass) {
                (_a = floatElement.classList).add.apply(_a, tooltipClass.split(' '));
            }
            return function (event) {
                if (!e_option.eventOn) {
                    floatElement.innerText = element.innerText;
                    objectOverwrite(floatElement.style, defalutTooltipStyles(event));
                    objectOverwrite(floatElement.style, this_options.customTooltipStyles);
                    document.body.appendChild(floatElement);
                    e_option.eventOn = true;
                    e_option.timer = setTimeout(function () {
                        document.body.removeChild(floatElement);
                        clearTimeout(e_option.timer);
                        e_option.eventOn = false;
                    }.bind(_this), this_options.tooltipDuration);
                }
                else {
                    objectOverwrite(floatElement.style, defalutTooltipStyles(event));
                    objectOverwrite(floatElement.style, this_options.customTooltipStyles);
                    clearTimeout(e_option.timer);
                    e_option.timer = setTimeout(function () {
                        document.body.removeChild(floatElement);
                        clearTimeout(e_option.timer);
                        e_option.eventOn = false;
                    }.bind(_this), this_options.tooltipDuration);
                }
            };
        };
        // element status handler
        var addSetting = function (element) {
            var e_option = element['ellipsisOption'];
            var this_options = _this.getOptions();
            if (e_option.showOption)
                removeSetting(element);
            if (this_options.defalutStyles) {
                objectOverwrite(element.style, {
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                });
            }
            if (this_options.mutationObserver)
                _observer.observe(element, { childList: true, attributes: true });
            e_option.showOption = Object.prototype.hasOwnProperty.call(element.dataset, 'ellipsisShowOption') ? element.dataset.ellipsisShowOption : (this_options.showOption || 'static');
            var lengthDiff = checkEllipsis(element, this_options.useCloneNode);
            if (lengthDiff) {
                var count = 0;
                switch (e_option.showOption) {
                    case 'flow':
                        e_option.listener = flowListener(element, lengthDiff);
                        element.addEventListener('mouseover', e_option.listener);
                        if ((count = this_options.flowCountPre || parseFloat(element.dataset.ellipsisFlowCountPre))) {
                            flowAnitate(element, lengthDiff, count);
                        }
                        break;
                    case 'flow-auto':
                        count = parseFloat(element.dataset.ellipsisFlowCount) || this_options.flowAutoCount || Infinity;
                        flowAnitate(element, lengthDiff, count);
                        break;
                    case 'tooltip':
                        e_option.listener = tooltipListener(element);
                        element.addEventListener('mouseover', e_option.listener);
                        element.addEventListener('touchend', e_option.listener);
                        break;
                    default:
                        break;
                }
            }
        };
        var removeSetting = function (element) {
            var e_option = element['ellipsisOption'];
            switch (e_option.showOption) {
                case 'flow':
                    element.removeEventListener('mouseover', e_option.listener);
                    break;
                case 'flow-auto':
                    break;
                case 'tooltip':
                    element.removeEventListener('mouseover', e_option.listener);
                    element.removeEventListener('touchend', e_option.listener);
                    break;
                default:
                    break;
            }
            objectOverwrite(e_option, {
                showOption: '',
                eventOn: false,
                timer: null,
                listener: null,
            });
            objectOverwrite(element.style, e_option.originalElement.style);
        };
        // public methods
        this.setElements = function (selector) {
            if (!selector)
                return;
            _this.destroy();
            var elements = document.querySelectorAll(selector);
            if (!elements.length)
                return;
            _elements.length = 0;
            elements.forEach(function (element) {
                if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                    var ellipsisOption = {
                        originalElement: element.cloneNode(true),
                        showOption: '',
                        eventOn: false,
                        timer: null,
                        listener: null,
                    };
                    element['ellipsisOption'] = ellipsisOption;
                    _elements.push(element);
                }
            });
            _selector = selector;
            return _this;
        };
        this.getElements = function () { return objectOverwrite([], _elements, true); };
        this.setOptions = function (options) {
            var before = JSON.stringify(_options);
            objectOverwrite(_options, options);
            if (before !== JSON.stringify(_options)) {
                _this.restart();
            }
            return _this;
        };
        this.getOptions = function () { return objectOverwrite({}, _options, true); };
        this.getOption = function (key) { return _options[key]; };
        // handler
        this.start = function () {
            var elements = _this.getElements();
            if (elements.length) {
                elements.forEach(addSetting.bind(_this));
                _isStart = true;
            }
            return _this;
        };
        this.destroy = function () {
            var elements = _this.getElements();
            if (elements.length) {
                _observer.disconnect();
                elements.forEach(removeSetting.bind(_this));
                _isStart = false;
            }
            return _this;
        };
        this.restart = function () {
            var elements = _this.getElements();
            if (_isStart && elements.length) {
                _observer.disconnect();
                elements.forEach(removeSetting.bind(_this));
                elements.forEach(addSetting.bind(_this));
            }
            return _this;
        };
        // init
        this.setElements('[data-ellipsis]');
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
    return AdvancedEllipsis;
}());
