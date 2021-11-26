interface ClassOptions extends Object { // 옵션 인터페이스
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

interface EllipsisNode extends Object { // ellipsis 요소별 노드
	element: HTMLElement; // HTML 요소
	originalElement: HTMLElement;
	showOption: string;
	eventOn: Boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
}


interface EllipsisOptions extends Object { // ellipsis 요소별 노드
	originalElement: HTMLElement;
	showOption: string;
	eventOn: Boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
}


class AdvancedEllipsis {
	private selector: string
	private isStart: boolean = false;
	private elements: Array<HTMLElement> = [];
	private options: ClassOptions
	private observer: MutationObserver = new MutationObserver(function (mutations: Array<MutationRecord>) {
		mutations.forEach(mutation => {
			if (mutation.attributeName === 'style') return;
			if (mutation.target.childNodes.length === 1 && mutation.target.childNodes[0].nodeType === 3) {
				this.addSetting(mutation.target);
				console.log(mutation);
			}
		});
	}.bind(this));
	// public methods
	public start(): boolean { // 노드들의 옵션에 따라 노드 이벤트 등록
		if (this.elements.length) {
			this.elements.forEach(this.addSetting.bind(this));
			this.isStart = true;
		}
		return this.isStart;
	}
	public destroy(): boolean {
		if (this.elements.length) {
			this.elements.forEach(this.removeSetting.bind(this));
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
	// public getElements(): Array<HTMLElement> {
	// 	return this.elements.map((node: EllipsisNode) => node.element);
	// }
	public setOptions(options: ClassOptions): AdvancedEllipsis { // 옵션을 설정
		this.options = options;
		// this.objectOverwrite(this.options, options);
		return this;
	}
	// private methods
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
	private addSetting(element: HTMLElement): void {
		const option = element['options'];
		if (option.showOption) this.removeSetting(element);
		if (this.options.defalutStyles) {
			this.objectOverwrite(element.style, {
				textOverflow: 'ellipsis',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
			})
		}
		console.log(element.dataset);
		option.showOption = element.dataset.hasOwnProperty('ellipsisShowOption') ? element.dataset.ellipsisShowOption : (this.options.showOption || 'static');
		const lengthDiff: number = this.checkEllipsis(element, this.options.useCloneNode);
		if (lengthDiff) {
			if (this.options.mutationObserver) {this.observer.observe(element, {childList: true, attributes : true});}
			switch (option.showOption) {
				case 'flow':
					const flow_listener = this.flowListener(element, lengthDiff);
					option.listener = flow_listener;
					element.addEventListener('mouseover', option.listener);
					break;
				case 'flow-auto':
					const count = parseFloat(element.dataset.ellipsisFlowCount) || this.options.flowAutoCount || Infinity;
					this.flowAnitate(element, lengthDiff, count);
					break;
				case 'tooltip':
					const tooltip_listener = this.tooltipListener(element);
					option.listener = tooltip_listener;
					element.addEventListener('mouseover', option.listener);
					element.addEventListener('touchend', option.listener);
					break;
				default:
					break;
			}
		}
	}
	private removeSetting(element: HTMLElement): void {
		const option = element['options'];
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
	private flowAnitate(element: HTMLElement, length: number, repeatCount?: number): void {
		const option = element['options'];
		length = length + this.options.flowPadding;
		let start: number = null;
		const duration: number = length / this.options.flowSpeed * 1000;
		const delay: number = this.options.flowDelay;
		const afterDelay: number = this.options.flowAfterDelay;
		element.style.textOverflow = 'clip';
		option.eventOn = true;
		const flowAnitate = (timestamp) => {
			if (!option.eventOn) {
				element.style.transition = 'none';
				element.style.textIndent = '0';
				return;
			}
			if (!start) start = timestamp;
			const timediff: number = timestamp - start;
			if (repeatCount > 0) {
				const newTransition: string = 'text-indent ' + duration + 'ms ' + delay + 'ms linear'
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
				} else {
					window.requestAnimationFrame(flowAnitate);
				}
			} else {
				element.style.textOverflow = 'ellipsis';
				option.eventOn = false;
			}
		}
		window.requestAnimationFrame(flowAnitate);
	}
	// event listener
	private flowListener(element: HTMLElement, length: number): EventListener {
		const option = element['options'];
		const count: number = element.dataset.ellipsisFlowCount ? parseFloat(element.dataset.ellipsisFlowCount) : this.options.flowCount;
		return (): void => {
			if (!option.eventOn) {
				this.flowAnitate(element, length, count);
			}
		}
	}
	private tooltipListener(element: HTMLElement): EventListener {
		const option = element['options'];
		const floatElement: HTMLElement = document.createElement("div");
		floatElement.id = element.dataset.tooltipElementId;
		const newClass = element.dataset.tooltipElementClass || this.options.tooltipElementClass;
		if (newClass) {
			floatElement.classList.add(...newClass.split(' '));
		}
		return (event: MouseEvent): void => {
			if (!option.eventOn) {
				floatElement.innerText = element.innerText;
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyles(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyles);
				document.body.appendChild(floatElement);
				option.eventOn = true;
				option.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(option.timer);
					option.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			} else {
				this.objectOverwrite(floatElement.style, this.defalutTooltipStyles(event));
				this.objectOverwrite(floatElement.style, this.options.customTooltipStyles);
				clearTimeout(option.timer);
				option.timer = setTimeout(function () {
					document.body.removeChild(floatElement);
					clearTimeout(option.timer);
					option.eventOn = false;
				}.bind(this), this.options.tooltipDuration);
			}
		}
	}
	constructor(options: ClassOptions | string, selector: string) {
		const hidden = {};
		Object.defineProperty(this, 'selector', {
			get: function (): string {
				return hidden['selector'];
			},
			set: function (value: string) {
				const elements = document.querySelectorAll(value);
				if (!elements.length) return;
				elements.forEach((element: HTMLElement) => {
					if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
						const ellipsisOption: EllipsisOptions = {
							originalElement: <HTMLElement>element.cloneNode(true),
							showOption: '',
							eventOn: false,
							timer: null,
							listener: null,
						}
						element['options'] = ellipsisOption;
						this.elements.push(element);
					}
				});
				hidden['selector'] = value;
			}
		});
		Object.defineProperty(this, 'options', {
			get: function (): ClassOptions {
				return this.objectOverwrite({}, hidden['options'], true);
			},
			set: function (value: Array<any>) {
				if (hidden['options']) this.objectOverwrite(hidden['options'], value);
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




		if (typeof selector === 'string') {
			this.setElements(selector);
		} else if (typeof options === 'string') {
			this.setElements(options);
		} else if (typeof options === 'object') {
			this.setOptions(<ClassOptions>options);
		}
	}
}
