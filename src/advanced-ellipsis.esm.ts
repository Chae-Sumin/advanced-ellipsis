interface classOptions extends Object { // 옵션 인터페이스
	mutationObserver ?: boolean
	defalutStyles?: boolean;
	useCloneNode?: boolean;
	showOption?: string;

	flowDelay?: number, // ms
	flowAfterDelay?: number, // ms
	flowSpeed?: number, // px / s
	flowPadding?: number, // px
	flowCount?: number,
	flowAutoCount?: number,

	tooltipElementClass?: string,
	tooltipDuration?: number, // ms
	customTooltipStyles?: object,
}

interface ellipsisNode extends Object { // ellipsis 요소별 노드
	element: HTMLElement; // HTML 요소
	eventOn: Boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
	originalElement: HTMLElement,
}

class AdvancedEllipsis {
	public selector: string
	private isStart: boolean = false;
	private nodes: Array<ellipsisNode> = [];
	private options: classOptions
	observer = new MutationObserver(function (mutations: Array<MutationRecord>) {
		mutations.forEach(mutation => {
			if (mutation && mutation.attributeName == 'style') {return}
			console.log(mutation);
		});
	});
	private defalutTooltipStyles: Function = (event: MouseEvent | TouchEvent): object => {
		const X = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientX : (<MouseEvent>event).clientX;
		const Y = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].clientY : (<MouseEvent>event).clientY;
		const isLeft: Boolean = X < window.innerWidth / 2;
		const isTop: Boolean = Y < window.innerHeight / 2;
		const boxGap: number = 10;
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
	private objectOverwrite(obj1: object, obj2: object, propertyOverwrite?: boolean): object {
		if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return;
		Object.keys(obj2).forEach(function (key: string) {
			if (propertyOverwrite || obj1.hasOwnProperty(key)) {
				obj1[key] = obj2[key];
			}
		});
		return obj1;
	}
	public start(): boolean { // 노드들의 옵션에 따라 노드 이벤트 등록
		if (this.nodes.length) {
			this.nodes.forEach(this.setSetting.bind(this));
			this.isStart = true;
		}
		return this.isStart;
	}
	public destroy(): boolean {
		if (this.nodes.length) {
			this.nodes.forEach(this.removeSetting.bind(this));
			this.nodes = [];
			this.isStart = false;
		}
		return this.isStart;
	}
	public setElements(selector: string): AdvancedEllipsis { // 요소를 설정
		if (!selector) return;
		this.destroy();
		this.selector = selector;
		return this;
	}
	public getElements(): Array<HTMLElement> {
		return this.nodes.map((node: ellipsisNode) => node.element);
	}
	public setOptions(options: classOptions): AdvancedEllipsis { // 옵션을 설정
		this.options = options;
		// this.objectOverwrite(this.options, options);
		return this;
	}
	private setSetting(node: ellipsisNode): void {
		if (node.listener) return;
		const styles: CSSStyleDeclaration = node.element.style;
		const data: DOMStringMap = node.element.dataset;
		if (this.options.defalutStyles) {
			styles.textOverflow = 'ellipsis';
			styles.overflow = 'hidden';
			styles.whiteSpace = 'nowrap';
		}
		const showOption: string = data.hasOwnProperty('ellipsisShowOption') ? data.ellipsisShowOption : (this.options.showOption || 'static')
		const lengthDiff: number = this.checkEllipsis(node.element, this.options.useCloneNode);
		if (lengthDiff) {
			if (this.options.mutationObserver) {this.observer.observe(node.element, {childList: true, attributes	: true});}
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
	private removeSetting(node: ellipsisNode): void {
		node.element.parentNode.insertBefore(node.originalElement, node.element);
		node.element.parentNode.removeChild(node.element);
	}
	private checkEllipsis(element: HTMLElement, useCloneNode?: Boolean): number {
		if (useCloneNode) {
			const contrast: HTMLElement = <HTMLElement>element.cloneNode(true);
			contrast.style.display = 'inline';
			contrast.style.width = 'auto';
			contrast.style.visibility = 'hidden';
			element.parentNode.appendChild(contrast)
			const res: number = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
			element.parentNode.removeChild(contrast);
			return res;
		}
		return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
	}
	private flowAnitate(node: ellipsisNode, length: number, repeatCount?: number): void {
		length = length + this.options.flowPadding;
		let start: number = null;
		const duration: number = length / this.options.flowSpeed * 1000;
		const delay: number = this.options.flowDelay;
		const afterDelay: number = this.options.flowAfterDelay;
		node.element.style.textOverflow = 'clip';
		node.eventOn = true;
		const flowAnitate = (timestamp) => {
			if (!node.eventOn) {
				node.element.style.transition = 'none';
				node.element.style.textIndent = '0';
				return;
			}
			if (!start) start = timestamp;
			const timediff: number = timestamp - start;
			if (repeatCount > 0) {
				const newTransition: string = 'text-indent ' + duration + 'ms ' + delay + 'ms linear'
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
	// event listener
	private flowListener(node: ellipsisNode, length: number): EventListener {
		const count: number = parseFloat(node.element.dataset.ellipsisFlowCount);
		return (): void => {
			if (!node.eventOn) {
				this.flowAnitate(node, length, count);
			}
		}
	}
	private tooltipListener(node: ellipsisNode): EventListener {
		const floatElement: HTMLElement = document.createElement("div");
		floatElement.id = node.element.dataset.tooltipElementId;
		const newClass = node.element.dataset.tooltipElementClass || this.options.tooltipElementClass;
		if (newClass) {
			floatElement.classList.add(...newClass.split(' '));
		}
		return (event: MouseEvent): void => {
			if (!node.eventOn) {
				floatElement.innerText = node.element.innerText;
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyles(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyles);
				document.body.appendChild(floatElement);
				node.eventOn = true;
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			} else {
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyles(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyles);
				clearTimeout(node.timer);
				node.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(node.timer);
					node.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			}
		}
	}
	constructor(options: classOptions | string) {
		const thisClass = this;
		const hidden = {};
		Object.defineProperty(this, 'selector', {
			get: function (): string {
				return hidden['selector'];
			},
			set: function (value: string) {
				const elements = document.querySelectorAll(value);
				if (!elements.length) return;
				elements.forEach((element: HTMLElement) => {
					const node: ellipsisNode = {
						element: element,
						eventOn: false,
						timer: null,
						listener: null,
						originalElement: <HTMLElement>element.cloneNode(true)
					}
					thisClass.nodes.push(node);
				});
				hidden['selector'] = value;
			}
		});
		Object.defineProperty(this, 'options', {
			get: function (): classOptions {
				return thisClass.objectOverwrite({}, hidden['options'], true);
			},
			set: function (value: classOptions) {
				console.log(value);
				if (hidden['options']) thisClass.objectOverwrite(hidden['options'], value);
				else hidden['options'] = value;
			}
		});
		this.selector = '[data-ellipsis]';
		this.options = {
			mutationObserver: true, // 변경 감지
			defalutStyles: true,
			useCloneNode: false,
			showOption: 'static',
			flowDelay: 1000, // 애니메이션 시작 전 시간
			flowAfterDelay: 1000, // 애니메이션 끝나고 초기화 대기 시간
			flowSpeed: 50, // 애미메이션 스피드
			flowPadding: 20, // flow를 얼마나 더 끌고 갈지
			flowCount: 1, // flow 기본 횟수
			flowAutoCount: Infinity, // flow-auto 기본 횟수
			tooltipElementClass: 'ellipsis_tooltip_box',
			tooltipDuration: 2000,
			customTooltipStyles: {},
		};




		if (typeof options === 'string') {
			this.setElements(options);
		} else {
			this.setOptions(<classOptions>options || {});
		}
	}
}
export default AdvancedEllipsis;
