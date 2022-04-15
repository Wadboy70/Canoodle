import "../styles/globals.css";
import Head from "next/head";
import { AuthUserProvider, useAuth } from "lib/AuthUserContext";
import Link from "next/link";
import Image from "next/image";
import Button from "components/Button";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { submitRecipe } from "pages";

function MyApp({ Component, pageProps }) {
  return (
    <AuthUserProvider>
      <Head>
        <title>Canoodle</title>
        <meta
          name="description"
          content="Recipes, without all the garbage 😎"
        />
        <link rel="icon" href="/canoodle.ico" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Component {...pageProps} />
      </div>
    </AuthUserProvider>
  );
}

export const Header = ({}) => {
  const { authUser, signOutFirebaseUser, loading } = useAuth();
  const [currentRecipe, setCurrentRecipe] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      setCurrentRecipe("");
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <header className="shadow-lg sticky py-4 px-3 flex sticky top-0 bg-white z-50">
      <Link href={"/"}>
        <a className="flex items-center w-1/3">
          <Image
            src="/canoodle.png"
            alt="canoodle logo"
            width={100}
            height={30}
          />
        </a>
      </Link>
      <form
        className="w-1/3 flex justify-center"
        onSubmit={async (e) => {
          e.preventDefault();
          await submitRecipe(router, currentRecipe);
        }}
      >
        <div className="bg-slate-200 rounded-full flex px-4">
          <span className="w-5 flex">
            <Image src="/search.svg" width="20" height="20" alt="Search Logo" />
          </span>
          <input
            type="text"
            name="yuh"
            id="yuh"
            value={currentRecipe}
            onChange={(event) => setCurrentRecipe(event.target.value)}
            placeholder="Recipe URL goes here!"
            className="text-center bg-slate-200 focus:outline-0 max-w-7/10 rounded-full"
          />
        </div>
        <button className="hidden" type="submit"></button>
      </form>
      <nav className="flex items-center w-1/3 justify-end">
        {authUser ? (
          <>
            <Link href="/dashboard">
              <a className="mr-4">Dashboard</a>
            </Link>
            <Button
              onClick={async () => {
                await signOutFirebaseUser();
              }}
            >
              Log Out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <a className="bg-orange-400 py-2 px-4 rounded-full text-white">
              <span>Login</span>
            </a>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default MyApp;
