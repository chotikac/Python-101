export const metadata = {
  title: "DNA Pairs Game",
  description: "ATCG pairing game for classrooms"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{maxWidth: 1000, margin: "0 auto", padding: 20}}>
          <header style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 20}}>
            <h1 style={{margin:0}}>🧬 DNA Pairs Game</h1>
            <a href="/">Home</a>
          </header>
          {children}
          <footer style={{opacity: 0.7, marginTop: 40, fontSize: 13, textAlign:"center"}}>
            Built with Next.js + Redis
          </footer>
        </div>
      </body>
    </html>
  );
}