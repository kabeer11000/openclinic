import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { patientService } from "../../lib/firestore";
import type { Patient } from "../../store/clinic";

export default component$(() => {
  const searchTerm = useSignal("");
  const allPatients = useSignal<Patient[]>([]);
  const filteredPatients = useSignal<Patient[]>([]);
  const loading = useSignal(true);

  // Load patients from Firestore
  useVisibleTask$(async () => {
    try {
      const patients = await patientService.getAll();
      allPatients.value = patients;
      filteredPatients.value = patients;
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      loading.value = false;
    }
  });

  // Filter patients based on search term
  useVisibleTask$(({ track }) => {
    track(() => searchTerm.value);

    if (!searchTerm.value) {
      filteredPatients.value = allPatients.value;
    } else {
      filteredPatients.value = allPatients.value.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        patient.contact.includes(searchTerm.value) ||
        patient.id.includes(searchTerm.value)
      );
    }
  });

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
              <h1 class="text-2xl font-bold text-gray-900">Patient Management</h1>
            </div>
            <Button onClick$={() => window.location.href = "/patients/new"}>
              Add New Patient
            </Button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card class="mb-6">
          <CardHeader>
            <CardTitle>Search Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex gap-4">
              <div class="flex-1">
                <Input
                  placeholder="Search by name, ID, or phone number..."
                  value={searchTerm.value}
                  onInput$={(e) => (searchTerm.value = (e.target as HTMLInputElement).value)}
                />
              </div>
              <Button variant="outline" onClick$={() => searchTerm.value = ""}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card class="spreadsheet-style">
          <CardHeader>
            <CardTitle>Patient List ({filteredPatients.value.length} found)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.value ? (
              <div class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p class="mt-2 text-gray-600">Loading patients...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.value.map((patient) => (
                    <TableRow key={patient.id} class="hover:bg-gray-50 cursor-pointer">
                      <TableCell class="font-mono text-sm">{patient.id.slice(0, 8)}...</TableCell>
                      <TableCell class="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell class="capitalize">{patient.gender}</TableCell>
                      <TableCell class="font-mono text-sm">{patient.contact}</TableCell>
                      <TableCell class="max-w-xs truncate" title={patient.address}>
                        {patient.address || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div class="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick$={() => window.location.href = `/patients/${patient.id}`}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick$={() => window.location.href = `/patients/${patient.id}/visit`}
                          >
                            New Visit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredPatients.value.length === 0 && (
              <div class="text-center py-8 text-gray-500">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                <p class="mt-1 text-sm text-gray-500">
                  {searchTerm.value ? "Try adjusting your search terms." : "Get started by adding a new patient."}
                </p>
                <div class="mt-6">
                  <Button onClick$={() => window.location.href = "/patients/new"}>
                    Add New Patient
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Patients - Open Clinic",
  meta: [
    {
      name: "description",
      content: "Search and manage patients in Open Clinic",
    },
  ],
};