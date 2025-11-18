"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function GoogleReviews() {
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load the Google Reviews script
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-muted/30 dark:bg-[#0f0f0f]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Real reviews from Google
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Option 1: Using Elfsight Widget (Requires widget ID) */}
          {/* Replace 'YOUR_WIDGET_ID' with your actual Elfsight widget ID */}
          {/* Get your widget ID from: https://apps.elfsight.com/panel/applications/google-reviews/ */}
          <div
            className="elfsight-app-YOUR_WIDGET_ID"
            data-elfsight-app-lazy
          ></div>

          {/* Option 2: Custom Google Reviews Embed */}
          {/* Uncomment this section if you want to use a simple iframe embed */}
          {/*
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <iframe
                src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=place_id:YOUR_PLACE_ID&reviews=1"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </CardContent>
          </Card>
          */}

          {/* Option 3: Manual reviews display (fallback) */}
          <div ref={reviewsRef} className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Loading Google Reviews...
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Please configure your Google Reviews widget ID
            </p>
          </div>

          {/* Direct Google Reviews Link */}
          <div className="text-center mt-8">
            <a
              href="https://www.google.com/maps/search/torq+rides"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-primary hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              View All Reviews on Google
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
