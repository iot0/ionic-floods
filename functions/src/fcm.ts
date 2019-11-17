import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp(functions.config().firebase);

export const onNewNotification = functions.firestore.document("Notifications/{notificationId}").onCreate(async (snapshot, context) => {
  const notification: any = snapshot.data();
  const notificationId:string = context.params.notificationId;
  console.log(`New notification ${notificationId}`);

  // 2) Send push notifications to the subscribed user
  // check for subscription
  const subscriptionsRef = await admin
    .firestore()
    .collection(`Subscriptions`)
    .get();

  subscriptionsRef.forEach(async subscriptionRef => {
    // send if subscribed
    if (subscriptionRef.exists) {
      console.log("User subscribed , sending notification...");
      // get token infos
      const subscription: any = subscriptionRef.data();

      const title="FLOOD ALERT";

      const payload: admin.messaging.Message = {
        data: {
          title: title,
          body: notification.message,
          id: notificationId
        },
        webpush: {
          notification: {
            title:title,
            body:notification.message,
            vibrate: [200, 100, 200]
          }
        },
        token: subscription.token
      };
      await admin.messaging().send(payload);
    } else {
      console.log("User not subscribed.");
    }
  });
  return true;
});
