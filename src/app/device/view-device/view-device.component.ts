import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DeviceService } from "src/app/shared/services/device.service";
import { ActivatedRoute } from "@angular/router";
import { ThemeService } from "src/app/shared/services/theme.service";
import { catchError, takeWhile } from "rxjs/operators";

@Component({
  selector: "app-view-device",
  templateUrl: "./view-device.component.html",
  styleUrls: ["./view-device.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewDeviceComponent implements OnInit {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  isAlive: boolean = true;
  constructor(public deviceService: DeviceService) {
     this.loadDetails();
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  loadDetails() {
    this.deviceService
      .getAllDevices()
      .pipe(
        catchError(err => {
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res && res.length > 0) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
      });
  }
}
