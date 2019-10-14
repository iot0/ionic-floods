import { Injectable } from "@angular/core";
import { Observable, of, Observer, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { FirebaseService } from "./firebase.service";
import { User, UserRole } from "../models/user";
import { switchMap, shareReplay, filter, map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private uidSubject$: BehaviorSubject<string> = new BehaviorSubject(null);
  user$: Observable<User> = this.uidSubject$.asObservable().pipe(
    switchMap((x): Observable<User> => (x ? this.getUserData.call(this, x) : of(null))),
    shareReplay()
  );

  isAdmin$: Observable<boolean>;
  collection: string = "Users";

  constructor(private firebase: FirebaseService, private router: Router) {
    this.isAdmin$ = this.user$.pipe(
      map(x => {
        return x ? x.role == UserRole.admin : false;
      })
    );

    this.onInit()
      .pipe(
        tap(x => {
          this.uidSubject$.next(x);
        })
      )
      .subscribe();
  }

  onInit(): Observable<any> {
    return this.firebase.init().pipe(
      switchMap(({ firebase, app }) => {
        return Observable.create((obs: Observer<string>) => {
          app.auth().onAuthStateChanged(
            u => {
              console.count("Auth State changed");
              console.log(u);
              if (u) {
                obs.next(u.uid);
              } else {
                obs.next(null);
              }
            },
            err => {
              console.error(err);
              obs.error(err);
            }
          );
        });
      })
    );
  }

  refreshUserData(uid: string) {
    this.uidSubject$.next(uid);
  }

  async googleSignIn() {
    try {
      const { firebase, app } = await this.firebase.init().toPromise();

      const provider = new (firebase.auth as any).GoogleAuthProvider();
      // const provider = new (app.auth() as any).GoogleAuthProvider();
      const credential = await app.auth().signInWithPopup(provider);
      // const credential = await firebase.auth().signInWithPopup(provider);
      console.log(credential);
      //return this.updateUserData(credential.user);
      return credential;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  getUserData(uid: string): Observable<User> {
    console.count("getUseeData");
    console.count(uid);
    return this.firebase.getDocument(this.collection, uid);
  }

  upsertUserData({ uid, email, displayName, photoURL, role }: User) {
    let roleData: any = role ? { role: role } : {};
    const data: User = {
      uid,
      email,
      displayName,
      photoURL,
      ...roleData
    };
    return this.firebase.set(this.collection, uid, data).toPromise();
  }

  async signOut() {
    const { app } = await this.firebase.init().toPromise();
    await app.auth().signOut();
    return this.router.navigate(["/"]);
  }

  addDeviceIp(uid: string, ip: string) {
    return this.firebase.set(this.collection, uid, { deviceIp: ip });
  }
}
