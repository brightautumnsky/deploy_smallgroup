import "../styles/globals.css";
import type { AppProps } from "next/app";
import axios from "axios";
import { AuthProvider } from "../context/auth";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/login", "/register"];
  const authRoute = authRoutes.includes(pathname);

  axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  axios.defaults.withCredentials = true;
  return (
    <AuthProvider>
      {!authRoute && <Navbar />}
      <div className={authRoute ? "" : "pt-16 min-h-screen"}>
        <Component {...pageProps} />
      </div>
      <Footer />
    </AuthProvider>
  );
}
