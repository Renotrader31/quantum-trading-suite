import '../styles/global.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Quantum Trading Suite</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
