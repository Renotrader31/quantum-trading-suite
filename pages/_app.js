import '../styles/global.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Quantum Trading Suite</title>
        {/* Only use CDN in development */}
        {process.env.NODE_ENV === 'development' && (
          <script src="https://cdn.tailwindcss.com"></script>
        )}
      </Head>
      <Component {...pageProps} />
    </>
  )
}
