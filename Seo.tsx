import { useEffect } from "react";

interface SeoProps {
    title?: string;
    description?: string;
    canonical?: string;
}

export default function Seo({ title, description, canonical }: SeoProps) {
    useEffect(() => {
        if (title) {
            document.title = `${title} | Mobile Autoworks NZ`;
        }

        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", description);
            } else {
                const meta = document.createElement("meta");
                meta.name = "description";
                meta.content = description;
                document.head.appendChild(meta);
            }
        }

        if (canonical) {
            let linkCanonical = document.querySelector('link[rel="canonical"]');
            if (linkCanonical) {
                linkCanonical.setAttribute("href", canonical);
            } else {
                const link = document.createElement("link");
                link.rel = "canonical";
                link.href = canonical;
                document.head.appendChild(link);
            }
        }
    }, [title, description, canonical]);

    return null;
}
