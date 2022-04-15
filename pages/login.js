import { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import styles from "styles/Login.module.css";
import InputWithLabel from "components/InputWithLabel";
import Button from "components/Button";
import { useAuth } from "lib/AuthUserContext";
import Form from "components/Form";
import { COLLECTION_NAMES, getSingleFirestoreDoc } from "lib/firestore";
import Container from "components/Container";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passwordOne, setPasswordOne] = useState("");
  const [passwordTwo, setPasswordTwo] = useState("");
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const {
    createFirebaseUserWithEmailAndPassword,
    signInWithGoogle,
    signInWithFirebaseEmailAndPassword,
    authUser,
  } = useAuth();

  useEffect(() => {
    if (authUser) {
      router.push("/");
    }
  });

  const onSubmit = async (event) => {
    console.log("submit");
    event.preventDefault();
    setError(null);

    if (passwordOne === passwordTwo)
      await createFirebaseUserWithEmailAndPassword(email, passwordOne)
        .then(async (authUser) => {
          console.log("Success. The user is created in Firebase", authUser);
          await addFirestoreDoc(COLLECTION_NAMES.USERS, {
            uid: authUser.user.uid,
            email: authUser.user.email,
            date: new Date(),
          });
          router.push("/");
        })
        .catch((error) => {
          if (error.code === "auth/email-already-in-use")
            setError("You already have an account! Log in instead 😁");
          else {
            setError("An error occured :(");
          }
        });
    else setError("Password do not match");
  };
  const onSignIn = async (e) => {
    console.log("signing in");
    await signInWithFirebaseEmailAndPassword(
      loginEmail,
      loginPassword,
      (error) => {
        console.log(error.code);
        setLoginError("Invalid Login :(");
        mixpanel.track(`sign in error: ${error.code}`);
      }
    );
  };

  return (
    <Container bgImage>
      <div className="flex justify-center flex-wrap">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="mb-6"
        >
          <h2>Sign Up</h2>
          <InputWithLabel
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            name="email"
            id="signUpEmail"
            placeholder="Email"
            label="Email"
          />
          <InputWithLabel
            type="password"
            name="passwordOne"
            value={passwordOne}
            onChange={(event) => setPasswordOne(event.target.value)}
            id="signUpPassword"
            placeholder="Password"
            label="Password"
          />
          <InputWithLabel
            type="password"
            name="password"
            value={passwordTwo}
            onChange={(event) => setPasswordTwo(event.target.value)}
            id="signUpPassword2"
            placeholder="Password"
            label="Confirm Password"
          />
          <Button squared className="mt-4">
            Sign Up
          </Button>
          {error && <p>{error}</p>}
        </Form>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            onSignIn(e);
          }}
          className="mb-6"
        >
          <h2>Sign In</h2>
          {loginError && <p>{loginError}</p>}
          <InputWithLabel
            type="email"
            name="loginEmail"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            id="loginEmail"
            placeholder="Email"
            label="Email"
          />
          <InputWithLabel
            type="password"
            name="loginPassword"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            id="loginPassword"
            placeholder="Password"
            label="Password"
          />
          <div className="flex flex-row justify-between">
            <Button squared className="mt-4">
              Sign In
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setError("");
                signInWithGoogle();
              }}
              squared
              className="mt-4"
            >
              Sign in with google
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default SignUp;
