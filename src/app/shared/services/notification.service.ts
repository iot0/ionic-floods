import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";
import { FirebaseService } from "./firebase.service";

@Injectable({
  providedIn: "root"
})
export class NotificationService {
  tokenCollection: string = "fcmTokens";
  watchTokenSubscription: Subscription;
  token: string;
  constructor(private firebaseService: FirebaseService) {}

  private updateToken(token: string) {
    // this.auth.user.pipe(take(1)).subscribe(user => {
    //   console.count(`${user}`);
    //   if (!user) return;
    //   // update to database
    //   this.firestoreService.upsert(`${this.tokenCollection}/${user.uid}`, { token: token });
    // });
  }

  requestPermission() {
    // if (this.watchTokenSubscription) this.watchTokenSubscription.unsubscribe();
    // this.watchTokenSubscription = this.afMessaging.requestToken
    //   .pipe(
    //     mergeMapTo(this.afMessaging.tokenChanges),
    //     filter(x => x != this.token),
    //     tap(token => (this.token = token)),
    //     catchError(err => {
    //       return err;
    //     })
    //   )
    //   .subscribe((token: any) => {
    //     console.log(token);
    //     if (token) {
    //       this.updateToken(token);
    //     }
    //   });
  }

  receiveMessage() {
    // return this.afMessaging.messages.pipe(share());
  }

  deleteToken(useruid) {
    // this.afMessaging.getToken.pipe(mergeMap(token => this.afMessaging.deleteToken(token))).subscribe(token => {
    //   this.firestoreService.delete(`${this.tokenCollection}/${useruid}`);
    //   console.log("Deleted!");
    // });
  }
  getSubscription(useruid) {
    // return this.firestoreService.doc$(`${this.tokenCollection}/${useruid}`);
  }
}
