interface ClassOptions extends Object {
    mutationObserver?: boolean;
    defalutStyles?: boolean;
    useCloneNode?: boolean;
    showOption?: string;
    flowDelay?: number;
    flowAfterDelay?: number;
    flowSpeed?: number;
    flowPadding?: number;
    flowCount?: number;
    flowAutoCount?: number;
    tooltipElementClass?: string;
    tooltipDuration?: number;
    customTooltipStyles?: object;
}
interface EllipsisNode extends Object {
    element: HTMLElement;
    originalElement: HTMLElement;
    showOption: string;
    eventOn: Boolean;
    timer: ReturnType<typeof setTimeout>;
    listener: EventListener;
}
interface EllipsisOptions extends Object {
    originalElement: HTMLElement;
    showOption: string;
    eventOn: Boolean;
    timer: ReturnType<typeof setTimeout>;
    listener: EventListener;
}
declare class AdvancedEllipsis {
    private selector;
    private isStart;
    private elements;
    private options;
    private observer;
    start(): boolean;
    destroy(): boolean;
    setElements(selector: string): AdvancedEllipsis;
    setOptions(options: ClassOptions): AdvancedEllipsis;
    private defalutTooltipStyles;
    private objectOverwrite;
    private addSetting;
    private removeSetting;
    private checkEllipsis;
    private flowAnitate;
    private flowListener;
    private tooltipListener;
    constructor(options: ClassOptions | string, selector: string);
}
