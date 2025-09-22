import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { type DocumentHead, useLocation } from "@builder.io/qwik-city";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { patientService, visitService } from "../../../lib/firestore";
import type { Patient, Visit } from "../../../store/clinic";

export default component$(() => {
  const location = useLocation();
  const patient = useSignal<Patient | null>(null);
  const patientVisits = useSignal<Visit[]>([]);
  const loading = useSignal(true);

  // Load patient data
  useVisibleTask$(async () => {
    const patientId = location.params.id;

    try {
      // Find the patient
      const foundPatient = await patientService.getById(patientId);
      patient.value = foundPatient;

      // Get patient visits
      const visits = await visitService.getByPatientId(patientId);
      patientVisits.value = visits;
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      loading.value = false;
    }
  });

  if (loading.value) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Loading patient...</p>
        </div>
      </div>
    );
  }

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
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-4">
              <Button variant="ghost" onClick$={() => window.location.href = "/patients"}>
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Patients
              </Button>
              <h1 class="text-2xl font-bold text-gray-900">{patient.value.name}</h1>
            </div>
            <Button onClick$={() => window.location.href = `/patients/${patient.value!.id}/visit`}>
              Add New Visit
            </Button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Information */}
          <div class="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-gray-700">Patient ID</label>
                  <p class="text-sm text-gray-900 font-mono">{patient.value.id}</p>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700">Full Name</label>
                  <p class="text-sm text-gray-900">{patient.value.name}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700">Age</label>
                    <p class="text-sm text-gray-900">{patient.value.age} years</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">Gender</label>
                    <p class="text-sm text-gray-900 capitalize">{patient.value.gender}</p>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700">Contact</label>
                  <p class="text-sm text-gray-900 font-mono">{patient.value.contact}</p>
                </div>

                {patient.value.address && (
                  <div>
                    <label class="text-sm font-medium text-gray-700">Address</label>
                    <p class="text-sm text-gray-900">{patient.value.address}</p>
                  </div>
                )}

                {patient.value.notes && (
                  <div>
                    <label class="text-sm font-medium text-gray-700">Medical Notes</label>
                    <p class="text-sm text-gray-900">{patient.value.notes}</p>
                  </div>
                )}

                <div>
                  <label class="text-sm font-medium text-gray-700">Registered</label>
                  <p class="text-sm text-gray-900">
                    {new Date(patient.value.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visit History */}
          <div class="lg:col-span-2">
            <Card class="spreadsheet-style">
              <CardHeader class="flex flex-row items-center justify-between">
                <CardTitle>Visit History ({patientVisits.value.length} visits)</CardTitle>
                <Button size="sm" onClick$={() => window.location.href = `/patients/${patient.value!.id}/visit`}>
                  Add Visit
                </Button>
              </CardHeader>
              <CardContent>
                {patientVisits.value.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Prescribed Medicines</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientVisits.value.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell class="font-mono text-sm">
                            {new Date(visit.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell class="max-w-xs">
                            <div class="truncate" title={visit.diagnosis}>
                              {visit.diagnosis}
                            </div>
                            {visit.notes && (
                              <div class="text-xs text-gray-500 truncate" title={visit.notes}>
                                {visit.notes}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {visit.prescribedMedicines.length > 0 ? (
                              <div class="space-y-1">
                                {visit.prescribedMedicines.map((medicine, index) => (
                                  <div key={index} class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {medicine}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span class="text-gray-500 text-sm">No medicines</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No visits recorded</h3>
                    <p class="mt-1 text-sm text-gray-500">
                      This patient hasn't had any visits yet.
                    </p>
                    <div class="mt-6">
                      <Button onClick$={() => window.location.href = `/patients/${patient.value!.id}/visit`}>
                        Add First Visit
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Patient Profile - Open Clinic",
  meta: [
    {
      name: "description",
      content: "View patient profile and medical history",
    },
  ],
};