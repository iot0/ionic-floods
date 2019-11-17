import { Component, OnInit, ChangeDetectionStrategy, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ThemeService } from "../../services/theme.service";
import { NotificationService } from "../../services/notification.service";
import { FloodNotification } from "../../models/notification";
import { Device } from "../../models/device";

@Component({
  selector: "app-create-notification",
  templateUrl: "./create-notification.component.html",
  styleUrls: ["./create-notification.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNotificationComponent implements OnInit {
  @Input() device: Device;

  createForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createForm = this.fb.group({
      message: ["", Validators.required],
      latlng: [this.device.latlng, Validators.required]
    });
  }

  prepareSaveInfo(): FloodNotification {
    const formModel = this.createForm.value;
    let data: FloodNotification = {
      message: formModel.message,
      latlng: formModel.latlng
    };
    return data;
  }

  async onSubmit() {
    if (this.createForm.valid) {
      await this.themeService.progress(true);
      let data = this.prepareSaveInfo();

      try {
        await this.notificationService.createNotification(data).toPromise();

        this.themeService.alert("Success", "Notification created Successfully");
        this.onClose();
      } catch (err) {
        this.themeService.alert("Error", "Sorry, Something went wrong, please check network connection.");
      }

      await this.themeService.progress(false);
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
