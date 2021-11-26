interface classOptions extends Object {
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
declare class AdvancedEllipsis {
    selector: string;
    private isStart;
    private nodes;
    private options;
    observer: MutationObserver;
    private defalutTooltipStyles;
    private objectOverwrite;
    start(): boolean;
    destroy(): boolean;
    setElements(selector: string): AdvancedEllipsis;
    getElements(): Array<HTMLElement>;
    setOptions(options: classOptions): AdvancedEllipsis;
    private setSetting;
    private removeSetting;
    private checkEllipsis;
    private flowAnitate;
    private flowListener;
    private tooltipListener;
    constructor(options: classOptions | string);
}
export default AdvancedEllipsis;
