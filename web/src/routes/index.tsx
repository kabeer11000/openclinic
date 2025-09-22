import { component$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";

export const useRedirectToLogin = routeLoader$(async ({ redirect }) => {
  // Redirect to login page
  throw redirect(302, "/login");
});

export default component$(() => {
  return (
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Redirecting to login...</h1>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Open Clinic",
  meta: [
    {
      name: "description",
      content: "Open Clinic Management System",
    },
  ],
};
