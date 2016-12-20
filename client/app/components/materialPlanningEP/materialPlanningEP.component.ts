/**
 * Created by Paddy on 18.12.2016.
 */
import {Component} from '@angular/core';
import {PartService} from '../../services/part.service';
import {SessionService} from '../../services/session.service';
import {Part} from '../../model/part';
import {
    IMultiSelectOption,
    IMultiSelectSettings,
    IMultiSelectTexts
} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';

@Component({
    moduleId: module.id,
    selector: 'materialPlanningEP',
    templateUrl: 'materialPlanningEP.component.html'
})

export class MaterialPlanningEPComponent {
    part: Part;
    eParts: Part[];
    pParts: Part[];
    columns: number = 14;
    auswahl: any;
    partsList: Array<any> = Array<any>();
    tmp_partsList: Array<any> = Array<any>();
    partsListSingle: Array<any> = Array<any>();

    //Daten aus ResultObjekt
    resultObj: any;
    warteschlangen: any;
    lager: any;
    bearbeitung: any;

    //Model Daten für Inputs
    auftraegeVerbindl: Array<any> = Array<any>();
    geplLagerbestand: Array<any> = Array<any>();
    lagerbestandVorperiode: Array<any> = Array<any>();
    auftraegeWarteschlAddiert: Array<any> = Array<any>();
    auftraegeWarteschl: Array<any> = Array<any>();
    auftraegeBearb: Array<any> = Array<any>();
    prodAuftraege: Array<any> = Array<any>();


    private productOptions: IMultiSelectOption[] = Array<IMultiSelectOption>();
    private productSettings: IMultiSelectSettings;
    private multiSelectTexts: IMultiSelectTexts;


    //MOCK DATA
    mockVerbindlicheAuftraege: Array<any> = [{id: 1, menge: 100}, {id: 2, menge: 200}, {id: 3, menge: 150}];
    mockGeplLager: Array<any> = [{id: 1, menge: 50}, {id: 2, menge: 60}, {id: 3, menge: 70}];

    constructor(private partService: PartService, private sessionService: SessionService) {

    }

    ngOnInit() {
        if (this.sessionService.getParts() != null || this.sessionService.getParts() != undefined ||
            this.sessionService.getResultObject() != null || this.sessionService.getResultObject() != undefined) {
            this.eParts = this.sessionService.getParts().filter(item => item.typ == "E");
            this.pParts = this.sessionService.getParts().filter(item => item.typ == "P");
            this.resultObj = this.sessionService.getResultObject();
            if(this.sessionService.getPlannedWarehouseStock()){
                this.geplLagerbestand = this.sessionService.getPlannedWarehouseStock();
            }

            this.initAll();
        }
        else {
            this.partService.getParts()
                .subscribe(data => {
                        this.eParts = data.filter(item => item.typ == "E");
                        this.pParts = data.filter(item => item.typ == "P");
                    },
                    err => console.error(err),
                    () => this.initAll());
        }
    }

    initAll() {
        this.initMultiSelects();
        this.initVariables();
        this.generatePartsList();
    }

