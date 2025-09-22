import { component$, useSignal, $ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { patientService } from "../../../lib/firestore";
import type { Patient } from "../../../store/clinic";

export default component$(() => {
  const name = useSignal("");
  const age = useSignal("");
  const gender = useSignal("male");
  const contact = useSignal("");
  const address = useSignal("");
  const notes = useSignal("");
  const isLoading = useSignal(false);
  const errors = useSignal<Record<string, string>>({});

  const validateForm = $(() => {
    const newErrors: Record<string, string> = {};

    if (!name.value.trim()) {
      newErrors.name = "Name is required";
    }

    if (!age.value.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(Number(age.value)) || Number(age.value) <= 0) {
      newErrors.age = "Age must be a valid positive number";
    }

    if (!contact.value.trim()) {
      newErrors.contact = "Contact number is required";
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  });

  const handleSubmit = $(async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    isLoading.value = true;

    try {
      const newPatient = {
        name: name.value.trim(),
        age: Number(age.value),
        gender: gender.value as 'male' | 'female' | 'other',
        contact: contact.value.trim(),
        address: address.value.trim() || undefined,
        notes: notes.value.trim() || undefined,
      };

      // Save to Firestore
      const newId = await patientService.add(newPatient);

      // Redirect to patient profile
      window.location.href = `/patients/${newId}`;
    } catch (error) {
      console.error("Error adding patient:", error);
      errors.value = { ...errors.value, general: "Failed to save patient. Please try again." };
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16">
            <Button variant="ghost" onClick$={() => window.location.href = "/patients"}>
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Patients
            </Button>
            <h1 class="ml-4 text-2xl font-bold text-gray-900">Add New Patient</h1>
          </div>
        </div>
      </header>

      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  id="name"
                  placeholder="Enter patient's full name"
                  value={name.value}
                  onInput$={(e) => (name.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.name}
                />
              </div>

              <div>
                <label for="age" class="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={age.value}
                  onInput$={(e) => (age.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.age}
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="gender" class="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  value={gender.value}
                  onChange$={(e) => (gender.value = (e.target as HTMLSelectElement).value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label for="contact" class="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number *
                </label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Enter phone number"
                  value={contact.value}
                  onInput$={(e) => (contact.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.contact}
                />
              </div>
            </div>

            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <Input
                id="address"
                placeholder="Enter patient's address"
                value={address.value}
                onInput$={(e) => (address.value = (e.target as HTMLInputElement).value)}
              />
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                Medical Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                class="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                placeholder="Enter any medical conditions, allergies, or notes..."
                value={notes.value}
                onInput$={(e) => (notes.value = (e.target as HTMLTextAreaElement).value)}
              />
            </div>

            <div class="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick$={() => window.location.href = "/patients"}
                disabled={isLoading.value}
              >
                Cancel
              </Button>
              <Button
                onClick$={handleSubmit}
                disabled={isLoading.value}
              >
                {isLoading.value ? "Saving..." : "Save Patient"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Add New Patient - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Add a new patient to Open Clinic",
    },
  ],
};