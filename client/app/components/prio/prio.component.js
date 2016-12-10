"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by philipp.koepfer on 10.12.16.
 */
var core_1 = require('@angular/core');
var session_service_1 = require('../../services/session.service');
var part_service_1 = require('../../services/part.service');
var PrioComponent = (function () {
    function PrioComponent(sessionService, partService) {
        var _this = this;
        this.sessionService = sessionService;
        this.partService = partService;
        this.selector = "";
        this.epParts = [];
        this.listOne = ['Coffee', 'Orange Juice', 'Red Wine', 'Unhealty drink!', 'Water'];
        this.partService.getEPParts()
            .subscribe(function (data) { _this.epParts = data; }, function (err) { return console.error(err); }, function () { return console.log(_this.epParts); });
    }
    PrioComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'prio',
            templateUrl: 'prio.component.html'
        }), 
        __metadata('design:paramtypes', [session_service_1.SessionService, part_service_1.PartService])
    ], PrioComponent);
    return PrioComponent;
}());
exports.PrioComponent = PrioComponent;
/*
    15 Arbeitsplätze

    Max: 10800 min pro Periode
    Eine Schicht mit Überstunden sind 3600 min.

 1. Schicht 2.400 Minuten
 2. Schicht 2.400 Minuten
 3. Schicht 2.400 Minuten
 */ 
//# sourceMappingURL=prio.component.js.map