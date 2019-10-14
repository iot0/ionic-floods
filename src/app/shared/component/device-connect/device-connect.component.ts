import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, OnChanges } from "@angular/core";
import { DrawerComponent } from "../drawer/drawer.component";
import { of, BehaviorSubject } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/user";
import { LoadingController } from "@ionic/angular";
import { take, catchError, takeWhile } from "rxjs/operators";
import { DeviceService } from "../../services/device.service";

@Component({
  selector: "app-device-connect",
  templateUrl: "./device-connect.component.html",
  styleUrls: ["./device-connect.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceConnectComponent implements OnInit, OnDestroy, OnChanges {
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  user: User;

  data$: BehaviorSubject<any> = new BehaviorSubject({ empty: true });

  defaultThreshold = {
    minTemp: 22,
    maxTemp: 25,
    minHeartRate: 68,
    maxHeartRate: 73,
    minPressure: 85,
    maxPressure: 90
  };
  @Input("drawer")
  drawer: DrawerComponent;

  @Input("deviceIp") ip: string;
  @Input("uid") userId: string;

  isOpened: boolean;
  isAlive: boolean = true;

  constructor(private auth: AuthService, public loadingController: LoadingController, private deviceService: DeviceService) {}

  ngOnInit() {
    if (this.drawer) {
      this.drawer.onChange.subscribe(change => {
        this.onDrawerStateChange(change);
      });
    }
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (this.ip) this.onDeviceSetup();
    else this.onDeviceInit();
  }

  //TODO: To show arrow accordingly for customer popup
  onDrawerStateChange(change) {
    switch (change) {
      case "opened":
        this.isOpened = true;
        break;
      case "closed":
        this.isOpened = false;
        break;
    }
  }

  async onAddingDevice(newIp) {
    const loading = await this.loadingController.create({
      message: "Saving device info"
    });
    await loading.present();

    await this.auth.addDeviceIp(this.userId, newIp).toPromise();

    this.auth.refreshUserData(this.userId);

    await loading.dismiss();
  }

  onConnect() {
    this.onDeviceConnecting();
    setTimeout(() => {
      this.deviceService
        .sync(this.ip)
        .pipe(
          catchError(err => {
            this.onDeviceError(err);
            return err;
          }),
          takeWhile(() => this.isAlive)
        )
        .subscribe(res => {
          this.onDeviceData(res);
          console.log(res);
        });
    }, 3000);
  }

  onDeviceConnecting() {
    this.data$.next({ loading: true, message: "Device Connecting...", icon: "pulse", color: "primary" });
  }
  onDeviceData(data) {
    this.data$.next({ message: "Device Connected", data, icon: "logo-codepen", color: "success" });
  }
  onDeviceError(err) {
    this.data$.next({ message: "Device Error", error: true, icon: "alert", color: "danger" });
  }
  onDeviceInit() {
    this.data$.next({ message: "Setup Device", init: true, icon: "cog", color: "secondary" });
  }
  onDeviceSetup() {
    this.data$.next({ message: "Connect Device", empty: true, icon: "wifi", color: "warning" });
  }
}
