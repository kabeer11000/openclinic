import { component$, useSignal, $, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { signInWithGoogle } from "../../lib/firebase";

export const useCheckAuth = routeLoader$(async ({ redirect }) => {
  // Check if user is already authenticated (this would be done server-side in a real app)
  // For now, we'll handle this client-side
  return {};
});

export default component$(() => {
  const isLoading = useSignal(false);
  const error = useSignal("");

  const handleGoogleLogin = $(async () => {
    isLoading.value = true;
    error.value = "";

    try {
      const result = await signInWithGoogle();
      const user = result.user;

      // Store user info in local storage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));

        // Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      error.value = err.message || "Login failed";
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Open Clinic
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Open Clinic</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-6">
                Sign in with your Google account to access the clinic management system
              </p>
            </div>

            {error.value && (
              <div class="rounded-md bg-red-50 p-4">
                <div class="text-sm text-red-700">{error.value}</div>
              </div>
            )}

            <div>
              <Button
                type="button"
                class="w-full flex items-center justify-center space-x-2"
                disabled={isLoading.value}
                onClick$={handleGoogleLogin}
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{isLoading.value ? "Signing in..." : "Sign in with Google"}</span>
              </Button>
            </div>

            <div class="text-xs text-gray-500 text-center">
              <p>Secure authentication powered by Google</p>
              <p>Only authorized healthcare professionals can access this system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Login - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Login to Open Clinic Management System",
    },
  ],
};