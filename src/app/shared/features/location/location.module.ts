import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationModalComponent } from './location-modal.component';
import { IonicModule } from '@ionic/angular';
import { LocationDirective } from './location.directive';
import { NgxMapModule } from 'ngx-map';
import { LocationService } from './location.service';

@NgModule({
  declarations: [LocationModalComponent,LocationDirective],
  providers:[LocationService],
  imports: [
    CommonModule,
    IonicModule,
    NgxMapModule
  ],
  exports:[LocationModalComponent,LocationDirective],
  entryComponents:[LocationModalComponent]
})
export class LocationModule { }
