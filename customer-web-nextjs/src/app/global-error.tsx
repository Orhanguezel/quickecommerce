"use client";

export default function GlobalError() {
  return (
    <html lang="tr">
      <body>
        <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
          <h1>Bir hata oluştu</h1>
          <p>Sayfa yüklenirken beklenmeyen bir sorun oluştu.</p>
        </main>
      </body>
    </html>
  );
}

