import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { logout } from "../../lib/firebase";
import { patientService, visitService, medicineService, initializeFirestore } from "../../lib/firestore";

export default component$(() => {
  const clinicStats = useSignal({
    totalPatientsToday: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const user = useSignal<any>(null);

  // Load user and clinic data
  useVisibleTask$(async () => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      user.value = JSON.parse(userData);
    }

    // Initialize Firestore with sample data if needed
    await initializeFirestore();

    // Calculate stats
    try {
      const patients = await patientService.getAll();
      const visits = await visitService.getAll();
      const medicines = await medicineService.getAll();

      // Get today's visits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysVisits = visits.filter(visit => {
        const visitDate = new Date(visit.date);
        return visitDate >= today && visitDate < tomorrow;
      });

      // Get low stock medicines
      const lowStockMedicines = medicines.filter(medicine =>
        medicine.quantity <= medicine.lowStockThreshold
      );

      clinicStats.value = {
        totalPatientsToday: todaysVisits.length,
        totalRevenue: todaysVisits.length * 50, // $50 per consultation
        lowStockCount: lowStockMedicines.length,
      };
    } catch (error) {
      console.error('Error loading clinic stats:', error);
    }
  });

  const handleLogout = $(async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      window.location.href = "/login";
    } catch (error) {
      console.error('Error logging out:', error);
    }
  });

  return (
    <div class="min-h-screen bg-gray-50">
      {/* Header */}
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900">Open Clinic Dashboard</h1>
              {user.value && (
                <div class="flex items-center space-x-2">
                  {user.value.photoURL && (
                    <img src={user.value.photoURL} alt="Profile" class="w-8 h-8 rounded-full" />
                  )}
                  <span class="text-sm text-gray-600">Welcome, {user.value.displayName || user.value.email}</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick$={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Patients Today</CardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{clinicStats.value.totalPatientsToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">${clinicStats.value.totalRevenue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Low Stock Medicines</CardTitle>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.966-.833-3.736 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold text-red-600">{clinicStats.value.lowStockCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button class="h-24 flex flex-col items-center justify-center space-y-2" onClick$={() => window.location.href = "/patients/new"}>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Patient</span>
          </Button>

          <Button variant="outline" class="h-24 flex flex-col items-center justify-center space-y-2" onClick$={() => window.location.href = "/patients"}>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search Patients</span>
          </Button>

          <Button variant="outline" class="h-24 flex flex-col items-center justify-center space-y-2" onClick$={() => window.location.href = "/medicines/new"}>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Medicine</span>
          </Button>

          <Button variant="outline" class="h-24 flex flex-col items-center justify-center space-y-2" onClick$={() => window.location.href = "/medicines"}>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>View Inventory</span>
          </Button>
        </div>

        {/* Navigation Menu */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <h3 class="font-semibold text-gray-900">Patient Management</h3>
                <div class="space-y-1">
                  <a href="/patients/new" class="block text-blue-600 hover:text-blue-800">Add New Patient</a>
                  <a href="/patients" class="block text-blue-600 hover:text-blue-800">Search Patients</a>
                  <a href="/patients" class="block text-blue-600 hover:text-blue-800">Patient Records</a>
                </div>
              </div>

              <div class="space-y-2">
                <h3 class="font-semibold text-gray-900">Pharmacy Management</h3>
                <div class="space-y-1">
                  <a href="/medicines/new" class="block text-blue-600 hover:text-blue-800">Add Medicine</a>
                  <a href="/medicines" class="block text-blue-600 hover:text-blue-800">View Inventory</a>
                  <a href="/medicines" class="block text-blue-600 hover:text-blue-800">Low Stock Alert</a>
                </div>
              </div>

              <div class="space-y-2">
                <h3 class="font-semibold text-gray-900">Prescriptions</h3>
                <div class="space-y-1">
                  <a href="/prescriptions" class="block text-blue-600 hover:text-blue-800">Generate Prescription</a>
                  <a href="/prescriptions" class="block text-blue-600 hover:text-blue-800">View Prescriptions</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dashboard - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Open Clinic Management System Dashboard",
    },
  ],
};