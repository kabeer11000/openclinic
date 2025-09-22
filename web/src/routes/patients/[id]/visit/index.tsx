import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { type DocumentHead, useLocation } from "@builder.io/qwik-city";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { patientService, visitService, medicineService } from "../../../../lib/firestore";
import type { Patient, Visit, Medicine } from "../../../../store/clinic";

export default component$(() => {
  const location = useLocation();
  const patient = useSignal<Patient | null>(null);
  const diagnosis = useSignal("");
  const notes = useSignal("");
  const selectedMedicines = useSignal<string[]>([]);
  const medicineSearch = useSignal("");
  const isLoading = useSignal(false);
  const errors = useSignal<Record<string, string>>({});
  const allMedicines = useSignal<Medicine[]>([]);

  // Load patient and medicine data
  useVisibleTask$(async () => {
    const patientId = location.params.id;

    try {
      // Find the patient
      const foundPatient = await patientService.getById(patientId);
      patient.value = foundPatient;

      // Load all medicines
      const medicines = await medicineService.getAll();
      allMedicines.value = medicines;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  });

  const filteredMedicines = useSignal<Medicine[]>([]);

  // Filter medicines based on search
  useVisibleTask$(({ track }) => {
    track(() => medicineSearch.value);
    track(() => allMedicines.value);

    if (!medicineSearch.value) {
      filteredMedicines.value = allMedicines.value;
    } else {
      filteredMedicines.value = allMedicines.value.filter(medicine =>
        medicine.name.toLowerCase().includes(medicineSearch.value.toLowerCase())
      );
    }
  });

  const addMedicine = $((medicineName: string) => {
    if (!selectedMedicines.value.includes(medicineName)) {
      selectedMedicines.value = [...selectedMedicines.value, medicineName];
    }
    medicineSearch.value = "";
  });

  const removeMedicine = $((medicineName: string) => {
    selectedMedicines.value = selectedMedicines.value.filter(m => m !== medicineName);
  });

  const validateForm = $(() => {
    const newErrors: Record<string, string> = {};

    if (!diagnosis.value.trim()) {
      newErrors.diagnosis = "Diagnosis is required";
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  });

  const handleSubmit = $(async () => {
    const isValid = await validateForm();
    if (!isValid || !patient.value) return;

    isLoading.value = true;

    try {
      const newVisit = {
        patientId: patient.value.id,
        diagnosis: diagnosis.value.trim(),
        prescribedMedicines: selectedMedicines.value,
        notes: notes.value.trim() || undefined,
      };

      // Save to Firestore
      await visitService.add(newVisit);

      // Redirect to patient profile
      window.location.href = `/patients/${patient.value.id}`;
    } catch (error) {
      console.error("Error adding visit:", error);
      errors.value = { ...errors.value, general: "Failed to save visit. Please try again." };
    } finally {
      isLoading.value = false;
    }
  });

  if (!patient.value) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">Patient Not Found</h1>
          <p class="mt-2 text-gray-600">The patient you're looking for doesn't exist.</p>
          <Button class="mt-4" onClick$={() => window.location.href = "/patients"}>
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16">
            <Button variant="ghost" onClick$={() => window.location.href = `/patients/${patient.value!.id}`}>
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Patient
            </Button>
            <h1 class="ml-4 text-2xl font-bold text-gray-900">
              New Visit - {patient.value.name}
            </h1>
          </div>
        </div>
      </header>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div class="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-2">
                <div>
                  <span class="text-sm font-medium text-gray-700">Name:</span>
                  <p class="text-sm text-gray-900">{patient.value.name}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700">Age:</span>
                  <p class="text-sm text-gray-900">{patient.value.age} years</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700">Gender:</span>
                  <p class="text-sm text-gray-900 capitalize">{patient.value.gender}</p>
                </div>
                <div>
                  <span class="text-sm font-medium text-gray-700">Contact:</span>
                  <p class="text-sm text-gray-900">{patient.value.contact}</p>
                </div>
                {patient.value.notes && (
                  <div>
                    <span class="text-sm font-medium text-gray-700">Medical Notes:</span>
                    <p class="text-sm text-gray-900">{patient.value.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visit Form */}
          <div class="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
              </CardHeader>
              <CardContent class="space-y-6">
                <div>
                  <label for="date" class="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                  />
                </div>

                <div>
                  <label for="diagnosis" class="block text-sm font-medium text-gray-700 mb-1">
                    Diagnosis / Symptoms *
                  </label>
                  <textarea
                    id="diagnosis"
                    rows={4}
                    class="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    placeholder="Enter diagnosis, symptoms, and examination findings..."
                    value={diagnosis.value}
                    onInput$={(e) => (diagnosis.value = (e.target as HTMLTextAreaElement).value)}
                  />
                  {errors.value.diagnosis && (
                    <p class="mt-1 text-sm text-red-600">{errors.value.diagnosis}</p>
                  )}
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Prescribed Medicines
                  </label>
                  <div class="space-y-3">
                    <div>
                      <Input
                        placeholder="Search medicines to prescribe..."
                        value={medicineSearch.value}
                        onInput$={(e) => (medicineSearch.value = (e.target as HTMLInputElement).value)}
                      />
                      {medicineSearch.value && filteredMedicines.value.length > 0 && (
                        <div class="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                          {filteredMedicines.value.slice(0, 5).map((medicine) => (
                            <button
                              key={medicine.id}
                              type="button"
                              class="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              onClick$={() => addMedicine(medicine.name)}
                            >
                              <div class="font-medium">{medicine.name}</div>
                              <div class="text-sm text-gray-500">
                                {medicine.category} - {medicine.quantity} in stock
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedMedicines.value.length > 0 && (
                      <div class="space-y-2">
                        <h4 class="text-sm font-medium text-gray-700">Selected Medicines:</h4>
                        {selectedMedicines.value.map((medicine) => (
                          <div key={medicine} class="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                            <span class="text-sm">{medicine}</span>
                            <button
                              type="button"
                              onClick$={() => removeMedicine(medicine)}
                              class="text-red-600 hover:text-red-800"
                            >
                              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    class="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    placeholder="Any additional notes, follow-up instructions, etc..."
                    value={notes.value}
                    onInput$={(e) => (notes.value = (e.target as HTMLTextAreaElement).value)}
                  />
                </div>

                <div class="flex justify-end space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick$={() => window.location.href = `/patients/${patient.value!.id}`}
                    disabled={isLoading.value}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick$={handleSubmit}
                    disabled={isLoading.value}
                  >
                    {isLoading.value ? "Saving..." : "Save Visit & Generate Prescription"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "New Visit - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Add a new patient visit and consultation",
    },
  ],
};