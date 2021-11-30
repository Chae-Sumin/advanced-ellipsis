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
    flowCountPre?: number;
    flowAutoCount?: number;
    tooltipElementClass?: string;
    tooltipDuration?: number;
    customTooltipStyles?: object;
}
interface EllipsisOptions extends Object {
    originalElement: HTMLElement;
    showOption: string;
    eventOn: boolean;
    timer: ReturnType<typeof setTimeout>;
    listener: EventListener;
}
interface ObjectOverwrite {
    (obj1: object, obj2: object, propertyOverwrite?: boolean): object;
}
interface EllipsisHandler {
    (): AdvancedEllipsis;
}
declare class AdvancedEllipsis {
    setElements: (selector: string) => AdvancedEllipsis;
    getElements: () => Array<HTMLElement>;
    setOptions: (options: ClassOptions) => AdvancedEllipsis;
    getOptions: () => ClassOptions;
    getOption: (key: string) => boolean | number | string | object;
    start: EllipsisHandler;
    destroy: EllipsisHandler;
    restart: EllipsisHandler;
    constructor(options: ClassOptions | string, selector: string);
}
