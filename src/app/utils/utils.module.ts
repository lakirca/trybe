import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModules} from './material.module';
import {MsigStepsComponent} from './components/msig-steps/msig-steps.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [MsigStepsComponent],
  imports: [
    CommonModule,
    MaterialModules,
    ReactiveFormsModule,
    FormsModule,
    
  ],
  exports: [
    MaterialModules,
    MsigStepsComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  entryComponents: [
    MsigStepsComponent
  ]
})
export class UtilsModule {
}