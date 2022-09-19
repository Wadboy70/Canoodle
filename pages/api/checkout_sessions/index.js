import { COLLECTION_NAMES } from "lib/firestore";
import { mergeFirestoreDoc } from "lib/firestoreServer";
import { v4 } from "uuid";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const uid = JSON.parse(req.body)?.uid;
      if (!uid) {
        res.send(500);
        return;
      }
      const session_id = v4();
      await mergeFirestoreDoc(
        { uid, session_id },
        COLLECTION_NAMES.SESSION_ID,
        uid
      );
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: "price_1LZQf0Hk6N6yFbtGpRZYJsK2",
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/?success=true?session_id=${session_id}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });
      res.status(303).json({ url: session.url });
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
