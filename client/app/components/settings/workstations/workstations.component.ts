/**
 * Created by Paddy on 11.11.2016.
 */
import {Component, ViewChild} from '@angular/core';
import {Workstation} from '../../../model/workstastion';
import {WorkstationService} from '../../../services/workstation.service';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    moduleId: module.id,
    selector: 'workstations',
    templateUrl: 'workstations.component.html'
})
export class WorkstationsComponent {
    @ViewChild('modalWsExists')
    modalWsExists: ModalComponent;
    @ViewChild('modalWsEmpty')
    modalWsEmpty: ModalComponent;

    workstations: Workstation[];
    workstation: Workstation = new Workstation();

    constructor(private workstationService: WorkstationService) {
        this.workstationService.getWorkstations()
            .subscribe(workstations => {
                this.workstations = workstations;
            })
    }

    deleteWorkstation(workstation) {
        var workstations = this.workstations;

        this.workstationService.deleteWorkstation(workstation._id)
            .subscribe((data => {
                if (data.n == 1) {
                    for (var i = 0; i < workstations.length; i++) {
                        if (workstations[i]._id == workstation._id) {
                            workstations.splice(i, 1);
                        }
                    }
                }
            }))
    }

    updateWorkstation(event) {
        event.preventDefault();
        var workstations = this.workstations;
        var bereitsVorhanden = false;

        for(let ws of workstations){
            if (ws.nummer == this.workstation.nummer && ws._id != this.workstation._id){
                bereitsVorhanden = true;
            }
        }
        if(!bereitsVorhanden) {
            if (!this.workstation._id) {
                var newWorkstation = {
                    nummer: this.workstation.nummer,
                    name: this.workstation.name
                }
                if(newWorkstation.nummer != null && newWorkstation.name != null){
                    this.workstationService.addWorkstation(newWorkstation)
                        .subscribe(workstation => {
                            this.workstations.push(workstation);
                            this.resetWorkstation();
                        });
                }
                else{
                    this.modalWsEmpty.open();
                }


            }
            else {
                this.workstationService.updateWorkstation(this.workstation)
                    .subscribe(data => {
                        if (data.n == 1) {
                            for (var i = 0; i < workstations.length; i++) {
                                if (workstations[i]._id == this.workstation._id) {
                                    workstations[i] = this.workstation;
                                }
                            }
                        }
                        this.resetWorkstation();
                    });
            }
        }
        else {
            this.modalWsExists.open();
        }
    }

    resetWorkstation(){
        this.workstation = {_id: null, nummer: null, name: null};
    }

    setWorkstation(ws){
        this.workstation = ws;
    }
}