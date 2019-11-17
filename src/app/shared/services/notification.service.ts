import { Injectable, NgZone } from "@angular/core";
import { Subscription, Observable, of } from "rxjs";
import { FirebaseService } from "./firebase.service";
import { FloodNotification } from "../models/notification";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { AuthService } from "./auth.service";
import { SubscriptionsService } from "./subscriptions.service";
import { runOutsideAngular } from "../helper";

@Injectable({
  providedIn: "root"
})
export class NotificationService {
  notificationsCollection: string = "Notifications";

  watchTokenSubscription: Subscription;
  token: string;

  constructor(
    private firebase: FirebaseService,
    private authService: AuthService,
    private subscription: SubscriptionsService,
    private zone: NgZone
  ) {
    this.onTokenRefresh().subscribe(() => {
      console.count("[onTokenRefresh] Subscribe");
    });
  }

  subscribeForNotifications(uid: string) {
    return this.requestPermission().pipe(
      switchMap(x => {
        console.count("[requestPermission switchMap]");
        console.log(x);
        // if permission granted
        if (x) {
          return this.requestToken();
        }
        return of(false);
      }),
      switchMap((token: string) => {
        // if permission granted
        if (token) {
          return this.updateUserToken(uid, token).pipe(
            tap(() => {
              // if permission granted
              return this.authService.refreshUserData(uid);
            })
          );
        }
        return of(false);
      })
    );
  }

  unsubscribeFromNotifications(uid: string) {
    console.count("[unsubscribeFromNotifications]");
    return this.subscription.get(uid).pipe(
      switchMap(sub => this.deleteToken(sub.token)),
      switchMap(() => this.deleteUserToken(uid)),
      tap(() => {
        // if permission granted
        return this.authService.refreshUserData(uid);
      })
    );
  }

  private updateUserToken(uid: string, token: string) {
    return this.subscription.add(uid, token);
  }

  private deleteUserToken(uid: string) {
    return this.subscription.remove(uid);
  }

  private requestToken() {
    console.count("[requestToken]");
    return this.firebase.messaging$.pipe(
      switchMap(messaging => {
        console.count("[requestToken] messaging");
        return new Observable(obs => {
          messaging
            .getToken()
            .then(refreshedToken => {
              console.log("Token refreshed.");
              console.log(refreshedToken);

              obs.next(refreshedToken);
              // Indicate that the new Instance ID token has not yet been sent to the
              // app server.
            })
            .catch(err => {
              obs.error(err);
              console.log("Unable to retrieve refreshed token ", err);
            });
        });
      })
    );
  }

  private onTokenRefresh() {
    console.count("[onTokenRefresh]");
    return this.firebase.messaging$.pipe(
      switchMap(messaging => {
        return new Observable(obs => {
          messaging.onTokenRefresh(() => {
            messaging
              .getToken()
              .then(refreshedToken => {
                console.log("Token refreshed.");
                console.log(refreshedToken);

                obs.next(refreshedToken);
                // Indicate that the new Instance ID token has not yet been sent to the
                // app server.
              })
              .catch(err => {
                obs.error(err);
                console.log("Unable to retrieve refreshed token ", err);
              });
          });
        });
      })
    );
  }

  private requestPermission() {
    console.count("[requestPermission]");
    return new Observable(obs => {
      console.log("Requesting permission...");
      // [START request_permission]
      Notification.requestPermission()
        .then(permission => {
          if (permission === "granted") {
            console.log(permission);
            console.log("Notification permission granted.");
            obs.next(true);
          } else {
            console.log("Unable to get permission to notify.");
            obs.next(false);
          }
        })
        .catch(err => {
          obs.error(err);
        })
        .finally(() => {
          obs.complete();
        });
      // [END request_permission]
    });
  }

  messages$ = this.firebase.messaging$.pipe(
    switchMap(messaging => new Observable(messaging.onMessage.bind(messaging)))
    // runOutsideAngular(this.zone)
  );

  private deleteToken(token: string) {
    console.log("[deleteToken]", token);
    return this.firebase.messaging$.pipe(
      switchMap(messaging => {
        return new Observable(obs => {
          messaging
            .deleteToken(token)
            .then(() => {
              console.log("Token deleted.");
              obs.next(true);
            })
            .catch(err => {
              console.log("Unable to delete token. ", err);
              obs.next(false);
            });
        });
      })
    );
  }

  createNotification(notification: FloodNotification) {
    return this.firebase.add(this.notificationsCollection, notification);
  }

  getAllNotifications() {
    return this.firebase
      .load(`${this.notificationsCollection}`, q => {
        return q.orderBy("createdAt", "desc").limit(20);
      })
      .pipe(
        catchError(err => {
          return err;
        })
      );
  }
}
