import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./shared/guard/auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", loadChildren: () => import("./home/home.module").then(m => m.HomePageModule) },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then(m => m.LoginPageModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard]
  },
  { path: "device", loadChildren: () => import("./device/device.module").then(m => m.DevicePageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
