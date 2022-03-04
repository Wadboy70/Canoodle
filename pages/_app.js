import "../styles/globals.css";
import Head from "next/head";
import { AuthUserProvider, useAuth } from "lib/AuthUserContext";
import Container from "src/Container";
import Link from "next/link";
import Image from "next/image";
import styles from "styles/Home.module.css";

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

      <Container>
        <Header />
        <Component {...pageProps} />
      </Container>
    </AuthUserProvider>
  );
}

export const Header = ({}) => {
  const { authUser, signOutFirebaseUser, loading } = useAuth();
  return (
    <header className={styles.header}>
      <Link href={"/"}>
        <a className={styles.logo}>
          <Image
            src="/canoodle.png"
            alt="canoodle logo"
            width={100}
            height={30}
          />
        </a>
      </Link>
      <nav className={styles.nav}>
        {authUser ? (
          <>
            <Link href="/dashboard">
              <a className={styles.login}>Dashboard</a>
            </Link>
            <button
              className={styles.logout}
              onClick={async () => {
                await signOutFirebaseUser();
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link href="/login">
            <a className={styles.login}>
              <span>Login</span>
            </a>
          </Link>
        )}
      </nav>
    </header>
  );
};

export default MyApp;
