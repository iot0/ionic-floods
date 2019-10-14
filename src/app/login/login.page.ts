import { Component, OnInit } from "@angular/core";
import { AuthService } from "../shared/services/auth.service";
import { User, UserRole } from "../shared/models/user";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"]
})
export class LoginPage implements OnInit {
  isAdmin: boolean = false;

  constructor(private auth: AuthService, private router: Router, public toastController: ToastController) {}

  ngOnInit() {}

  async onLogin() {
    try {
      let credential = await this.auth.googleSignIn();

      console.log(credential);

      let uid = credential.user.uid;

      if (credential.additionalUserInfo.isNewUser) {
        let data: User = { role: this.isAdmin ? UserRole.admin : UserRole.user, ...credential.user };
        await this.auth.upsertUserData(data);
      } else {
        await this.auth.upsertUserData(credential.user);
      }

      this.router.navigate(["/home"]);
    } catch (err) {
      this.presentToast("Sorry something went wrong, please check your connection");
      console.log(err);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
