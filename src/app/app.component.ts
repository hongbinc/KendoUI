import { Observable } from 'rxjs/Observable';

import {
    Component, ViewChild, OnDestroy,
    AfterContentInit, ComponentFactoryResolver,
    Input, Compiler, ViewContainerRef, NgModule,
    NgModuleRef, Injector, Injectable, OnInit, Inject
} from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Product } from './model';
import { EditService } from './edit.service';

import { map } from 'rxjs/operators/map';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';

import { GridEditFormComponent } from './edit-form.component';

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements AfterContentInit, OnDestroy {

    @ViewChild('dynamicComponent', { read: ViewContainerRef }) _container: ViewContainerRef;

    private cmpRef;

    constructor(

        private componentFactoryResolver: ComponentFactoryResolver,
        private compiler: Compiler,
        private _injector: Injector,
        private _m: NgModuleRef<any>
    ) {

    }

    ngAfterContentInit() {
        this.addComponent();
    }

    ngOnDestroy() {
        //Always destroy the dynamic component
        //when the parent component gets destroyed
        if (this.cmpRef) {
            this.cmpRef.destroy();
        }
    }

    private addComponent() {
        let template = ` 
        <kendo-grid [data]="view | async" [height]="533" [pageSize]="gridState.take" [skip]="gridState.skip"
            [sort]="gridState.sort" [pageable]="true" [sortable]="true" (dataStateChange)="onStateChange($event)"
            (edit)="editHandler($event)" (remove)="removeHandler($event)" (add)="addHandler($event)">
            <ng-template kendoGridToolbarTemplate>
                <button kendoGridAddCommand>Add new</button>
            </ng-template>
            <kendo-grid-column field="ProductName" title="Product Name"></kendo-grid-column>
            <kendo-grid-column field="UnitPrice" title="Price"></kendo-grid-column>
            <kendo-grid-column field="Discontinued" title="Discontinued"></kendo-grid-column>
            <kendo-grid-column field="UnitsInStock" title="Units In Stock"></kendo-grid-column>
            
            <kendo-grid-command-column title="command" width="220">
                <ng-template kendoGridCellTemplate>
                    <button kendoGridEditCommand [primary]="true">Edit</button>
                    <button kendoGridRemoveCommand>Delete</button>
                </ng-template>
            </kendo-grid-command-column>
        </kendo-grid>
        <kendo-grid-edit-form [model]="editDataItem" [isNew]="isNew"
          (save)="saveHandler($event)"
          (cancel)="cancelHandler()">
        </kendo-grid-edit-form>
        `;



        @Component({
            template: template
            // styleUrls: ['./dynamic.component.css']
        })
        class DynamicComponent implements OnInit {
            public view: Observable<GridDataResult>;
            public gridState: State = {
                sort: [],
                skip: 0,
                take: 10
            };

            public editDataItem: Product;
            public isNew: boolean;

            private editService: EditService;

            constructor(@Inject(EditService) editServiceFactory: any) {
                this.editService = editServiceFactory();
            }

            public ngOnInit(): void {
                this.view = this.editService.pipe(map(data => process(data, this.gridState)));

                this.editService.read();
            }


            public onStateChange(state: State) {
                this.gridState = state;

                this.editService.read();
            }

            public addHandler() {
                this.editDataItem = new Product();
                this.isNew = true;
            }

            public editHandler({ dataItem }) {
                console.log("Edit item", dataItem);
                this.editDataItem = dataItem;
                this.isNew = false;
            }

            public cancelHandler() {
                this.editDataItem = undefined;
            }

            public saveHandler(product: Product) {
                this.editService.save(product, this.isNew);

                this.editDataItem = undefined;
            }

            public removeHandler({ dataItem }) {
                console.log("Remove item", dataItem);
                this.editService.remove(dataItem);
            }
        }

        @NgModule({
            imports: [
                HttpClientModule,
                HttpClientJsonpModule,
                BrowserModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                GridModule,
                DialogModule
            ],
            providers: [
                {
                    deps: [HttpClient],
                    provide: EditService,
                    useFactory: (jsonp: HttpClient) => () => new EditService(jsonp)
                }
            ],
            declarations: [DynamicComponent, GridEditFormComponent]
        })
        class DynamicComponentModule { }

        const mod = this.compiler.compileModuleAndAllComponentsSync(DynamicComponentModule);
        const factory = mod.componentFactories.find((comp) =>
            comp.componentType === DynamicComponent
        );
        this._container.createComponent(factory);
    }
}
