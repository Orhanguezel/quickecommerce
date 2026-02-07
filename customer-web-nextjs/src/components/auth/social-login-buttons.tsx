"use client";

import { useCallback } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useSocialLoginMutation } from "@/modules/auth/auth.service";
import { env } from "@/env.mjs";
import { Button } from "@/components/ui/button";

interface Props {
  translations: {
    or: string;
    google: string;
    facebook: string;
    social_error: string;
  };
}

function SocialLoginInner({ translations: t }: Props) {
  const socialLogin = useSocialLoginMutation();
  const facebookAppId = env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const handleFacebookLogin = useCallback(() => {
    if (!facebookAppId) return;

    // Load Facebook SDK dynamically
    const fbScript = document.getElementById("facebook-jssdk");
    if (!fbScript) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/tr_TR/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = () => initFacebookLogin();
      document.body.appendChild(script);
    } else {
      initFacebookLogin();
    }

    function initFacebookLogin() {
      const FB = (window as any).FB;
      if (!FB) return;

      FB.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });

      FB.login(
        (response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            // Get user email from FB
            FB.api("/me", { fields: "email" }, (userInfo: any) => {
              if (userInfo.email) {
                socialLogin.mutate({
                  email: userInfo.email,
                  access_token: accessToken,
                  type: "facebook",
                });
              }
            });
          }
        },
        { scope: "email,public_profile" }
      );
    }
  }, [facebookAppId, socialLogin]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t.or}</span>
        </div>
      </div>

      {socialLogin.isError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {(socialLogin.error as any)?.response?.data?.message || t.social_error}
        </div>
      )}

      <div className="space-y-3">
        {/* Google Login */}
        <div className="flex justify-center [&_div]:!w-full">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                // Decode JWT to get email
                const payload = JSON.parse(
                  atob(credentialResponse.credential.split(".")[1])
                );
                socialLogin.mutate({
                  email: payload.email,
                  access_token: credentialResponse.credential,
                  type: "google",
                });
              }
            }}
            onError={() => {
              // Error handled by mutation
            }}
            width="400"
            text="signin_with"
            shape="rectangular"
            theme="outline"
            size="large"
          />
        </div>

        {/* Facebook Login */}
        {facebookAppId && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleFacebookLogin}
            disabled={socialLogin.isPending}
          >
            <svg className="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t.facebook}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SocialLoginButtons(props: Props) {
  const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Don't render anything if no social login is configured
  if (!googleClientId) {
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <SocialLoginInner {...props} />
    </GoogleOAuthProvider>
  );
}
