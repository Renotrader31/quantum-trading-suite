import '../styles/global.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Quantum Trading Suite</title>
        <style jsx global>{`
          /* Ensure dark theme loads immediately */
          body {
            background-color: #111827;
            color: white;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
