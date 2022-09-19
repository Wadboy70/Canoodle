import { SUB_LEVELS } from "lib/constants";
import { COLLECTION_NAMES } from "lib/firestore";
import {
  deleteSingleFirestoreDoc,
  mergeFirestoreDoc,
  simpleQuery,
} from "lib/firestoreServer";
import { buffer } from "micro";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOKS_SECRET;

export const config = { api: { bodyParser: false } };

const getParameterByName = (name, url) => {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const fulfillOrder = async (session) => {
  console.log(session.success_url);
  const success_url = session.success_url;

  const session_id = getParameterByName("session_id", success_url);

  if (!session_id) return res.status(400).send(`Error parsing session_id`);

  //change user subscription
  const sessionDoc = await simpleQuery(
    "session_id",
    session_id,
    COLLECTION_NAMES.SESSION_ID
  );

  if (!sessionDoc.length)
    return res.status(400).send(`Error finding session_id`);

  const uid = sessionDoc[0].uid;

  await mergeFirestoreDoc(
    { subscription: SUB_LEVELS.LIFETIME },
    COLLECTION_NAMES.USERS,
    uid
  );

  //delete user session_id(s) from firebase

  sessionDoc.forEach(async (doc) => {
    await deleteSingleFirestoreDoc(COLLECTION_NAMES.SESSION_ID, uid);
  });

  console.log("did firebase stuff");
};

export default async function handler(req, res) {
  const payload = await buffer(req);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Fulfill the purchase...
    console.log("about to fulfill");
    await fulfillOrder(session);
  } else {
    console.log(event.data.object, "not fulfilled");
  }

  res.status(200).send("done!");
}
