import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { medicineService } from "../../lib/firestore";
import type { Medicine } from "../../store/clinic";

export default component$(() => {
  const searchTerm = useSignal("");
  const allMedicines = useSignal<Medicine[]>([]);
  const filteredMedicines = useSignal<Medicine[]>([]);
  const showLowStockOnly = useSignal(false);
  const loading = useSignal(true);

  // Load medicines from Firestore
  useVisibleTask$(async () => {
    try {
      const medicines = await medicineService.getAll();
      allMedicines.value = medicines;
      filteredMedicines.value = medicines;
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      loading.value = false;
    }
  });

  // Filter medicines based on search term and low stock filter
  useVisibleTask$(({ track }) => {
    track(() => searchTerm.value);
    track(() => showLowStockOnly.value);

    let filtered = allMedicines.value;

    // Apply search filter
    if (searchTerm.value) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        medicine.id.includes(searchTerm.value)
      );
    }

    // Apply low stock filter
    if (showLowStockOnly.value) {
      filtered = filtered.filter(medicine => medicine.quantity <= medicine.lowStockThreshold);
    }

    filteredMedicines.value = filtered;
  });

  const isExpiringSoon = (expiryDate: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow;
  };

  const isLowStock = (medicine: any) => medicine.quantity <= medicine.lowStockThreshold;

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <Button variant="ghost" onClick$={() => window.location.href = "/dashboard"}>
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </Button>
              <h1 class="text-2xl font-bold text-gray-900">Pharmacy Inventory</h1>
            </div>
            <Button onClick$={() => window.location.href = "/medicines/new"}>
              Add New Medicine
            </Button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <Card class="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <Input
                  placeholder="Search by name, category, or ID..."
                  value={searchTerm.value}
                  onInput$={(e) => (searchTerm.value = (e.target as HTMLInputElement).value)}
                />
              </div>
              <div class="flex gap-2">
                <Button
                  variant={showLowStockOnly.value ? "default" : "outline"}
                  onClick$={() => showLowStockOnly.value = !showLowStockOnly.value}
                >
                  {showLowStockOnly.value ? "Show All" : "Low Stock Only"}
                </Button>
                <Button variant="outline" onClick$={() => {
                  searchTerm.value = "";
                  showLowStockOnly.value = false;
                }}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card class="spreadsheet-style">
          <CardHeader>
            <CardTitle>
              Medicine Inventory ({filteredMedicines.value.length} items)
              {showLowStockOnly.value && (
                <span class="ml-2 text-sm font-normal text-red-600">
                  - Low Stock Alert
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.value.map((medicine) => (
                  <TableRow key={medicine.id} class="hover:bg-gray-50">
                    <TableCell class="font-mono text-sm">{medicine.id}</TableCell>
                    <TableCell class="font-medium">{medicine.name}</TableCell>
                    <TableCell>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {medicine.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span class={isLowStock(medicine) ? "text-red-600 font-semibold" : ""}>
                        {medicine.quantity}
                      </span>
                      <span class="text-gray-500 text-sm ml-1">units</span>
                    </TableCell>
                    <TableCell class="font-mono">${medicine.unitPrice.toFixed(2)}</TableCell>
                    <TableCell class={isExpiringSoon(medicine.expiryDate) ? "text-orange-600" : ""}>
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div class="flex flex-col gap-1">
                        {isLowStock(medicine) && (
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Low Stock
                          </span>
                        )}
                        {isExpiringSoon(medicine.expiryDate) && (
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Expiring Soon
                          </span>
                        )}
                        {!isLowStock(medicine) && !isExpiringSoon(medicine.expiryDate) && (
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Update Stock
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredMedicines.value.length === 0 && (
              <div class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
                <p class="mt-1 text-sm text-gray-500">
                  {searchTerm.value || showLowStockOnly.value ? "Try adjusting your search or filters." : "Get started by adding medicines to your inventory."}
                </p>
                <div class="mt-6">
                  <Button onClick$={() => window.location.href = "/medicines/new"}>
                    Add New Medicine
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {filteredMedicines.value.length > 0 && (
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {filteredMedicines.value.filter(m => !isLowStock(m)).length}
                  </div>
                  <div class="text-sm text-gray-500">In Stock</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">
                    {filteredMedicines.value.filter(m => isLowStock(m)).length}
                  </div>
                  <div class="text-sm text-gray-500">Low Stock</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent class="p-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-orange-600">
                    {filteredMedicines.value.filter(m => isExpiringSoon(m.expiryDate)).length}
                  </div>
                  <div class="text-sm text-gray-500">Expiring Soon</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Pharmacy Inventory - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Manage pharmacy inventory in Open Clinic",
    },
  ],
};