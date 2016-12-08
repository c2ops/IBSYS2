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
 * Created by Paddy on 07.12.2016.
 */
var core_1 = require('@angular/core');
var session_service_1 = require('../../../services/session.service');
var part_1 = require('../../../model/part');
var part_service_1 = require('../../../services/part.service');
var PartsListsComponent = (function () {
    function PartsListsComponent(partservice, sessionService) {
        var _this = this;
        this.partservice = partservice;
        this.sessionService = sessionService;
        this.part = new part_1.Part();
        this.partsList = Object();
        this.nodes = 5;
        this.productOptions = Array();
        this.getNumber = function (num) {
            return new Array(num);
        };
        if (this.sessionService.getParts() != null || this.sessionService.getParts() != undefined) {
            this.parts = this.sessionService.getParts();
            this.pparts = this.sessionService.getParts().filter(function (item) { return item.typ == "P"; });
            this.initMultiSelects();
        }
        else {
            this.partservice.getParts()
                .subscribe(function (parts) {
                _this.parts = parts;
                _this.pparts = parts.filter(function (item) { return item.typ == "P"; });
            }, function (err) { return console.error(err); }, function () { return _this.initMultiSelects(); });
        }
    }
    PartsListsComponent.prototype.initMultiSelects = function () {
        for (var _i = 0, _a = this.pparts; _i < _a.length; _i++) {
            var pt = _a[_i];
            this.productOptions.push({ id: pt.nummer, name: pt.bezeichnung.toString() });
        }
        this.productSettings = {
            pullRight: false,
            enableSearch: false,
            checkedStyle: 'glyphicon',
            buttonClasses: 'btn btn-default',
            selectionLimit: 1,
            closeOnSelect: true,
            showCheckAll: false,
            showUncheckAll: false,
            dynamicTitleMaxItems: 1,
            maxHeight: '100px',
        };
        this.multiSelectTexts = {
            checkAll: 'Check all',
            uncheckAll: 'Uncheck all',
            checked: 'checked',
            checkedPlural: 'checked',
            searchPlaceholder: 'Search...',
            defaultTitle: 'Select',
        };
    };
    PartsListsComponent.prototype.generatePartsList = function () {
        if (this.auswahl != undefined && this.auswahl.length == 1) {
            for (var _i = 0, _a = this.parts; _i < _a.length; _i++) {
                var pt = _a[_i];
                if (pt.nummer == this.auswahl[0]) {
                    this.part = pt;
                }
            }
            if (this.part != null) {
                this.partsList = {
                    _id: this.part._id,
                    bezeichnung: this.part.bezeichnung,
                    typ: this.part.typ,
                    nummer: this.part.nummer,
                    anzahl: 1,
                    bestandteile: []
                };
                for (var _b = 0, _c = this.part.bestandteile; _b < _c.length; _b++) {
                    var best = _c[_b];
                    for (var _d = 0, _e = this.parts; _d < _e.length; _d++) {
                        var pt = _e[_d];
                        if (best._id == pt._id) {
                            this.partsList.bestandteile.push({
                                _id: pt._id,
                                bezeichnung: pt.bezeichnung,
                                typ: pt.typ,
                                nummer: pt.nummer,
                                anzahl: best.anzahl,
                                bestandteile: this.getBestandteile(pt)
                            });
                        }
                    }
                }
            }
        }
    };
    PartsListsComponent.prototype.getBestandteile = function (part) {
        var bestandteile = Array();
        for (var _i = 0, _a = part.bestandteile; _i < _a.length; _i++) {
            var ptOut = _a[_i];
            for (var _b = 0, _c = this.parts; _b < _c.length; _b++) {
                var ptIn = _c[_b];
                if (ptOut._id == ptIn._id) {
                    bestandteile.push({
                        _id: ptIn._id,
                        bezeichnung: ptIn.bezeichnung,
                        typ: ptIn.typ,
                        nummer: ptIn.nummer,
                        anzahl: ptOut.anzahl,
                        bestandteile: this.getBestandteile(ptIn)
                    });
                }
            }
        }
        return bestandteile;
    };
    PartsListsComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'partsLists',
            templateUrl: 'partsLists.component.html'
        }), 
        __metadata('design:paramtypes', [part_service_1.PartService, session_service_1.SessionService])
    ], PartsListsComponent);
    return PartsListsComponent;
}());
exports.PartsListsComponent = PartsListsComponent;
//# sourceMappingURL=partsLists.component.js.map