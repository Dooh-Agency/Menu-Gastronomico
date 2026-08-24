import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Plataforma gastronómica",
    short_name: "Menú",
    description: "Menú digital para restaurantes.",
    start_url: "/demo",
    display: "standalone",
    background_color: "#fffdf8",
    theme_color: "#ae4c2c",
  };
}
