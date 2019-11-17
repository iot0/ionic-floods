import { Injectable } from "@angular/core";
import { Observable, of, Observer, BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { FirebaseService } from "./firebase.service";
import { User, UserRole } from "../models/user";
import { switchMap, shareReplay, filter, map, tap, share, publish, takeLast } from "rxjs/operators";
import { Device } from "../models/device";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  private uidSubject$: BehaviorSubject<string> = new BehaviorSubject(null);
  user$: Observable<User>;

  isAdmin$: Observable<boolean>;

  collection: string = "Users";

  constructor(private firebase: FirebaseService, private router: Router) {
    this.user$ = this.uidSubject$.asObservable().pipe(
      switchMap((x): Observable<User> => (x ? this.getUserData.call(this, x) : of(null))),
      shareReplay(1)
    ) as any;

    this.isAdmin$ = this.user$.pipe(
      map(x => {
        return x ? x.role == UserRole.admin : false;
      })
    );
  }

  validateUser() {
    console.count("[Auth] [validateUser]");
    return this.onInit().pipe(
      tap(x => {
        console.count("[Auth] [validateUser] [onInittap]");
        this.uidSubject$.next(x);
      })
    );
  }

  onInit(): Observable<any> {
    console.count("[Auth] [onInit]");
    return this.firebase.init$.pipe(
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
            },
            () => {
              obs.complete();
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
      const { firebase, app } = await this.firebase.init$.toPromise();

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
    console.count("[Auth] [getUserData]");
    console.count(uid);
    return this.firebase.getDocument(this.collection, uid);
    // return of({
    //   deviceIp: "1232",
    //   displayName: "Sachin M S",
    //   email: "savigms2@gmail.com",
    //   id: "jnN59MMkmwPhSIJCYJMbww4tde53",
    //   photoURL: "https://lh3.googleusercontent.com/a-/AAuE7mAuiL24o3KNzE4ONAXQKr-3CNTuA6HG-dfR7vSV",
    //   role: 1,
    //   uid: "jnN59MMkmwPhSIJCYJMbww4tde53",
    //   updatedAt: 1571467829192
    // });
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
    const { app } = await this.firebase.init$.toPromise();
    await app.auth().signOut();
    return this.router.navigate(["/"]);
  }
}
