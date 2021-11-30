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
	flowCountPre?: number,
	flowAutoCount?: number,

	tooltipElementClass?: string,
	tooltipDuration?: number, // ms
	customTooltipStyles?: object,
}

interface EllipsisOptions extends Object { // ellipsis 요소별 노드
	originalElement: HTMLElement;
	showOption: string;
	eventOn: boolean; // 이벤트 중 중복 이벤트 방지
	timer: ReturnType<typeof setTimeout>; // 이벤트 타이머
	listener: EventListener; // 이벤트 리스너 관리
}

interface ObjectOverwrite {
	(obj1: object, obj2: object, propertyOverwrite?: boolean): object
}

interface EllipsisHandler {
	(): AdvancedEllipsis;
}

class AdvancedEllipsis {
	// public methods
	// private value changer
	public setElements: (selector: string) => AdvancedEllipsis;
	public getElements: () => Array<HTMLElement>;
	public setOptions: (options: ClassOptions) => AdvancedEllipsis;
	public getOptions: () => ClassOptions;
	public getOption: (key: string) => boolean | number | string | object;
	// handler
	public start: EllipsisHandler;
	public destroy: EllipsisHandler;
	public restart: EllipsisHandler;


	constructor(options: ClassOptions | string, selector: string) {
		// private value
		const _observer: MutationObserver = new MutationObserver(function (mutations: Array<MutationRecord>) {
			mutations.forEach(mutation => {
				if (mutation.attributeName === 'style') return;
				console.log(mutation);
				if (mutation.target.childNodes.length === 1 && mutation.target.childNodes[0].nodeType === 3) {
					this.addSetting(mutation.target);
				}
			});
		}.bind(this));
		const _options: ClassOptions = {
			mutationObserver: true, // 변경 감지
			defalutStyles: true,
			useCloneNode: false,
			showOption: 'static',
			flowDelay: 1000, // 애니메이션 시작 전 시간
			flowAfterDelay: 1000, // 애니메이션 끝나고 초기화 대기 시간
			flowSpeed: 50, // 애니메이션 스피드
			flowPadding: 20, // flow를 얼마나 더 끌고 갈지
			flowCount: 1, // flow 기본 횟수
			flowAutoCount: Infinity, // flow-auto 기본 횟수
			flowCountPre: 0,
			tooltipElementClass: 'ellipsis_tooltip_box',
			tooltipDuration: 2000,
			customTooltipStyles: {},
		};
		const _elements: Array<HTMLElement> = [];
		let _isStart = false;

		// private methods
		const objectOverwrite: ObjectOverwrite = (obj1, obj2, propertyOverwrite) => {
			if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return;
			Object.keys(obj2).forEach(function (key: string) {
				if (propertyOverwrite || Object.prototype.hasOwnProperty.call(obj1, key)) {
					obj1[key] = obj2[key];
				}
			});
			return obj1;
		};
		const defalutTooltipStyles = (event: MouseEvent | TouchEvent): object => {
			const X = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].pageX : (<MouseEvent>event).pageX;
			const Y = event.type === "touchend" ? (<TouchEvent>event).changedTouches[0].pageY : (<MouseEvent>event).pageY;
			const isLeft: boolean = X < window.innerWidth / 2;
			const isTop: boolean = Y < window.innerHeight / 2;
			const boxGap = 10;
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
			}
		}
		const checkEllipsis = (element: HTMLElement, useCloneNode?: boolean): number => {
			if (useCloneNode) {
				const contrast: HTMLElement = <HTMLElement>element.cloneNode(true);
				contrast.style.display = 'inline';
				contrast.style.width = 'auto';
				contrast.style.visibility = 'hidden';
				element.parentNode.appendChild(contrast);
				const res: number = contrast.offsetWidth > element.offsetWidth ? contrast.offsetWidth - element.offsetWidth : 0;
				element.parentNode.removeChild(contrast);
				return res;
			}
			return element.scrollWidth > element.offsetWidth ? element.scrollWidth - element.offsetWidth : 0;
		}
		const flowAnitate = (element: HTMLElement, length: number, repeatCount?: number): void => {
			const e_option: EllipsisOptions = element['ellipsisOption'];
			const this_options: ClassOptions = this.getOptions();
			length = length + this_options.flowPadding;
			let start: number = null;
			const duration: number = length / this_options.flowSpeed * 1000;
			const delay: number = this_options.flowDelay;
			const afterDelay: number = this_options.flowAfterDelay;
			element.style.textOverflow = 'clip';
			e_option.eventOn = true;
			const flowAnitate = (timestamp) => {
				if (!e_option.eventOn) {
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
					e_option.eventOn = false;
				}
			}
			window.requestAnimationFrame(flowAnitate);
		}
		// event listener
		const flowListener = (element: HTMLElement, length: number): EventListener => {
			const e_option: EllipsisOptions = element['ellipsisOption'];
			const count: number = element.dataset.ellipsisFlowCount ? parseFloat(element.dataset.ellipsisFlowCount) : <number>this.getOption('flowCount');
			return (): void => {
				if (!e_option.eventOn) {
					flowAnitate(element, length, count);
				}
			}
		}
		const tooltipListener = (element: HTMLElement): EventListener => {
			const e_option: EllipsisOptions = element['ellipsisOption'];
			const this_options: ClassOptions = this.getOptions();
			const floatElement: HTMLElement = document.createElement("div");
			if (element.dataset.tooltipElementId) {
				floatElement.id = element.dataset.tooltipElementId;
			}
			const tooltipClass = element.dataset.tooltipElementClass || this_options.tooltipElementClass;
			if (tooltipClass) {
				floatElement.classList.add(...tooltipClass.split(' '));
			}
			return (event: MouseEvent): void => {
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
					}.bind(this), this_options.tooltipDuration);
				} else {
					objectOverwrite(floatElement.style, defalutTooltipStyles(event));
					objectOverwrite(floatElement.style, this_options.customTooltipStyles);
					clearTimeout(e_option.timer);
					e_option.timer = setTimeout(function () {
						document.body.removeChild(floatElement);
						clearTimeout(e_option.timer);
						e_option.eventOn = false;
					}.bind(this), this_options.tooltipDuration);
				}
			}
		}

		// element status handler
		const addSetting = (element: HTMLElement): void => {
			const e_option: EllipsisOptions = element['ellipsisOption'];
			const this_options: ClassOptions = this.getOptions();
			if (e_option.showOption) removeSetting(element);
			if (this_options.defalutStyles) {
				objectOverwrite(element.style, {
					textOverflow: 'ellipsis',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
				});
			}
			if (this_options.mutationObserver) _observer.observe(element, {childList: true, attributes : true});
			e_option.showOption = Object.prototype.hasOwnProperty.call(element.dataset, 'ellipsisShowOption') ? element.dataset.ellipsisShowOption : (this_options.showOption || 'static');
			const lengthDiff: number = checkEllipsis(element, this_options.useCloneNode);
			if (lengthDiff) {
				let count = 0;
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
		}
		const removeSetting = (element: HTMLElement): void => {
			const e_option: EllipsisOptions = element['ellipsisOption'];
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
		}

		// public methods
		this.setElements = (selector) => {
			if (!selector) return;
			this.destroy();
			const elements = document.querySelectorAll(selector);
			if (!elements.length) return;
			_elements.length = 0;
			elements.forEach((element: HTMLElement) => {
				if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
					const ellipsisOption: EllipsisOptions = {
						originalElement: <HTMLElement>element.cloneNode(true),
						showOption: '',
						eventOn: false,
						timer: null,
						listener: null,
					}
					element['ellipsisOption'] = ellipsisOption;
					_elements.push(element);
				}
			});
			return this;
		};
		this.getElements = () => <Array<HTMLElement>>objectOverwrite([], _elements, true);
		this.setOptions = (options) => {
			const before: string = JSON.stringify(_options);
			objectOverwrite(_options, options);
			if (before !== JSON.stringify(_options)) {
				this.restart();
			}
			return this;
		};
		this.getOptions = () => objectOverwrite({}, _options, true);
		this.getOption = key => _options[key];
		// handler
		this.start = () => { // 노드들의 옵션에 따라 노드 이벤트 등록
			const elements: Array<HTMLElement> = this.getElements();
			if (elements.length) {
				elements.forEach(addSetting.bind(this));
				_isStart = true;
			}
			return this;
		}
		this.destroy = () => { // 등록된 이벤트 및 스타일 삭제
			const elements: Array<HTMLElement> = this.getElements();
			if (elements.length) {
				_observer.disconnect();
				elements.forEach(removeSetting.bind(this));
				_isStart = false;
			}
			return this;
		}
		this.restart = () => {
			const elements: Array<HTMLElement> = this.getElements();
			if (_isStart && elements.length) {
				_observer.disconnect();
				elements.forEach(removeSetting.bind(this));
				elements.forEach(addSetting.bind(this));
			}
			return this;
		}

		// init
		this.setElements('[data-ellipsis]');
		if (typeof selector === 'string') {
			this.setElements(selector);
		} else if (typeof options === 'string') {
			this.setElements(options);
		} else if (typeof options === 'object') {
			this.setOptions(<ClassOptions>options);
		}
	}
}
