import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, Router } from "@angular/router";
import { Observable } from "rxjs";
import { DeviceService } from "src/app/shared/services/device.service";
import { Device } from "src/app/shared/models/device";
import { tap, take } from "rxjs/operators";
import { ThemeService } from "src/app/shared/services/theme.service";

@Injectable({
  providedIn: "root"
})
export class DeviceResolver implements Resolve<Device> {
  constructor(private device: DeviceService, private themeService: ThemeService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    console.count("[DeviceResolver] edit");
    return this.device.getDeviceById(route.paramMap.get("id")).pipe(
      take(1),
      tap(x => {
        if (!x) {
          this.router.navigate(["/device/view"]).then(() => {
            this.themeService.toast("Invalid Device");
          });
        }
      })
    );
  }
}
