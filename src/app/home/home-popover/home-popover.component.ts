import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";
import { NotificationService } from "src/app/shared/services/notification.service";
import { take, switchMap, takeWhile, shareReplay } from "rxjs/operators";
import { of, Observable } from "rxjs";
import { User } from "src/app/shared/models/user";
import { SubscriptionsService } from "src/app/shared/services/subscriptions.service";

@Component({
  selector: "app-home-popover",
  templateUrl: "./home-popover.component.html",
  styleUrls: ["./home-popover.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePopoverComponent implements OnInit, OnDestroy {
  @Input("dismiss") dismiss;
  isAlive: boolean = true;

  constructor(
    private router: Router,
    public auth: AuthService,
    private notificationService: NotificationService,
    public subscriptions: SubscriptionsService
  ) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  onLogin() {
    this.dismiss();
    this.router.navigate(["/login"]);
  }

  onDevices() {
    this.dismiss();
    this.router.navigate(["/device/view"]);
  }

  onLogout() {
    this.dismiss();
    this.auth.signOut();
  }

  onSubscribe() {
    console.count("[onSubscribe]");

    this.auth.user$
      .pipe(
        take(1),
        switchMap(user => {
          console.count("[onSubscribe] switchMap");
          let uid = user ? user.uid : null;
          return uid ? this.notificationService.subscribeForNotifications(uid) : of(false);
        })
      )
      .subscribe(res => {
        console.count("[onSubscribe] subscribe");
        console.log(res);
      });
  }

  onUnSubscribe() {
    console.count("[onUnSubscribe]");
    this.auth.user$
      .pipe(
        take(1),
        switchMap((user: User) => {
          console.log(user);
          console.count("[onUnSubscribe] switchMap");
          let uid = user ? user.uid : null;
          return (uid ? this.notificationService.unsubscribeFromNotifications(uid) : of(false)) as any;
        })
      )
      .subscribe(res => {
        console.count("[onUnSubscribe] subscribe");
        console.log(res);
      });
  }
}
