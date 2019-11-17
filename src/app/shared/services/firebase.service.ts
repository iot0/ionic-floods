/// <reference types="firebase" />

import { Injectable } from "@angular/core";
import { Observable, from, combineLatest } from "rxjs";
import { map, mergeMap, shareReplay, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { FIREBASE_CONFIG } from "../../../firebase";

@Injectable({
  providedIn: "root"
})
export class FirebaseService {
  init$: Observable<{ app: firebase.app.App; firebase: any }>;
  messaging$: Observable<firebase.messaging.Messaging>;

  constructor() {
    this.init$ = this.init();
    this.messaging$ = this.initMessaging();
  }

  private init(): Observable<{ app: firebase.app.App; firebase: any }> {
    console.count("[FirebaseService] [init]");

    const app$ = from(import("firebase/app"));
    const firestore$ = from(import("firebase/firestore"));
    const auth$ = from(import("firebase/auth"));

    return combineLatest(app$, firestore$, auth$).pipe(
      map(([firebase, firestore, auth]) => {
        const app = firebase.apps[0] || firebase.initializeApp(environment.firebase);
        return { firebase, app };
      }),
      shareReplay(1)
    );
  }

  add(collectionName, data) {
    const timestamp = new Date().getTime();
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName);
        return ref.add({
          ...data,
          updatedAt: timestamp,
          createdAt: timestamp
        });
      })
    );
  }

  set(collectionName, docId, data) {
    const timestamp = new Date().getTime();
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app
          .firestore()
          .collection(collectionName)
          .doc(docId);

        return ref.set(
          {
            ...data,
            updatedAt: timestamp
          },
          { merge: true }
        );
      })
    );
  }

  delete(collectionName, docId) {
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app
          .firestore()
          .collection(collectionName)
          .doc(docId);

        return ref.delete();
      })
    );
  }

  update(collectionName, docId, data) {
    const timestamp = new Date().getTime();
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app
          .firestore()
          .collection(collectionName)
          .doc(docId);

        return ref.update({
          ...data,
          updatedAt: timestamp
        });
      })
    );
  }

  load(collectionName: string, applyCondition?: Function) {
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName);

        return this.col$(applyCondition ? applyCondition(ref) : ref);
      })
    );
  }

  getDocument(collectionName: string, docId: string): Observable<any> {
    return this.init$.pipe(
      mergeMap(({ app }) => {
        const ref = app
          .firestore()
          .collection(collectionName)
          .doc(docId);

        return this.doc$(ref);
      })
    );
  }

  col$(ref) {
    return new Observable(obs => {
      ref
        .get()
        .then(function(querySnapshot) {
          let datas = [];
          querySnapshot.forEach(x => {
            datas.push({ id: x.id, ...x.data() });
          });
          obs.next(datas);
          obs.complete();
        })
        .catch(function(error) {
          obs.error(error);
        });
    });
  }

  doc$(ref) {
    return new Observable(obs => {
      ref
        .get()
        .then(function(doc) {
          let data = null;
          if (doc.exists) {
            data = { id: doc.id, ...doc.data() };
          }
          obs.next(data);
          //obs.complete();
        })
        .catch(function(error) {
          obs.error(error);
        });
    });
  }

  private initMessaging(): Observable<firebase.messaging.Messaging> {
    const messaging$ = from(import("firebase/messaging"));

    return combineLatest(this.init$, messaging$).pipe(
      map(([{ app, firebase }]) => {
        console.count("[initMessaging] loaded");
        const messaging = app.messaging();
        // const messaging = firebase.messaging();
        // messaging.usePublicVapidKey(FIREBASE_CONFIG.vapidKey);
        return messaging;
      }),
      shareReplay(1)
    );
  }

  notifications$: Observable<any> = combineLatest(this.init$).pipe(
    map(([{ app, firebase }]) => {
      console.count("[initMessaging] loaded");
      // const messaging = app.messaging();
      const messaging = firebase.notifications();
      return messaging;
    }),
    shareReplay(1)
  );
}
