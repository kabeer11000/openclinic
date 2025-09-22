import { component$, useSignal, $ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { medicineService } from "../../../lib/firestore";
import type { Medicine } from "../../../store/clinic";

export default component$(() => {
  const name = useSignal("");
  const category = useSignal("");
  const quantity = useSignal("");
  const unitPrice = useSignal("");
  const expiryDate = useSignal("");
  const lowStockThreshold = useSignal("10");
  const isLoading = useSignal(false);
  const errors = useSignal<Record<string, string>>({});

  const validateForm = $(() => {
    const newErrors: Record<string, string> = {};

    if (!name.value.trim()) {
      newErrors.name = "Medicine name is required";
    }

    if (!category.value.trim()) {
      newErrors.category = "Category is required";
    }

    if (!quantity.value.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(quantity.value)) || Number(quantity.value) < 0) {
      newErrors.quantity = "Quantity must be a valid positive number";
    }

    if (!unitPrice.value.trim()) {
      newErrors.unitPrice = "Unit price is required";
    } else if (isNaN(Number(unitPrice.value)) || Number(unitPrice.value) <= 0) {
      newErrors.unitPrice = "Unit price must be a valid positive number";
    }

    if (!expiryDate.value) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const expiry = new Date(expiryDate.value);
      const today = new Date();
      if (expiry <= today) {
        newErrors.expiryDate = "Expiry date must be in the future";
      }
    }

    if (!lowStockThreshold.value.trim()) {
      newErrors.lowStockThreshold = "Low stock threshold is required";
    } else if (isNaN(Number(lowStockThreshold.value)) || Number(lowStockThreshold.value) < 0) {
      newErrors.lowStockThreshold = "Low stock threshold must be a valid positive number";
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  });

  const handleSubmit = $(async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    isLoading.value = true;

    try {
      const newMedicine = {
        name: name.value.trim(),
        category: category.value.trim(),
        quantity: Number(quantity.value),
        unitPrice: Number(unitPrice.value),
        expiryDate: new Date(expiryDate.value),
        lowStockThreshold: Number(lowStockThreshold.value),
      };

      // Save to Firestore
      await medicineService.add(newMedicine);

      // Redirect to medicines list
      window.location.href = "/medicines";
    } catch (error) {
      console.error("Error adding medicine:", error);
      errors.value = { ...errors.value, general: "Failed to save medicine. Please try again." };
    } finally {
      isLoading.value = false;
    }
  });

  // Common medicine categories
  const commonCategories = [
    "Painkiller",
    "Antibiotic",
    "Anti-inflammatory",
    "Diabetes",
    "Blood Pressure",
    "Blood Thinner",
    "Acid Reducer",
    "Antihistamine",
    "Vitamin",
    "Other"
  ];

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center h-16">
            <Button variant="ghost" onClick$={() => window.location.href = "/medicines"}>
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Inventory
            </Button>
            <h1 class="ml-4 text-2xl font-bold text-gray-900">Add New Medicine</h1>
          </div>
        </div>
      </header>

      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Medicine Information</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <Input
                  id="name"
                  placeholder="e.g., Paracetamol 500mg"
                  value={name.value}
                  onInput$={(e) => (name.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.name}
                />
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  value={category.value}
                  onChange$={(e) => (category.value = (e.target as HTMLSelectElement).value)}
                >
                  <option value="">Select category</option>
                  {commonCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.value.category && (
                  <p class="mt-1 text-sm text-red-600">{errors.value.category}</p>
                )}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity *
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={quantity.value}
                  onInput$={(e) => (quantity.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.quantity}
                />
              </div>

              <div>
                <label for="unitPrice" class="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price ($) *
                </label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={unitPrice.value}
                  onInput$={(e) => (unitPrice.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.unitPrice}
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate.value}
                  onInput$={(e) => (expiryDate.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.expiryDate}
                />
              </div>

              <div>
                <label for="lowStockThreshold" class="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold *
                </label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={lowStockThreshold.value}
                  onInput$={(e) => (lowStockThreshold.value = (e.target as HTMLInputElement).value)}
                  error={errors.value.lowStockThreshold}
                />
                <p class="mt-1 text-xs text-gray-500">
                  Alert when quantity falls below this number
                </p>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-800">
                    Medicine Information
                  </h3>
                  <div class="mt-2 text-sm text-blue-700">
                    <ul class="list-disc pl-5 space-y-1">
                      <li>Include dosage in the medicine name (e.g., "Paracetamol 500mg")</li>
                      <li>Set an appropriate low stock threshold to get timely alerts</li>
                      <li>Double-check the expiry date to avoid adding expired medicines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick$={() => window.location.href = "/medicines"}
                disabled={isLoading.value}
              >
                Cancel
              </Button>
              <Button
                onClick$={handleSubmit}
                disabled={isLoading.value}
              >
                {isLoading.value ? "Saving..." : "Save Medicine"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Add New Medicine - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Add a new medicine to the pharmacy inventory",
    },
  ],
};