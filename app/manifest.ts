import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jin1abad — Alumni Matholi'ul Falah Angkatan 2012",
    short_name: "Jin1abad",
    description:
      "Direktori, cerita, galeri, agenda, dan kas Alumni Matholi'ul Falah Angkatan 2012",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E7",
    theme_color: "#7A2E2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
