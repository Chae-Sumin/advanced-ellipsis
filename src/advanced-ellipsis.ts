interface classOptions extends Object {
	defalutStyles?: boolean;
	useDataAttribute?: boolean;
	useVirtualNode?: boolean;
	ellipsisOption?: string;
	showOption?: string;
	elements?: NodeListOf<HTMLElement> | string;
	selector?: string;

	animationDelay?: number, // ms
	animationAfterDelay?: number, // ms
	animationSpeed?: number, // px / s
	flowPadding?: number, // px
}
interface ellipsisNode extends Object {
	element: HTMLElement; // HTML 요소
	eventOn: Boolean; //
	timer: ReturnType<typeof setTimeout>;
}
class AdvancedEllipsis {
	private nodes: Array<ellipsisNode> = [];
	private options: classOptions = {
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
	constructor(options: classOptions | string) {
		if (typeof options === 'string') {
			this.setElements(options);
		}
		this.setOptions(<classOptions>options);
	}
	start(): void {
		if (this.nodes.length) {
			this.nodes.forEach(this.addEvent.bind(this));
		}
	}
	setElements(selector: string, reset?: boolean): void { // 요소를 설정
		const elements = document.querySelectorAll(selector);
		if (reset) this.nodes = [];
		const nodes = this.nodes;
		elements.forEach((element: HTMLElement) => {
			const node: ellipsisNode = {
				element: element,
				eventOn: false,
				timer: null,
			}
			nodes.push(node);
		});
		this.start();
	}
	setOptions(options: classOptions): void { // 옵션을 설정
		if (typeof options !== 'object') return;
		Object.keys(options).forEach(function (key: string) {
			if (this.options.hasOwnProperty(key)) {
				this.options[key] = options[key];
			}
		}.bind(this));
		if (options.selector && typeof options.selector === 'string') {
			this.setElements(options.selector, true);
		} else if (this.nodes.length === 0) {
			this.setElements('[data-ellipsis]');
		}
	}
	addEvent(node: ellipsisNode, index: number): void {
		const element = node.element;
		const styles: CSSStyleDeclaration = element.style;
		const data: DOMStringMap = element.dataset;
		if (this.options.defalutStyles) {
			styles.textOverflow = 'ellipsis';
			styles.overflow = 'hidden';
			styles.whiteSpace = 'nowrap';
		}
		const showOption: string = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static')
		const lengthDiff: number = this.options.useVirtualNode ? this.checkEllipsisVirtualNode(element) : this.checkEllipsis(element);
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
	}
	checkEllipsis(element: HTMLElement): number {
		return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
	}
	checkEllipsisVirtualNode(element: HTMLElement): number {
		const contrast: HTMLElement = <HTMLElement>element.cloneNode(true);
		contrast.style.display = 'inline';
		contrast.style.width = 'auto';
		contrast.style.visibility = 'hidden';
		element.parentNode.appendChild(contrast)
		const res: number = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
		element.parentNode.removeChild(contrast);
		return res;
	}
	flowText(node: ellipsisNode, length: number, options: classOptions) {
		const element = node.element;
		length = (length + options.flowPadding);
		const flowFunc: EventListener = () => {
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
		}
		element.addEventListener('mouseover', flowFunc);
	}
	titleText(node: ellipsisNode, length: number, options: classOptions) {
		const element = node.element;
		console.log(node);
		if (length) {
			element.title = element.innerText;
		}
	}
}