    initMultiSelects() {
        for (let pt of this.pParts) {
            this.productOptions.push({id: pt.nummer, name: pt.bezeichnung.toString()});
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
    }

    initArrays() {
        while (this.auftraegeWarteschl && this.auftraegeWarteschl.length > 0) {
            this.auftraegeWarteschl.pop();
        }
        while (this.auftraegeBearb && this.auftraegeBearb.length > 0) {
            this.auftraegeBearb.pop();
        }

        //Verbindliche Aufträge (Produkt 1,2,3) und Addierte Warteschlangen für Produkte 0
        for (let va of this.mockVerbindlicheAuftraege) {
            if(this.part.nummer === va.id) {
                if (!this.auftraegeVerbindl[this.part.typ + this.part.nummer + "_" + va.id]) {
                    this.auftraegeVerbindl[this.part.typ + this.part.nummer + "_" + va.id] = va.menge;
                }
                if (!this.auftraegeWarteschlAddiert[this.part.typ + this.part.nummer + "_" + va.id]) {
                    this.auftraegeWarteschlAddiert[this.part.typ + this.part.nummer + "_" + va.id] = 0;
                }
            }
        }

        //Geplanter Lagerbestand Ende der Periode(Produkt 1,2,3)
        for (let la of this.mockGeplLager) {
            if(this.part.nummer === la.id) {
                if (!this.geplLagerbestand[this.part.typ + this.part.nummer + "_" + la.id]) {
                    this.geplLagerbestand[this.part.typ + this.part.nummer + "_" + la.id] = la.menge;
                }
            }
        }

        //Aufträge in Warteschlange
        for (let workplace of this.warteschlangen.workplace) {
            if (workplace.waitinglist) {
                if (workplace.waitinglist.length !== undefined) {
                    for (let wl of workplace.waitinglist) {
                        for (let pl of this.tmp_partsList) {
                            if (pl.teil.child.nummer === Number.parseInt(wl.item)) {
                                if (this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(wl.item)]) {
                                    this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(wl.item)] += Number.parseInt(wl.amount);
                                }
                                else {
                                    this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(wl.item)] = Number.parseInt(wl.amount);
                                }
                            }
                        }
                    }
                }
                else {
                    for (let pl of this.tmp_partsList) {
                        if (pl.teil.child.nummer === Number.parseInt(workplace.waitinglist.item)) {
                            if (this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.waitinglist.item)]) {
                                this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.waitinglist.item)] += Number.parseInt(workplace.waitinglist.amount);
                            }
                            else {
                                this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.waitinglist.item)] = Number.parseInt(workplace.waitinglist.amount);
                            }
                        }
                    }
                }
            }
        }

        //Lagerbestand Vorperiode
        for (let article of this.lager.article) {
            for (let pl of this.tmp_partsList) {
                if(pl.teil.child.nummer === Number.parseInt(article.id)) {
                    if (this.isGleichTeil(article.id)) {
                        this.lagerbestandVorperiode[this.part.typ + this.part.nummer + "_" + article.id] = (article.amount / 3).toFixed(2);
                    }
                    else {
                        this.lagerbestandVorperiode[this.part.typ + this.part.nummer + "_" + article.id] = article.amount;
                    }
                }
            }
        }

        //Aufträge in Bearbeitung
        for (let workplace of this.bearbeitung.workplace) {
            for (let pl of this.tmp_partsList) {
                if (pl.teil.child.nummer === Number.parseInt(workplace.item)) {
                    if (this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.item)]) {
                        this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.item)] += Number.parseInt(workplace.amount);
                    }
                    else {
                        this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + Number.parseInt(workplace.item)] = Number.parseInt(workplace.amount);
                    }
                }
            }
        }

        //Restliche Inputs mit default Werten füllen
        for (let pl of this.tmp_partsList) {
            if (!this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer]) {
                this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer] = 0;
            }
            if (!this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer]) {
                this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer] = 0;
            }
            if (!this.geplLagerbestand[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer]) {
                this.geplLagerbestand[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer] = 0;
            }

            if (pl.parent) {
                this.auftraegeVerbindl[this.part.typ + this.part.nummer + "_" + pl.teil.child.nummer] = this.prodAuftraege[this.part.typ + this.part.nummer + "_" + pl.teil.parent.nummer];
                this.auftraegeWarteschlAddiert[this.part.typ + this.part.nummer + "_" +pl.teil.child.nummer] = this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + pl.teil.parent.nummer];
            }
            this.updateArrays(true);
        }
    }

    initVariables() {
        this.warteschlangen = this.resultObj.results.waitinglistworkstations;
        this.lager = this.resultObj.results.warehousestock;
        this.bearbeitung = this.resultObj.results.ordersinwork;
    }

    generatePartsList() {
        while (this.partsList.length > 0) {
            this.partsList.pop();
        }

        for (let pt of this.pParts) {
            this.part = pt;
            while (this.tmp_partsList && this.tmp_partsList.length > 0) {
                this.tmp_partsList.pop();
            }
            if (this.part != null) {
                this.tmp_partsList.push({produkt: this.part.nummer, teil:{child: this.part, parent: null}});

                for (let best of this.part.bestandteile) {
                    for (let pt of this.eParts) {
                        if (best._id == pt._id) {
                            this.getBestandteile(pt, this.part);
                        }
                    }
                }
                this.initArrays();
                for(let tmp of this.tmp_partsList){
                    this.partsList.push(tmp);
                }
            }
        }

    }

    getBestandteile(child, parent) {
        this.tmp_partsList.push({produkt: this.part.nummer, teil:{child: child, parent: parent}});
        if (child.bestandteile && child.bestandteile.length > 0) {
            for (let best of child.bestandteile) {
                for (let pt of this.eParts) {
                    if (best._id == pt._id) {
                        this.getBestandteile(pt, child);
                    }
                }
            }
        }
    }

    getNumber = function (num) {
        var array = Array<number>();

        for (let i = 1; i <= num; i++) {
            array.push(i);
        }
        return array;

    }

    updateArrays(isInitial) {
        var parts = [];
        if(isInitial){
            parts = this.tmp_partsList;
        }
        else{
            parts = this.partsListSingle;
        }
        for (let pt of parts) {
            this.prodAuftraege[this.part.typ + this.part.nummer + "_" + pt.teil.child.nummer] = this.sumProdAuftraege(pt.teil.child) < 0 ? 0 : this.sumProdAuftraege(pt.teil.child);
            if (pt.teil.parent) {
                this.auftraegeVerbindl[this.part.typ + this.part.nummer + "_" + pt.teil.child.nummer] = this.prodAuftraege[this.part.typ + this.part.nummer + "_" + pt.teil.parent.nummer];
                this.auftraegeWarteschlAddiert[this.part.typ + this.part.nummer + "_" + pt.teil.child.nummer] = this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + pt.teil.parent.nummer];
            }
        }
        this.sessionService.setPartOrders(this.prodAuftraege);
        this.sessionService.setPlannedWarehouseStock(this.geplLagerbestand);
    }

    sumProdAuftraege(part){
        return this.auftraegeVerbindl[this.part.typ + this.part.nummer + "_" + part.nummer] +
                this.auftraegeWarteschlAddiert[this.part.typ + this.part.nummer + "_" + part.nummer] +
                this.geplLagerbestand[this.part.typ + this.part.nummer + "_" + part.nummer] -
                this.lagerbestandVorperiode[this.part.typ + this.part.nummer + "_" + part.nummer] -
                this.auftraegeWarteschl[this.part.typ + this.part.nummer + "_" + part.nummer] -
                this.auftraegeBearb[this.part.typ + this.part.nummer + "_" + part.nummer];
    }

    isGleichTeil(nummer){
        var num = Number.parseInt(nummer);
        return num === 16 || num === 17 || num === 26;
    }
    filterList(){
        for(let pt of this.pParts){
            if(pt.nummer === Number.parseInt(this.auswahl)){
                this.part = pt;
            }
        }
        this.partsListSingle = this.partsList.filter(item => item.produkt == this.part.nummer);
    }

}