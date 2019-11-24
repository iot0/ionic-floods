import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, OnChanges } from "@angular/core";
import { DrawerComponent } from "../drawer/drawer.component";
import { of, BehaviorSubject, Observable, combineLatest } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { User } from "../../models/user";
import { LoadingController } from "@ionic/angular";
import { take, catchError, takeWhile, tap, filter, map } from "rxjs/operators";
import { DeviceService } from "../../services/device.service";
import { AudioService } from "../../services/audio.service";
import { FIREBASE_CONFIG } from "src/firebase";

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
  alarmKey: string = "alarm";
  isMuted: boolean = false;
  alert$: BehaviorSubject<any> = new BehaviorSubject({});
  data$: BehaviorSubject<any> = new BehaviorSubject({ empty: true });
  header$: Observable<any>;

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

  @Input("uid") userId: string;

  isOpened: boolean;
  isAlive: boolean = true;

  constructor(
    private auth: AuthService,
    public loadingController: LoadingController,
    private deviceService: DeviceService,
    private audioService: AudioService
  ) {
    this.header$ = combineLatest([this.data$, this.alert$]).pipe(
      map(datas => {
        let data = null;
        if (datas[1] && datas[1].alert && !datas[1].muted) {
          data = datas[1];
        } else {
          data = datas[0];
        }
        return data;
      })
    );
  }

  ngOnInit() {
    if (this.drawer) {
      this.drawer.onChange.subscribe(change => {
        this.onDrawerStateChange(change);
      });
    }
    this.loadDevices();

    this.audioService.preload(this.alarmKey, "/assets/alarm.mp3");

    this.onAlert(false);

    this.alert$.pipe(takeWhile(() => this.isAlive)).subscribe(res => {
      if (res.alert && !res.muted) {
        this.audioService.play(this.alarmKey);
      } else {
        this.audioService.stop(this.alarmKey);
      }
    });
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {}

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

  loadDevices() {
    this.onDashboardLoading();

    this.deviceService
      .getAllDevices()
      .pipe(
        catchError(err => {
          this.onDashboardError(err);
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe((res: any) => {
        console.log(res);

        if (res && res.length > 0) {
          this.onDashboardData(res);
        } else this.onDashboardEmpty();
      });
  }

  onDashboardLoading() {
    this.data$.next({ loading: true, message: "Loading...", icon: "pulse", color: "primary" });
  }
  onDashboardData(data) {
    this.data$.next({ message: "Device Dashboard", data, icon: "logo-codepen", color: "dark" });
  }
  onDashboardError(err) {
    this.data$.next({ message: "Loading Error", error: true, icon: "alert", color: "danger" });
  }
  onDashboardEmpty() {
    this.data$.next({ message: "No Devices", empty: true, icon: "add", color: "secondary" });
  }

  onDashboardAlert(notification) {
    this.onAlert(notification);
  }

  onAlertToggle() {
    this.isMuted = !this.isMuted;
    this.onAlert(false);
  }

  onAlert(enable: boolean = false) {
    let { alert, muted } = this.alert$.value;

    if (alert === enable && muted === this.isMuted) return;

    this.alert$.next({
      icon: this.isMuted ? "notifications-off" : "notifications",
      color: "warning",
      alert: enable,
      muted: this.isMuted,
      message: "Alert"
    });
  }

  // testPush() {
  //   var key = FIREBASE_CONFIG.messagingPublicKey;
  //   var to =
  //     "e0HRxL9YkI7aBJ6Bh8e4NX:APA91bF-X0UyWflR32-EMdlCEvH63RGePyfdoCOz1gKvH7eG85KJfv5_q1qjEN0DuYIRq7gkdhqSF9NUOKt-_1Ent7-nyPkPUP7oXu-N8tDCbRmsfaQufRWIGA12XCklXz3Mj73Q0qOb";
  //   var notification = {
  //     title: "Portugal vs. Denmark",
  //     body: "5 to 1"
  //   };

  //   fetch("https://fcm.googleapis.com/fcm/send", {
  //     method: "POST",
  //     headers: {
  //       Authorization: "key=" + key,
  //       "Content-Type": "application/json"
  //     },
  //     body: JSON.stringify({
  //       to: to,
  //       notification: notification,
  //       data: {
  //         message: "example"
  //       }
  //     })
  //   })
  //     .then(function(response) {
  //       console.log(response);
  //       response.json().then(function(result) {
  //         console.log(result);
  //       });
  //     })
  //     .catch(function(error) {
  //       console.error(error);
  //     });
  // }
}
