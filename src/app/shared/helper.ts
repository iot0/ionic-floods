import { NgZone } from "@angular/core";
import { Observable } from "rxjs";

export function generatePassword(date, email) {
  let username = email.split("@")[0];
  const dob = new Date(date);
  return `${dob.getFullYear()}-${dob.getMonth() + 1}-${dob.getDate()}-${username}`;
}

export function convertToBoolProperty(val: any): boolean {
  if (typeof val === "string") {
    val = val.toLowerCase().trim();

    return val === "true" || val === "";
  }

  return !!val;
}

export const runOutsideAngular = (zone: NgZone) => <T>(obs$: Observable<T>): Observable<T> => {
  return new Observable<T>(subscriber => {
    return zone.runOutsideAngular(() => {
      runInZone(zone)(obs$).subscribe(subscriber);
    });
  });
};

export const runInZone = (zone: NgZone) => <T>(obs$: Observable<T>): Observable<T> => {
  return new Observable<T>(subscriber => {
    return obs$.subscribe(
      value => zone.run(() => subscriber.next(value)),
      error => zone.run(() => subscriber.error(error)),
      () => zone.run(() => subscriber.complete())
    );
  });
};
