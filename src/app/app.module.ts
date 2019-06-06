import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { DialogModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';

import { GridEditFormComponent } from './edit-form.component';
import { EditService } from './edit.service';
import { AppComponent } from './app.component';

import { NgModule, Compiler, COMPILER_OPTIONS, CompilerFactory } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
export function createCompiler(compilerFactory: CompilerFactory) {
    return compilerFactory.createCompiler();
}

@NgModule({
    declarations: [
        GridEditFormComponent,
        AppComponent
    ],
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
        },
        { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
        { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] },
        { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
