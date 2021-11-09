var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(options) {
        this.nodes = [];
        this.options = {
            defalutStyles: true,
            useDataAttribute: true,
            useVirtualNode: false,
            ellipsisOption: 'static',
            showOption: 'static',
            // elements: document.querySelectorAll('[data-ellipsis]'),
            animationDelay: 0,
            animationAfterDelay: 1000,
            animationSpeed: 40,
            flowPadding: 20,
        };
        if (typeof options === 'string') {
            this.setElements(options);
        }
        this.setOptions(options);
    }
    AdvancedEllipsis.prototype.start = function () {
        if (this.nodes.length) {
            this.nodes.forEach(this.addEvent.bind(this));
        }
    };
    AdvancedEllipsis.prototype.setElements = function (selector, reset) {
        var elements = document.querySelectorAll(selector);
        if (reset)
            this.nodes = [];
        var nodes = this.nodes;
        elements.forEach(function (element) {
            var node = {
                element: element,
                eventOn: false,
                timer: null,
            };
            nodes.push(node);
        });
        this.start();
    };
    AdvancedEllipsis.prototype.setOptions = function (options) {
        if (typeof options !== 'object')
            return;
        Object.keys(options).forEach(function (key) {
            if (this.options.hasOwnProperty(key)) {
                this.options[key] = options[key];
            }
        }.bind(this));
        if (options.selector && typeof options.selector === 'string') {
            this.setElements(options.selector, true);
        }
        else if (this.nodes.length === 0) {
            this.setElements('[data-ellipsis]');
        }
    };
    AdvancedEllipsis.prototype.addEvent = function (node, index) {
        var element = node.element;
        var styles = element.style;
        var data = element.dataset;
        if (this.options.defalutStyles) {
            styles.textOverflow = 'ellipsis';
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
        }
        switch (showOption) {
            case 'flow':
                this.flowText(node, lengthDiff, this.options);
                break;
            case 'title':
                this.titleText(node, lengthDiff, this.options);
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
    AdvancedEllipsis.prototype.flowText = function (node, length, options) {
        var element = node.element;
        length = (length + options.flowPadding);
        var flowFunc = function () {
            if (!node.eventOn) {
                element.style.transition = 'text-indent ' + length / options.animationSpeed + 's ' + options.animationDelay + 'ms linear';
                element.style.textIndent = '-' + length + 'px';
                element.style.textOverflow = 'clip';
                node.eventOn = true;
                node.timer = setTimeout(function () {
                    element.style.transition = 'none';
                    element.style.textOverflow = 'ellipsis';
                    element.style.textIndent = '0';
                    element.dataset.animated = '';
                    node.eventOn = false;
                }, (length / options.animationSpeed * 1000) + options.animationDelay + options.animationAfterDelay);
            }
        };
        element.addEventListener('mouseover', flowFunc);
    };
    AdvancedEllipsis.prototype.titleText = function (node, length, options) {
        var element = node.element;
        console.log(node);
        if (length) {
            element.title = element.innerText;
        }
    };
    return AdvancedEllipsis;
}());
