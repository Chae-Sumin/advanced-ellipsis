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
	flowSpeed?: number, // px / s
	flowPadding?: number, // px
	floatDuration?: number, // ms
	customFloatStyle?: object,
}
interface ellipsisNode extends Object {
	element: HTMLElement; // HTML 요소
	eventOn: Boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
}
class AdvancedEllipsis {
	private nodes: Array<ellipsisNode> = [];
	private options: classOptions = {
		defalutStyles: true,
		useDataAttribute: true,
		useVirtualNode: false,
		ellipsisOption: 'ellipsis',
		showOption: 'static',

		animationDelay: 500, // 애니메이션 시작 전 시간
		animationAfterDelay: 1000, // 애니메이션 끝나고 초기화 대기 시간
		flowSpeed: 40, // 애미메이션 스피드
		flowPadding: 20, // flow를 얼마나 더 끌고 갈지
		floatDuration: 1000,
		customFloatStyle: {},
	};
	private defalutFloatStyle: Function = (event: MouseEvent | TouchEvent): object => {
		console.log(event);
		const X = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientX : (<MouseEvent>event).clientX;
		const Y = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientY : (<MouseEvent>event).clientY;
		const isLeft: Boolean = X < window.innerWidth / 2;
		const isTop: Boolean = Y < window.innerHeight / 2;
		const boxGap = 20;
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
		}
	}
	private objectOverwrite(obj1: object, obj2: object) {
		if (typeof obj1 !== 'object' && typeof obj2 !== 'object') return;
		Object.keys(obj2).forEach(function (key: string) {
			if (obj1.hasOwnProperty(key)) {
				obj1[key] = obj2[key];
			}
		});
	}
	constructor(options: classOptions | string) {
		if (typeof options === 'string') {
			this.setElements(options);
		}
		this.setOptions(<classOptions>options);
	}
	start(): void { // 노드들의 옵션에 따라 노드 이벤트 등록
		if (this.nodes.length) {
			this.nodes.forEach(this.addEvent.bind(this));
		}
	}
	setElements(selector: string, reset?: boolean): void { // 요소를 설정
		const elements = document.querySelectorAll(selector);
		if (reset) {
			this.nodes.forEach(this.removeEvent.bind(this));
			this.nodes = [];
		};
		const nodes = this.nodes;
		elements.forEach((element: HTMLElement) => {
			const node: ellipsisNode = {
				element: element,
				eventOn: false,
				timer: null,
				listener: null,
			}
			nodes.push(node);
		});
	}
	setOptions(options: classOptions): void { // 옵션을 설정
		this.objectOverwrite(this.options, options);
		if (options.selector && typeof options.selector === 'string') {
			this.setElements(options.selector, true);
		} else if (this.nodes.length === 0) {
			this.setElements('[data-ellipsis]');
		}
	}
	addEvent(node: ellipsisNode): void {
		const element = node.element;
		const styles: CSSStyleDeclaration = element.style;
		const data: DOMStringMap = element.dataset;
		if (this.options.defalutStyles) {
			styles.textOverflow = this.options.ellipsisOption;
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
			if (node.listener) return;
			switch (showOption) {
				case 'flow':
					const flow_listener = this.flowFunc(node, lengthDiff);
					node.listener = flow_listener;
					element.addEventListener('mouseover', node.listener);
					break;
				case 'flow-auto':
					const count = parseFloat(node.element.dataset.ellipsisFlowCount) || Infinity;
					this.flowAnitate(node, lengthDiff, count);
					break;
				case 'title':
					this.titleText(node);
					break;
				case 'float':
					const float_listener = this.floatFunc(node);
					node.listener = float_listener;
					element.addEventListener('mouseover', node.listener);
					element.addEventListener('touchend', node.listener);
					break;

				default:
					break;
			}
		}
	}
	removeEvent(node: ellipsisNode): void {
		const data: DOMStringMap = node.element.dataset;
		const showOption: string = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static')
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
	flowFunc(node: ellipsisNode, length: number):EventListener {
		const count = parseFloat(node.element.dataset.ellipsisFlowCount);
		const flowFunc: EventListener = () => {
			if (!node.eventOn) {
				this.flowAnitate(node, length, count);
			}
		}
		return flowFunc;
	}
	flowAnitate(node: ellipsisNode, length: number, repeat?: number): void {
		length = length + this.options.flowPadding;
		let start: number = null;
		const duration: number = length / this.options.flowSpeed * 1000;
		const delay: number = this.options.animationDelay;
		const afterDelay: number = this.options.animationAfterDelay;
		node.element.style.textOverflow = 'clip';
		node.eventOn = true;
		const flowAnitate = (timestamp) => {
			if (!node.eventOn) return;
			if (!start) start = timestamp;
			const timediff: number = timestamp - start;
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
				} else {
					node.element.style.textOverflow = this.options.ellipsisOption;
					node.eventOn = false;
				}
			} else {
				window.requestAnimationFrame(flowAnitate);
			}
		}
		window.requestAnimationFrame(flowAnitate);
	}
	floatFunc(node: ellipsisNode): EventListener {
		const floatElement: HTMLElement = document.createElement("div");
		const floatFunc: EventListener = (event: MouseEvent) => {
			if (!node.eventOn) {
				floatElement.innerText = node.element.innerText;
				this.objectOverwrite(floatElement.style, this.defalutFloatStyle(event));
				this.objectOverwrite(floatElement.style, this.options.customFloatStyle);
				document.body.appendChild(floatElement);
				node.eventOn = true;
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.floatDuration + this.options.animationDelay + this.options.animationAfterDelay);
			} else {
				this.objectOverwrite(floatElement.style, this.defalutFloatStyle(event));
				this.objectOverwrite(floatElement.style, this.options.customFloatStyle);
				clearTimeout(node.timer);
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.floatDuration + this.options.animationDelay + this.options.animationAfterDelay);
			}
		}
		return floatFunc;
	}
	titleText(node: ellipsisNode) {
		node.element.title = node.element.innerText;
	}
}
