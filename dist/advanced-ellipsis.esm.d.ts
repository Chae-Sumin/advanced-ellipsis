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
    flowAutoPre?: number;
    tooltipElementClass?: string;
    tooltipDuration?: number;
    customTooltipStyles?: object;
}
declare class AdvancedEllipsis {
    selector: string;
    options: ClassOptions;
    private isStart;
    private elements;
    private observer;
    start(): AdvancedEllipsis;
    destroy(): AdvancedEllipsis;
    restart(): AdvancedEllipsis;
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
export default AdvancedEllipsis;
