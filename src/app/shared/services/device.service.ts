import { Injectable } from "@angular/core";
import { timer, of } from "rxjs";
import { switchMap, shareReplay } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class DeviceService {
  constructor(private http: HttpClient) {}

  sync(ip) {
    return this.startTimer(ip);
  }

  startTimer(ip: string) {
    return timer(0, 2000).pipe(
      switchMap(x => {
        return this.http.get(`http://${ip}/status`);
        // return of(true);
      }),
      shareReplay()
    );
  }
}
