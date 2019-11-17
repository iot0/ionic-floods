import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";
import { switchMap, shareReplay } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root"
})
export class SubscriptionsService {
  collection: string = "Subscriptions";

  isSubscribed$: Observable<any>;

  constructor(private firebase: FirebaseService, private auth: AuthService) {
    this.isSubscribed$ = this.auth.user$.pipe(
      switchMap(u => {
        return u ? this.get(u.uid) : of(false);
      }),
      shareReplay(1)
    );
  }

  add(uid: string, token: string) {
    return this.firebase.set(this.collection, uid, { token });
  }

  get(uid: string) {
    return this.firebase.getDocument(this.collection, uid);
  }

  remove(uid) {
    return this.firebase.delete(this.collection, uid);
  }
}
