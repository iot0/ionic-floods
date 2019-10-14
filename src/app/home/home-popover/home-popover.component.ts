import { Component, OnInit, Input, ChangeDetectionStrategy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "src/app/shared/services/auth.service";

@Component({
  selector: "app-home-popover",
  templateUrl: "./home-popover.component.html",
  styleUrls: ["./home-popover.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePopoverComponent implements OnInit {
  @Input("dismiss") dismiss;

  constructor(private router: Router, public auth: AuthService) {}

  ngOnInit() {}

  onLogin() {
    this.dismiss();
    this.router.navigate(["/login"]);
  }

  onLogout() {
    this.dismiss();
    this.auth.signOut();
  }
}
