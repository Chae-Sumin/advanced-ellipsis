class AdvancedEllipsis {
    option: string = 'string';
    constructor(parameters: string) {
        this.option += parameters;
    }
    print (): void {
        console.log(this.option);
    }
}