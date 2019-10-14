/// <reference types="firebase" />

import { Injectable } from "@angular/core";
import { Observable, from, combineLatest } from "rxjs";
import { map, mergeMap, shareReplay, catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root"
})
export class FirebaseService {
  constructor() {}

  init(): Observable<{ app: firebase.app.App; firebase: any }> {
    const app$ = from(import("firebase/app"));
    const firestore$ = from(import("firebase/firestore"));
    const auth$ = from(import("firebase/auth"));

    return combineLatest(app$, firestore$, auth$).pipe(
      map(([firebase, firestore, auth]) => {
        const app = firebase.apps[0] || firebase.initializeApp(environment.firebase);
        return { firebase, app };
      }),
      shareReplay()
    );
  }

  add(collectionName, data) {
    const timestamp = new Date().getTime();
    return this.init().pipe(
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
    return this.init().pipe(
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

  load(collectionName: string, applyCondition?: Function) {
    return this.init().pipe(
      mergeMap(({ app }) => {
        const ref = app.firestore().collection(collectionName);

        return this.col$(applyCondition ? applyCondition(ref) : ref);
      })
    );
  }

  getDocument(collectionName: string, docId: string): Observable<any> {
    return this.init().pipe(
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
          let data = { id: doc.id, ...doc.data() };

          obs.next(data);
          obs.complete();
        })
        .catch(function(error) {
          obs.error(error);
        });
    });
  }
}
