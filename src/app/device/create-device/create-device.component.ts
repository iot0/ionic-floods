import { Component, OnInit } from "@angular/core";
import { Device } from "src/app/shared/models/device";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { ThemeService } from "src/app/shared/services/theme.service";
import { DeviceService } from "src/app/shared/services/device.service";
import { ActivatedRoute } from "@angular/router";
import { tap, map } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-create-device",
  templateUrl: "./create-device.component.html",
  styleUrls: ["./create-device.component.scss"]
})
export class CreateDeviceComponent {
  createForm: FormGroup;
  editMode$;
  editData$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private deviceService: DeviceService,
    private route: ActivatedRoute
  ) {
    this.initForm();
    this.editMode$ = this.route.data.pipe(
      map(data => {
        return data ? data.deviceInfo : null;
      }),
      tap(data => {
        if (data) {
          console.log(data);
          // patch form
          this.patchForm(data);
        }
      }),
      map(x => !!x)
    );
  }

  initForm() {
    this.createForm = this.fb.group({
      id: [null],
      name: ["", Validators.required],
      latlng: ["", Validators.required],
      address: ["", Validators.required],
      ip: ["", Validators.required],
      threshold: [30, Validators.required]
    });
  }

  patchForm(data: Device) {
    this.createForm.patchValue({
      id: data.id,
      name: data.name,
      latlng: data.latlng,
      address: data.address,
      ip: data.ip,
      threshold: data.threshold
    });
  }

  onLocationSelect(location) {
    if (location) {
      this.createForm.get("latlng").setValue(JSON.stringify(location));
    }
  }

  setTestLatLng() {
    this.createForm.get("latlng").setValue(JSON.stringify({ lat: 8.73346445841655, lng: 76.72493246854378 }));
  }
  prepareSaveInfo(): Device {
    const formModel = this.createForm.value;
    let id = formModel.id ? { id: formModel.id } : {};
    let data: Device = {
      ...id,
      name: formModel.name,
      address: formModel.address,
      latlng: formModel.latlng,
      ip: formModel.ip,
      threshold: formModel.threshold
    };
    return data;
  }

  async onSubmit() {
    if (this.createForm.valid) {
      await this.themeService.progress(true);
      let data = this.prepareSaveInfo();

      try {
        let existing: Device[] = await this.deviceService.getDeviceByIp(data.ip).toPromise();

        if (existing.length > 0 && existing[0].id !== data.id) {
          this.themeService.alert("Info", "This ip already registered.");
          return;
        }

        if (data.id) {
          await this.deviceService.updateDevice(data).toPromise();
        } else {
          await this.deviceService.addDevice(data).toPromise();
        }

        this.themeService.alert("Success", "Device Info saved Successfully");
      } catch (err) {
        this.themeService.alert("Error", "Sorry, Something went wrong, please check network connection.");
      } finally {
        await this.themeService.progress(false);
      }
    } else {
      this.themeService.alert("Fields Missing", "All Fields are necessary.");
    }
  }
}
