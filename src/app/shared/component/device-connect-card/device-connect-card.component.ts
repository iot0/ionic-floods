import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, Output, EventEmitter } from "@angular/core";
import { Device } from "../../models/device";
import { catchError, takeWhile } from "rxjs/operators";
import { DeviceService } from "../../services/device.service";
import { BehaviorSubject } from "rxjs";
import { ModalController } from "@ionic/angular";
import { CreateNotificationComponent } from "../create-notification/create-notification.component";

@Component({
  selector: "device-connect-card",
  templateUrl: "./device-connect-card.component.html",
  styleUrls: ["./device-connect-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceConnectCardComponent implements OnInit, OnDestroy {
  @Output("alert") onAlert: EventEmitter<any> = new EventEmitter<any>();

  data$: BehaviorSubject<any> = new BehaviorSubject({ notConnected: true });
  isAlive: boolean = true;
  clearTimeout;
  ngOnDestroy(): void {
    this.isAlive = false;
  }

  @Input() device: Device;

  constructor(private deviceService: DeviceService, private modalCtrl: ModalController) {}

  ngOnInit() {}

  onConnect() {
    if (this.clearTimeout) {
      clearTimeout(this.clearTimeout);
    }

    this.data$.next({ loading: true });
    this.clearTimeout = setTimeout(() => {
      this.deviceService
        .sync(this.device.ip)
        .pipe(
          catchError(err => {
            this.data$.next({ error: true });
            return err;
          }),
          takeWhile(() => this.isAlive)
        )
        .subscribe(res => {
          if (res) {
            this.onDeviceData(res);

            console.log(res);
          }
        });
    }, 3000);
  }

  onDeviceData(data) {
    let notification = false;

    if (data.ultraSonic && data.ultraSonic > this.device.threshold) {
      notification = true;
    }
    
    this.onAlert.emit(notification);
    this.data$.next({ data, notification });
  }

  async onCreateNotification() {
    const modal = await this.modalCtrl.create({
      component: CreateNotificationComponent,
      componentProps: { device: this.device }
    });
    return await modal.present();
  }
}
