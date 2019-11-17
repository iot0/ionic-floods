import { Injectable } from "@angular/core";
import { timer, of, Observable } from "rxjs";
import { switchMap, shareReplay, catchError } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { Device } from "../models/device";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class DeviceService {
  collection: string = "Devices";

  constructor(private http: HttpClient, private firebase: FirebaseService) {}

  sync(ip) {
    return this.startTimer(ip);
  }

  startTimer(ip: string) {
    return timer(0, 2000).pipe(
      switchMap(x => {
        return this.http.get(`http://${ip}/status`);
        // return of({ value: 30 });
      }),
      shareReplay()
    );
  }
  addDevice(device: Device) {
    return this.firebase.add(this.collection, device);
  }

  updateDevice(device: Device) {
    return this.firebase.set(this.collection, device.id, device);
  }

  getDeviceByIp(ip: string): Observable<any> {
    return this.firebase
      .load(`${this.collection}`, q => {
        return q.where("ip", "==", ip).limit(1);
      })
      .pipe(
        catchError(err => {
          return err;
        })
      );
  }

  getDeviceById(id: string): Observable<any> {
    return this.firebase.getDocument(this.collection, id);
  }

  getAllDevices() {
    return this.firebase
      .load(`${this.collection}`, q => {
        return q.limit(30);
      })
      .pipe(
        catchError(err => {
          return err;
        })
      );
  }
}
