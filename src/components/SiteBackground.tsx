"use client";

import { usePathname } from "next/navigation";

type BackgroundSpec = {
  imageUrl: string;
  alt: string;
};

const defaultBackground: BackgroundSpec = {
  imageUrl:
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=2400",
  alt: "Automotive background",
};

function backgroundForPath(pathname: string): BackgroundSpec {
  if (pathname === "/") return defaultBackground;

  if (pathname.startsWith("/services")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&q=80&w=2400",
      alt: "Car service background",
    };
  }

  if (pathname.startsWith("/about")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2400",
      alt: "Mechanic tools background",
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2400",
      alt: "Car detail background",
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1515923169248-8cfb1e54ca1b?auto=format&fit=crop&q=80&w=2400",
      alt: "Workshop background",
    };
  }

  if (pathname.startsWith("/instant-quote") || pathname.startsWith("/book")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2400",
      alt: "Car interior background",
    };
  }

  if (pathname.startsWith("/admin")) {
    return {
      imageUrl:
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=2400",
      alt: "Diagnostics background",
    };
  }

  return defaultBackground;
}

export function SiteBackground() {
  const pathname = usePathname() || "/";

  if (pathname === "/") {
    return null;
  }

  const bg = backgroundForPath(pathname);

  return (
    <div className="site-background" aria-hidden="true">
      <img className="site-background__image" src={bg.imageUrl} alt={bg.alt} loading="eager" />
      <div className="site-background__overlay" />
      <div className="site-background__gradient" />
    </div>
  );
}
