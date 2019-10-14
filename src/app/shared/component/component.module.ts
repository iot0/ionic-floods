import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DrawerComponent } from "./drawer/drawer.component";
import { DeviceConnectComponent } from "./device-connect/device-connect.component";
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DrawerComponent, DeviceConnectComponent],
  imports: [CommonModule,IonicModule,RouterModule],
  exports: [DrawerComponent, DeviceConnectComponent]
})
export class ComponentModule {}
