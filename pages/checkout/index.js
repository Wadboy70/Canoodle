import Container from "components/Container";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "lib/AuthUserContext";
import { useRouter } from "next/router";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);
export default function CheckoutPage() {
  const router = useRouter();
  const { authUser } = useAuth();

  React.useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    if (typeof window === "undefined") return;

    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, []);

  return (
    <Container>
      <form
        onSubmit={async (e) => {
          if (typeof window === "undefined") return;
          e.preventDefault();
          try {
            const goToUrl = (
              await fetch("/api/checkout_sessions", {
                body: JSON.stringify({ uid: authUser.uid }),
                method: "POST",
              }).then((res) => res.json())
            ).url;
            window.location = goToUrl;
          } catch (err) {
            alert(err);
          }
        }}
      >
        <section>
          <button type="submit" role="link">
            Checkout
          </button>
        </section>
        <style jsx>
          {`
            section {
              background: #ffffff;
              display: flex;
              flex-direction: column;
              width: 400px;
              height: 112px;
              border-radius: 6px;
              justify-content: space-between;
            }
            button {
              height: 36px;
              background: #556cd6;
              border-radius: 4px;
              color: white;
              border: 0;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
            }
            button:hover {
              opacity: 0.8;
            }
          `}
        </style>
      </form>
    </Container>
  );
}
