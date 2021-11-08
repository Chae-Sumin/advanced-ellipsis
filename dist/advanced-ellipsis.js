var AdvancedEllipsis = /** @class */ (function () {
    function AdvancedEllipsis(parameters) {
        this.option = 'string';
        this.option += parameters;
    }
    AdvancedEllipsis.prototype.print = function () {
        console.log(this.option);
    };
    return AdvancedEllipsis;
}());
