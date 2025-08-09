export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
        :root{
          --bg: #fafafa;
          --card: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --border: #e6e6ea;
          --brand: #f7b500;
          --ring: rgba(247,181,0,.35);
        }
        @media (prefers-color-scheme: dark){
          :root{
            --bg:#0b0d12; --card:#0f1115; --text:#e6e7ea; --muted:#9aa3b2; --border:#1e2230;
          }
        }
        *{box-sizing:border-box}
        html,body{padding:0;margin:0}
        body{
          background:var(--bg); color:var(--text);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
        }
        a{color:inherit;text-decoration:none}
        .container{max-width:1200px;margin:0 auto;padding:16px clamp(16px,4vw,32px);}
        .sr-only{position:absolute;left:-9999px}
        @media (prefers-reduced-motion: reduce){
          *{animation:none!important;transition:none!important}
        }
      `}</style>
    </>
  );
}
