interface classOptions extends Object {
	defalutStyles?: boolean;
	useDataAttribute?: boolean;
	useVirtualNode?: boolean;
	showOption?: string;
	selector?: string;
	flowDelay?: number, // ms
	flowAfterDelay?: number, // ms
	flowSpeed?: number, // px / s
	flowPadding?: number, // px
	flowCount?: number,
	flowAutoCount?: number,
	tooltipElementId?: string,
	tooltipElementClass?: string,
	tooltipDuration?: number, // ms

	customTooltipStyle?: object,
}
interface ellipsisNode extends Object {
	element: HTMLElement; // HTML 요소
	eventOn: Boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
	beforeDefalutStyles: beforeDefalutStyles;
}
interface beforeDefalutStyles extends Object {
	textOverflow: string;
	overflow: string;
	whiteSpace: string;
}
class AdvancedEllipsis {
	private isStart: boolean = false;
	private nodes: Array<ellipsisNode> = [];
	private options: classOptions = {
		defalutStyles: true,
		useDataAttribute: true,
		useVirtualNode: false,
		showOption: 'static',
		selector: '[data-ellipsis]',
		flowDelay: 1000, // 애니메이션 시작 전 시간
		flowAfterDelay: 1000, // 애니메이션 끝나고 초기화 대기 시간
		flowSpeed: 50, // 애미메이션 스피드
		flowPadding: 20, // flow를 얼마나 더 끌고 갈지
		flowCount: 1, // flow 기본 횟수
		flowAutoCount: Infinity, // flow-auto 기본 횟수
		tooltipElementId: 'float_box',
		tooltipElementClass: 'float_box',
		tooltipDuration: 2000,
		customTooltipStyle: {},
	};
	private defalutTooltipStyle: Function = (event: MouseEvent | TouchEvent): object => {
		const X = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientX : (<MouseEvent>event).clientX;
		const Y = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientY : (<MouseEvent>event).clientY;
		const isLeft: Boolean = X < window.innerWidth / 2;
		const isTop: Boolean = Y < window.innerHeight / 2;
		const boxGap = 10;
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
		if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return;
		Object.keys(obj2).forEach(function (key: string) {
			if (obj1.hasOwnProperty(key)) {
				obj1[key] = obj2[key];
			}
		});
	}
	constructor(options: classOptions | string) {
		if (typeof options === 'string') {
			this.setElements(options);
		} else {
			this.setOptions(<classOptions>options || {});
		}
	}
	start(): void { // 노드들의 옵션에 따라 노드 이벤트 등록
		if (this.nodes.length) {
			this.nodes.forEach(this.addSetting.bind(this));
			this.isStart = true;
		}
	}
	destory(): void {
		if (!this.isStart) return;
		if (this.nodes.length) {
			this.nodes.forEach(this.removeSetting.bind(this));
			this.nodes = [];
			this.isStart = false;
		}
	}
	setElements(selector: string): void { // 요소를 설정
		const elements = document.querySelectorAll(selector);
		if (this.isStart) {
			this.destory();
		}
		elements.forEach((element: HTMLElement) => {
			const node: ellipsisNode = {
				element: element,
				eventOn: false,
				timer: null,
				listener: null,
				beforeDefalutStyles: {
					textOverflow: element.style.textOverflow,
					overflow: element.style.overflow,
					whiteSpace: element.style.whiteSpace
				}
			}
			this.nodes.push(node);
		});
	}
	addElements(selector: string): void { // 요소를 추가
		const elements = document.querySelectorAll(selector);
		const nodes = this.nodes;
		elements.forEach((element: HTMLElement) => {
			if (nodes.some(node => element === node.element)) return; // 중복 제거
			const node: ellipsisNode = {
				element: element,
				eventOn: false,
				timer: null,
				listener: null,
				beforeDefalutStyles: {
					textOverflow: element.style.textOverflow,
					overflow: element.style.overflow,
					whiteSpace: element.style.whiteSpace
				}
			}
			nodes.push(node);
		});
	}
	setOptions(options: classOptions): void { // 옵션을 설정
		this.objectOverwrite(this.options, options);
		this.setElements(this.options.selector);
	}
	addSetting(node: ellipsisNode): void {
		const styles: CSSStyleDeclaration = node.element.style;
		const data: DOMStringMap = node.element.dataset;
		if (this.options.defalutStyles) {
			styles.textOverflow = 'ellipsis';
			styles.overflow = 'hidden';
			styles.whiteSpace = 'nowrap';
		}
		const showOption: string = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static')
		const lengthDiff: number = this.options.useVirtualNode ? this.checkEllipsisUseCloneNode(node.element) : this.checkEllipsis(node.element);
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
					const flow_listener = this.flowListener(node, lengthDiff);
					node.listener = flow_listener;
					node.element.addEventListener('mouseover', node.listener);
					break;
				case 'flow-auto':
					const count = parseFloat(node.element.dataset.ellipsisFlowCount) || this.options.flowAutoCount || Infinity;
					this.flowAnitate(node, lengthDiff, count);
					break;
				case 'title':
					this.titleText(node);
					break;
				case 'tooltip':
					const tooltip_listener = this.tooltipListener(node);
					node.listener = tooltip_listener;
					node.element.addEventListener('mouseover', node.listener);
					node.element.addEventListener('touchend', node.listener);
					break;
				default:
					break;
			}
		}
	}
	removeSetting(node: ellipsisNode): void {
		const styles: CSSStyleDeclaration = node.element.style;
		const data: DOMStringMap = node.element.dataset;
		const showOption: string = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static')
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
	}
	checkEllipsis(element: HTMLElement): number {
		return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
	}
	checkEllipsisUseCloneNode(element: HTMLElement): number {
		const contrast: HTMLElement = <HTMLElement>element.cloneNode(true);
		contrast.style.display = 'inline';
		contrast.style.width = 'auto';
		contrast.style.visibility = 'hidden';
		element.parentNode.appendChild(contrast)
		const res: number = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
		element.parentNode.removeChild(contrast);
		return res;
	}
	flowListener(node: ellipsisNode, length: number): EventListener {
		const count: number = parseFloat(node.element.dataset.ellipsisFlowCount);
		const listener: EventListener = () => {
			if (!node.eventOn) {
				this.flowAnitate(node, length, count);
			}
		}
		return listener;
	}
	flowAnitate(node: ellipsisNode, length: number, repeatCount?: number): void {
		length = length + this.options.flowPadding;
		let start: number = null;
		const duration: number = length / this.options.flowSpeed * 1000;
		const delay: number = this.options.flowDelay;
		const afterDelay: number = this.options.flowAfterDelay;
		node.element.style.textOverflow = 'clip';
		node.eventOn = true;
		const flowAnitate = (timestamp) => {
			if (!node.eventOn) return;
			if (!start) start = timestamp;
			const timediff: number = timestamp - start;
			if (repeatCount > 0) {
				node.element.style.transition = 'text-indent ' + duration + 'ms ' + delay + 'ms linear';
				node.element.style.textIndent = '-' + length + 'px';
				if (timediff >= delay + duration + afterDelay) {
					repeatCount--;
					node.element.style.transition = 'none';
					node.element.style.textIndent = '0';
					start = timestamp;
					window.requestAnimationFrame(flowAnitate);
				} else {
					window.requestAnimationFrame(flowAnitate);
				}
			} else {
				node.element.style.textOverflow = 'ellipsis';
				node.eventOn = false;
			}
		}
		window.requestAnimationFrame(flowAnitate);
	}
	tooltipListener(node: ellipsisNode): EventListener {
		const floatElement: HTMLElement = document.createElement("div");
		floatElement.id = this.options.tooltipElementId;
		floatElement.classList.add(...this.options.tooltipElementClass.split(' '));
		const listener: EventListener = (event: MouseEvent) => {
			if (!node.eventOn) {
				floatElement.innerText = node.element.innerText;
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyle(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyle);
				document.body.appendChild(floatElement);
				node.eventOn = true;
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			} else {
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyle(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyle);
				clearTimeout(node.timer);
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			}
		}
		return listener;
	}
	titleText(node: ellipsisNode): void {
		node.element.title = node.element.innerText;
	}
}
