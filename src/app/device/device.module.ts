import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";

import { CreateDeviceComponent } from "./create-device/create-device.component";
import { ViewDeviceComponent } from "./view-device/view-device.component";
import { LocationModule } from "../shared";
import { DeviceResolver } from "./create-device/device-resolver";

const routes: Routes = [
  { path: "", redirectTo: "view", pathMatch: "full" },
  {
    path: "create",
    component: CreateDeviceComponent
  },
  {
    path: "edit/:id",
    component: CreateDeviceComponent,
    resolve: {
      deviceInfo:DeviceResolver
    }
  },
  {
    path: "view",
    component: ViewDeviceComponent
  }
];

@NgModule({
  imports: [LocationModule, CommonModule, ReactiveFormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [CreateDeviceComponent, ViewDeviceComponent]
})
export class DevicePageModule {}
