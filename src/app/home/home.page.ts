import { Component, OnInit } from "@angular/core";
import { AuthService } from "../shared/services/auth.service";
import { NotificationService } from "../shared/services/notification.service";
import { AlertController, PopoverController } from "@ionic/angular";
import { HomePopoverComponent } from "./home-popover/home-popover.component";
import { catchError, takeWhile } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage implements OnInit {
  data$: BehaviorSubject<any> = new BehaviorSubject({ loading: true });
  currentPopover;
  drawerOptions: any;
  isAlive: boolean = true;

  date= new Date();

  constructor(
    public alertController: AlertController,
    public auth: AuthService,
    private notificationService: NotificationService,
    public popoverController: PopoverController
  ) {
    this.drawerOptions = {
      handleHeight: 50,
      thresholdFromBottom: 200,
      thresholdFromTop: 200,
      bounceBack: true
    };

    this.loadDetails();
  }

  ngOnInit(): void {
    // manage notifications
    // this.notificationService.receiveMessage().subscribe((payload: any) => {
    //   console.log("Message received. ", payload);
    //   if (payload && payload.notification) this.presentAlert(`${payload.notification.title}`, `${payload.notification.body}`);
    // });
    // watch subscriptions
    // this.watchSubscription();
  }
  loadDetails() {
    this.notificationService
      .getAllNotifications()
      .pipe(
        catchError(err => {
          this.data$.next({ error: true });
          return err;
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe((res: any) => {
        console.log(res);
        if (res && res.length > 0) this.data$.next({ data: res });
        else this.data$.next({ empty: true });
      });
  }
  async presentAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ["OK"]
    });

    await alert.present();
  }

  async presentSettings(ev: any) {
    this.currentPopover = await this.popoverController.create({
      component: HomePopoverComponent,
      event: ev,
      translucent: true,
      componentProps: {
        dismiss: this.dismissPopover.bind(this)
      }
    });
    return await this.currentPopover.present();
  }

  dismissPopover() {
    if (this.currentPopover) {
      this.currentPopover.dismiss().then(() => {
        this.currentPopover = null;
      });
    }
  }
  // subscribeForNotifications() {
  //   this.notificationService.requestPermission();
  // }
  // async unsubscribeFromNotifications() {
  //   let user = await this.authService.user$.pipe(take(1)).toPromise();
  //   this.notificationService.deleteToken(user.uid);
  // }
  // watchSubscription() {
  //   this.authService.user$
  //     .pipe(
  //       takeWhile(() => this.isAlive),
  //       take(1),
  //       switchMap(x => this.notificationService.getSubscription(x.uid))
  //     )
  //     .subscribe(res => {
  //       if (res) {
  //         this.subscriptionStatus$.next(true);
  //         // if already subscribed , check for token change
  //         console.count("watch sub in chat room");
  //         this.notificationService.requestPermission();
  //       } else this.subscriptionStatus$.next(false);
  //     });
  // }
  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
