import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@nanostores/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { $user } from '@/store/auth';
import { $selectedPatient, $visits, loadVisits } from '@/store/clinic';
import { getPatient } from '@/lib/firestore';
import { Patient, Visit } from '@/store/clinic';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Plus,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

export default function PatientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const user = useStore($user);
  const selectedPatient = useStore($selectedPatient);
  const visits = useStore($visits);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    setLoading(true);
    try {
      const { patient: patientData, error } = await getPatient(patientId);
      if (error) {
        toast.error(error);
        router.push('/patients');
      } else {
        setPatient(patientData);
        // Load visits for this patient
        await loadVisits(patientId);
      }
    } catch (error) {
      toast.error('Failed to load patient data');
      router.push('/patients');
    }
    setLoading(false);
  };

  const handleNewVisit = () => {
    router.push(`/patients/${id}/visit`);
  };

  const handleEditPatient = () => {
    router.push(`/patients?edit=${id}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading patient...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!patient) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Patient not found</p>
            <Button
              onClick={() => router.push('/patients')}
              className="mt-4"
              variant="outline"
            >
              Back to Patients
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/patients')}
                  className="text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patients
                </Button>
                <h1 className="text-xl font-semibold text-black">{patient.name}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditPatient}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Patient
                </Button>
                <Button
                  onClick={handleNewVisit}
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Visit
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Age & Gender</p>
                      <p className="font-medium">{patient.age} years, {patient.gender}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{patient.contact}</p>
                    </div>
                  </div>

                  {patient.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  )}

                  {patient.notes && (
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="font-medium">{patient.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Registered: {patient.createdAt.toLocaleDateString()}</p>
                      <p>Last Updated: {patient.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visits and History */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Visit History ({visits.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No visits recorded yet.</p>
                      <Button
                        onClick={handleNewVisit}
                        className="mt-4 bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record First Visit
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Diagnosis</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Medicines</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.map((visit) => (
                          <TableRow key={visit.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {visit.date.toLocaleDateString()}
                            </TableCell>
                            <TableCell>{visit.diagnosis}</TableCell>
                            <TableCell>
                              {visit.prescribedMedicines.length > 0 ? (
                                <div className="space-y-1">
                                  {visit.prescribedMedicines.map((med, index) => (
                                    <div key={index} className="text-sm">
                                      {med.medicineName} - {med.dosage} (Qty: {med.quantity})
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No medicines</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {visit.notes ? (
                                <span className="text-sm">{visit.notes}</span>
                              ) : (
                                <span className="text-gray-400">No notes</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}