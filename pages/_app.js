import "../styles/globals.css";
import Head from "next/head";
import { AuthUserProvider } from "lib/AuthUserContext";
import Header from "components/Header";

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

export default MyApp;
