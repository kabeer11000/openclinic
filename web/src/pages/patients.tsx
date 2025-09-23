import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { $user } from '@/store/auth';
import { $patients, $loading, loadPatients } from '@/store/clinic';
import { createPatient, updatePatient, deletePatient, searchPatients } from '@/lib/firestore';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { patientSchema, validateForm } from '@/lib/validations';
import type { PatientFormData } from '@/lib/validations';

export default function Patients() {
  const user = useStore($user);
  const patients = useStore($patients);
  const loading = useStore($loading);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    gender: 'male',
    contact: '',
    address: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact.includes(searchQuery)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const resetForm = () => {
    setFormData({
      name: '',
      age: 0,
      gender: 'male',
      contact: '',
      address: '',
      notes: ''
    });
    setEditingPatient(null);
  };

  const handleOpenDialog = (patient?: any) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        contact: patient.contact,
        address: patient.address || '',
        notes: patient.notes || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form data
      const validation = validateForm(patientSchema, formData);
      if (!validation.success) {
        validation.errors?.forEach(error => toast.error(error));
        setSubmitting(false);
        return;
      }

      if (editingPatient) {
        const { error } = await updatePatient(editingPatient.id, validation.data!);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Patient updated successfully');
          handleCloseDialog();
          loadPatients();
        }
      } else {
        const { id, error } = await createPatient(validation.data!);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Patient created successfully');
          handleCloseDialog();
          loadPatients();
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }

    setSubmitting(false);
  };

  const handleDelete = async (patientId: string, patientName: string) => {
    if (confirm(`Are you sure you want to delete ${patientName}?`)) {
      const { error } = await deletePatient(patientId);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Patient deleted successfully');
        loadPatients();
      }
    }
  };

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`);
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
                <h1 className="text-xl font-semibold text-black">Patient Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-black hover:bg-gray-800 text-white"
                      onClick={() => handleOpenDialog()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Patient name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                          placeholder="Age"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:border-black focus:ring-black"
                          required
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact</Label>
                        <Input
                          id="contact"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          placeholder="Phone number or email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Patient address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes"
                          className="w-full p-2 border border-gray-300 rounded-md focus:border-black focus:ring-black"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseDialog}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 bg-black hover:bg-gray-800 text-white"
                        >
                          {submitting ? 'Saving...' : editingPatient ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Patients ({filteredPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading patients...</span>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No patients found matching your search.' : 'No patients registered yet.'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="mt-4 bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Patient
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Age</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Gender</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Contact</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Registered</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <button
                            onClick={() => handleViewPatient(patient.id)}
                            className="text-black hover:underline"
                          >
                            {patient.name}
                          </button>
                        </TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell className="capitalize">{patient.gender}</TableCell>
                        <TableCell>{patient.contact}</TableCell>
                        <TableCell>{patient.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(patient)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(patient.id, patient.name)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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