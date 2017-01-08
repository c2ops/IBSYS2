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
var core_1 = require('@angular/core');
var session_service_1 = require('../../services/session.service');
var materialPlanning_service_1 = require('../../services/materialPlanning.service');
var http_1 = require("@angular/http");
var MaterialPlanningComponent = (function () {
    function MaterialPlanningComponent(sessionService, materialPlanningService, http) {
        this.sessionService = sessionService;
        this.materialPlanningService = materialPlanningService;
        this.http = http;
        this.resultObj = this.sessionService.getResultObject();
        this.matPlan = new Array();
        this.verwendungRow = new Array();
        this.periodrow = new Array();
        this.plannings = new Array();
        this.getKParts();
        this.bestellarten = new Array("E.", "N.", "---");
        this.vorigeBestellungen = new Array();
    }
    MaterialPlanningComponent.prototype.getKParts = function () {
        var _this = this;
        this.materialPlanningService.getKParts()
            .subscribe(function (data) {
            _this.purchaseParts = data;
        }, function (err) { return console.error(err); }, function () { return _this.setParameters(); });
    };
    ;
    MaterialPlanningComponent.prototype.setvorigeBestellungen = function () {
        var aktuellePeriode;
        for (var i = 0; i < this.resultObj.results.inwardstockmovement.order.length; i++) {
            var vorigeBestellung = {
                teil: null,
                menge: null,
                orderperiode: null,
                ankunftperiode: null
            };
            vorigeBestellung.menge = this.resultObj.results.inwardstockmovement.order[i].amount;
            vorigeBestellung.orderperiode = this.resultObj.results.inwardstockmovement.order[i].orderperiod;
            vorigeBestellung.teil = this.resultObj.results.inwardstockmovement.order[i].article;
            for (var _i = 0, _a = this.purchaseParts; _i < _a.length; _i++) {
                var p = _a[_i];
                if (p.nummer == vorigeBestellung.teil) {
                    vorigeBestellung.ankunftperiode = p.lieferfrist + p.abweichung + Number(vorigeBestellung.orderperiode);
                    this.vorigeBestellungen.push(vorigeBestellung);
                }
            }
        }
    };
    //TODO: Perioden von Yannik über session service holen (derzeit kommt immer nur die selbe), danach restliche tabelle
    MaterialPlanningComponent.prototype.setParameters = function () {
        // if (this.sessionService.getMatPlan() == null) {
        var aktuellePeriode = this.resultObj.results.period;
        this.getBruttoBedarfandPeriods();
        this.setvorigeBestellungen();
        var index = 0;
        for (var _i = 0, _a = this.purchaseParts; _i < _a.length; _i++) {
            var purchPart = _a[_i];
            var matPlanRow = {
                kpartnr: null,
                lieferfrist: null,
                abweichung: null,
                summe: null,
                verwendung: [],
                diskontmenge: null,
                anfangsbestand: null,
                bruttobedarfnP: [],
                mengeohbest: null,
                bestellmenge: null,
                mengemitbest: null,
                bestellung: null,
                bestandnWe: null,
                isneg: null,
                isneg2: null
            };
            // collect values
            matPlanRow.kpartnr = purchPart.nummer;
            index = matPlanRow.kpartnr - 1;
            matPlanRow.anfangsbestand = this.resultObj.results.warehousestock.article[index].startamount;
            matPlanRow.abweichung = purchPart.abweichung;
            matPlanRow.lieferfrist = purchPart.lieferfrist;
            matPlanRow.diskontmenge = purchPart.diskontmenge; // werte bei diskontmenge in db und excel unterscheiden sich, auch ab überprüfen
            matPlanRow.summe = Number((matPlanRow.lieferfrist + matPlanRow.abweichung).toFixed(2));
            // get Verwendungen
            for (var _b = 0, _c = purchPart.verwendung; _b < _c.length; _b++) {
                var vw = _c[_b];
                matPlanRow.verwendung.push(vw);
            }
            // get Bruttobedarf
            matPlanRow.bruttobedarfnP.push(0);
            for (var _d = 0, _e = this.plannings; _d < _e.length; _d++) {
                var p = _e[_d];
                while (matPlanRow.bruttobedarfnP.length < p.produktmengen.length) {
                    matPlanRow.bruttobedarfnP.push(0);
                }
            }
            for (var _f = 0, _g = purchPart.verwendung; _f < _g.length; _f++) {
                var vw = _g[_f];
                for (var _h = 0, _j = this.plannings; _h < _j.length; _h++) {
                    var p = _j[_h];
                    if (vw.Produkt === p.produktkennung) {
                        for (var i = 0; i < matPlanRow.bruttobedarfnP.length; i++) {
                            matPlanRow.bruttobedarfnP[i] += vw.Menge * p.produktmengen[i];
                        }
                    }
                }
            }
            // get Menge ohne Bestellung
            matPlanRow.mengeohbest = matPlanRow.anfangsbestand;
            for (var i = 0; i < matPlanRow.bruttobedarfnP.length; i++) {
                matPlanRow.mengeohbest = matPlanRow.mengeohbest - matPlanRow.bruttobedarfnP[i];
                matPlanRow.mengemitbest = matPlanRow.mengeohbest;
            }
            if (matPlanRow.mengeohbest < 0) {
                matPlanRow.isneg = true;
            }
            else {
                matPlanRow.isneg = false;
            }
            // get Menge mit Bestellung aus Vorperiode
            for (var _k = 0, _l = this.vorigeBestellungen; _k < _l.length; _k++) {
                var vb = _l[_k];
                if (matPlanRow.kpartnr == vb.teil) {
                    vb.ankunftperiode = purchPart.lieferfrist + purchPart.abweichung + Number(vb.orderperiode);
                    if (Math.round(vb.ankunftperiode) <= aktuellePeriode) {
                        matPlanRow.mengemitbest = Number(vb.menge) + matPlanRow.mengeohbest;
                    }
                }
            }
            if (matPlanRow.mengemitbest < 0) {
                console.log("<0", matPlanRow.mengemitbest);
                matPlanRow.isneg2 = true;
            }
            else {
                console.log("else", matPlanRow.mengemitbest);
                matPlanRow.isneg2 = false;
            }
            // set Bestellmenge
            matPlanRow.bestellmenge = 1000;
            // set Normal-/Eilbestellung
            if (matPlanRow.mengeohbest < 0 && matPlanRow.summe * matPlanRow.bruttobedarfnP[0] > matPlanRow.anfangsbestand) {
                matPlanRow.bestellung = "E.";
            }
            else {
                if (matPlanRow.mengeohbest <= 0) {
                    matPlanRow.bestellung = "N.";
                }
                else {
                    matPlanRow.bestellung = "---";
                }
            }
            // get Verwendungsarten
            for (var l = 0; l <= matPlanRow.verwendung.length - 1; l++) {
                if (!this.verwendungRow.includes(matPlanRow.verwendung[l].Produkt)) {
                    this.verwendungRow.push(matPlanRow.verwendung[l].Produkt);
                }
            }
            // store values finally
            this.matPlan.push(matPlanRow);
        }
        console.log(this.vorigeBestellungen);
        this.sessionService.setVerwendungRow(this.verwendungRow);
        this.sessionService.setPeriodRow(this.periodrow);
        this.sessionService.setMatPlan(this.matPlan);
        this.setLayout();
        // }
        // else {
        //     console.log("Kaufteildispo bereits in Session eingebunden. - nach Änderungen auf der Datenbank bitte neue Session starten");
        //     this.periodrow = this.sessionService.getPeriodRow();
        //     this.verwendungRow = this.sessionService.getVerwendungRow();
        //     this.matPlan = this.sessionService.getMatPlan();
        //     this.setLayout();
        // }
    };
    MaterialPlanningComponent.prototype.getBruttoBedarfandPeriods = function () {
        this.plannings = this.sessionService.getPlannings();
        if (this.plannings === null) {
            alert("Bitte erst die Prognose durchführen.");
        }
    };
    MaterialPlanningComponent.prototype.bestellartSelected = function (bestellart, i) {
        this.matPlan[i].bestellung = bestellart;
        this.sessionService.setMatPlan(this.matPlan);
    };
    MaterialPlanningComponent.prototype.bestellmengeChange = function (newvalue, index) {
        if (newvalue >= 0) {
            this.matPlan[index].bestellmenge = newvalue;
            this.sessionService.setMatPlan(this.matPlan);
        }
        else {
            alert("Bitte positiven Wert eingeben !");
        }
    };
    MaterialPlanningComponent.prototype.setLayout = function () {
        var period = Number(this.resultObj.results.period);
        for (var i = 0; i < 4; i++) {
            this.periodrow[i] = period + i;
        }
        document.getElementById("Verwendung").setAttribute("colspan", String(this.verwendungRow.length));
        document.getElementById("Bruttobedarf").setAttribute("colspan", String(this.periodrow.length));
        document.getElementById("Bestand").setAttribute("colspan", String(this.periodrow.length));
    };
    MaterialPlanningComponent.prototype.clearSession = function () {
        this.sessionService.clear();
    };
    MaterialPlanningComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'materialPlanning',
            templateUrl: 'materialPlanning.component.html'
        }), 
        __metadata('design:paramtypes', [session_service_1.SessionService, materialPlanning_service_1.MaterialPlanningService, http_1.Http])
    ], MaterialPlanningComponent);
    return MaterialPlanningComponent;
}());
exports.MaterialPlanningComponent = MaterialPlanningComponent;
//# sourceMappingURL=materialPlanning.component.js.map