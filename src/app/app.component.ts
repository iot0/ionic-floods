import { Component, OnInit } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { SwUpdate } from "@angular/service-worker";
import { NotificationService } from "./shared/services/notification.service";
import { AuthService } from "./shared/services/auth.service";
import { FirebaseService } from "./shared/services/firebase.service";
import { FIREBASE_CONFIG } from "src/firebase";
import { share } from "rxjs/operators";
import { ThemeService } from "./shared/services/theme.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"]
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private swUpdate: SwUpdate,
    private notificationService: NotificationService,
    private firebaseService: FirebaseService,
    private auth: AuthService,
    private themeService: ThemeService
  ) {
    this.initializeApp();

    this.auth.validateUser().subscribe(x => console.log("[User Validated]"));

    this.watchNotifications();
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("New version available! would you like to update ? ")) {
          window.location.reload();
        }
      });
    }
  }

  async watchNotifications() {
    console.log("[watchNotifications] begin");
    // manage notifications
    this.notificationService.messages$.subscribe((x: any) => {
      console.log(x);
      const { data } = x;
      if (data) this.themeService.toast(data.body, { header: data.title, color: "light", position: "top",duration:5000 });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
