'use client';

import { useEffect, useRef } from 'react';

type Props = {
  siteKey: string;
  onSuccess: (token: string) => void;
  onExpired?: () => void;
};

export default function TurnstileCaptcha({
  siteKey,
  onSuccess,
  onExpired,
}: Props) {
  const widgetRef = useRef<HTMLDivElement | null>(null);

  // Load Turnstile script once globally
  useEffect(() => {
    if (!document.querySelector('#turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Render widget when siteKey is available and window.turnstile is ready
  useEffect(() => {
    const renderCaptcha = () => {
      if (
        typeof window !== 'undefined' &&
        (window as any).turnstile &&
        siteKey &&
        widgetRef.current
      ) {
        widgetRef.current.innerHTML = ''; // Clear previous instance

        (window as any).turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          callback: onSuccess,
          'expired-callback': onExpired,
          theme: 'light',
        });
      } else {
        setTimeout(renderCaptcha, 200); // Retry if turnstile not ready
      }
    };

    renderCaptcha();
  }, [siteKey, onSuccess, onExpired]);

  return <div ref={widgetRef} className="my-2" />;
}
