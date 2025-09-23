import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@nanostores/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { $user } from '@/store/auth';
import { $medicines, loadMedicines } from '@/store/clinic';
import { getPatient, createVisit } from '@/lib/firestore';
import { Patient, PrescribedMedicine } from '@/store/clinic';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  User,
  FileText,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { visitSchema, validateForm } from '@/lib/validations';
import type { VisitFormData } from '@/lib/validations';

export default function NewVisit() {
  const router = useRouter();
  const { id } = router.query;
  const user = useStore($user);
  const medicines = useStore($medicines);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState(medicines);

  const [formData, setFormData] = useState<VisitFormData>({
    diagnosis: '',
    notes: '',
    prescribedMedicines: []
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPatientData(id);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      loadMedicines();
    }
  }, [user]);

  useEffect(() => {
    if (medicineSearch.trim()) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        medicine.category.toLowerCase().includes(medicineSearch.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [medicineSearch, medicines]);

  const loadPatientData = async (patientId: string) => {
    setLoading(true);
    try {
      const { patient: patientData, error } = await getPatient(patientId);
      if (error) {
        toast.error(error);
        router.push('/patients');
      } else {
        setPatient(patientData);
      }
    } catch (error) {
      toast.error('Failed to load patient data');
      router.push('/patients');
    }
    setLoading(false);
  };

  const addMedicineToVisit = (medicine: any) => {
    const existingIndex = formData.prescribedMedicines.findIndex(
      med => med.medicineId === medicine.id
    );

    if (existingIndex >= 0) {
      toast.info('Medicine already added to prescription');
      return;
    }

    const newPrescribedMedicine: PrescribedMedicine = {
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: '',
      quantity: 1
    };

    setFormData({
      ...formData,
      prescribedMedicines: [...formData.prescribedMedicines, newPrescribedMedicine]
    });
  };

  const updatePrescribedMedicine = (index: number, field: keyof PrescribedMedicine, value: string | number) => {
    const updated = [...formData.prescribedMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, prescribedMedicines: updated });
  };

  const removePrescribedMedicine = (index: number) => {
    const updated = formData.prescribedMedicines.filter((_, i) => i !== index);
    setFormData({ ...formData, prescribedMedicines: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient) return;

    setSubmitting(true);

    try {
      // Validate form data
      const validation = validateForm(visitSchema, formData);
      if (!validation.success) {
        validation.errors?.forEach(error => toast.error(error));
        setSubmitting(false);
        return;
      }

      const visitData = {
        patientId: patient.id,
        date: new Date(),
        diagnosis: validation.data!.diagnosis,
        prescribedMedicines: validation.data!.prescribedMedicines || [],
        notes: validation.data!.notes
      };

      const { id: visitId, error } = await createVisit(visitData);

      if (error) {
        toast.error(error);
      } else {
        toast.success('Visit recorded successfully');
        router.push(`/patients/${patient.id}`);
      }
    } catch (error) {
      toast.error('Failed to record visit');
    }

    setSubmitting(false);
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
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patient
                </Button>
                <h1 className="text-xl font-semibold text-black">
                  New Visit - {patient.name}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visit Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Visit Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="diagnosis">Diagnosis *</Label>
                      <Input
                        id="diagnosis"
                        value={formData.diagnosis}
                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                        placeholder="Enter diagnosis"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about the visit"
                        className="w-full p-3 border border-gray-300 rounded-md focus:border-black focus:ring-black"
                        rows={4}
                      />
                    </div>

                    {/* Prescribed Medicines */}
                    <div className="space-y-4">
                      <Label>Prescribed Medicines</Label>

                      {formData.prescribedMedicines.length > 0 && (
                        <div className="space-y-3">
                          {formData.prescribedMedicines.map((med, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                              <div className="flex-1">
                                <p className="font-medium">{med.medicineName}</p>
                              </div>
                              <div className="w-32">
                                <Input
                                  placeholder="Dosage"
                                  value={med.dosage}
                                  onChange={(e) => updatePrescribedMedicine(index, 'dosage', e.target.value)}
                                />
                              </div>
                              <div className="w-20">
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  value={med.quantity}
                                  onChange={(e) => updatePrescribedMedicine(index, 'quantity', parseInt(e.target.value) || 0)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePrescribedMedicine(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/patients/${patient.id}`)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                      >
                        {submitting ? 'Recording Visit...' : 'Record Visit'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Medicine Selection */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Add Medicines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search medicines..."
                      value={medicineSearch}
                      onChange={(e) => setMedicineSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredMedicines.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        {medicineSearch ? 'No medicines found' : 'No medicines available'}
                      </p>
                    ) : (
                      filteredMedicines.map((medicine) => (
                        <div
                          key={medicine.id}
                          className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                          onClick={() => addMedicineToVisit(medicine)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{medicine.name}</p>
                              <p className="text-xs text-gray-500">{medicine.category}</p>
                              <p className="text-xs text-gray-600">Stock: {medicine.quantity}</p>
                            </div>
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Patient Info */}
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Patient Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{patient.name}, {patient.age} years</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{new Date().toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}