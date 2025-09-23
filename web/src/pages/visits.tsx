import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { $user } from '@/store/auth';
import { $visits, $patients, $loading, loadVisits, loadPatients } from '@/store/clinic';
import {
  Search,
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function Visits() {
  const user = useStore($user);
  const visits = useStore($visits);
  const patients = useStore($patients);
  const loading = useStore($loading);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisits, setFilteredVisits] = useState(visits);

  useEffect(() => {
    if (user) {
      loadVisits();
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = visits.filter(visit => {
        const patient = patients.find(p => p.id === visit.patientId);
        return (
          visit.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (patient && patient.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          visit.notes?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredVisits(filtered);
    } else {
      setFilteredVisits(visits);
    }
  }, [searchQuery, visits, patients]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };

  const handleNewVisit = () => {
    if (patients.length === 0) {
      toast.error('Please add patients first before recording visits');
      router.push('/patients');
    } else {
      // For now, redirect to patients to select a patient
      router.push('/patients');
    }
  };

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
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-xl font-semibold text-black">Visit History</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search visits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
                <Button
                  className="bg-black hover:bg-gray-800 text-white"
                  onClick={handleNewVisit}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Visit
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Visits</p>
                    <p className="text-2xl font-semibold text-black">{filteredVisits.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today's Visits</p>
                    <p className="text-2xl font-semibold text-black">
                      {filteredVisits.filter(visit => {
                        const today = new Date();
                        const visitDate = new Date(visit.date);
                        return visitDate.toDateString() === today.toDateString();
                      }).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unique Patients</p>
                    <p className="text-2xl font-semibold text-black">
                      {new Set(filteredVisits.map(visit => visit.patientId)).size}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visits Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                All Visits ({filteredVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading visits...</span>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No visits found matching your search.' : 'No visits recorded yet.'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleNewVisit}
                      className="mt-4 bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Record First Visit
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Date</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Patient</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Diagnosis</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Medicines</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {visit.date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => router.push(`/patients/${visit.patientId}`)}
                            className="text-black hover:underline"
                          >
                            {getPatientName(visit.patientId)}
                          </button>
                        </TableCell>
                        <TableCell>{visit.diagnosis}</TableCell>
                        <TableCell>
                          {visit.prescribedMedicines.length > 0 ? (
                            <div className="space-y-1">
                              {visit.prescribedMedicines.slice(0, 2).map((med, index) => (
                                <div key={index} className="text-sm">
                                  {med.medicineName} - {med.dosage}
                                </div>
                              ))}
                              {visit.prescribedMedicines.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{visit.prescribedMedicines.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No medicines</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visit.notes ? (
                            <span className="text-sm">
                              {visit.notes.length > 50
                                ? `${visit.notes.substring(0, 50)}...`
                                : visit.notes}
                            </span>
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
    </ProtectedRoute>
  );
}