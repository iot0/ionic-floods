import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DrawerComponent } from "./drawer/drawer.component";
import { DeviceConnectComponent } from "./device-connect/device-connect.component";
import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { DeviceConnectCardComponent } from "./device-connect-card/device-connect-card.component";
import { CreateNotificationComponent } from "./create-notification/create-notification.component";
import { ReactiveFormsModule } from "@angular/forms";
import { LocationModule } from "../features";

@NgModule({
  declarations: [DrawerComponent, DeviceConnectComponent, DeviceConnectCardComponent, CreateNotificationComponent],
  imports: [CommonModule, IonicModule, RouterModule, ReactiveFormsModule, LocationModule],
  exports: [DrawerComponent, DeviceConnectComponent, DeviceConnectCardComponent, CreateNotificationComponent],
  entryComponents: [CreateNotificationComponent]
})
export class ComponentModule {}
