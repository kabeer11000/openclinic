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
import { $medicines, $loading, loadMedicines } from '@/store/clinic';
import { createMedicine, updateMedicine, deleteMedicine } from '@/lib/firestore';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Pill,
  Calendar,
  Package,
  DollarSign,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { medicineFormSchema, validateForm } from '@/lib/validations';
import type { MedicineFormData } from '@/lib/validations';

export default function Medicines() {
  const user = useStore($user);
  const medicines = useStore($medicines);
  const loading = useStore($loading);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState(medicines);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [formData, setFormData] = useState<MedicineFormData>({
    name: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    expiryDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadMedicines();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [searchQuery, medicines]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unitPrice: 0,
      expiryDate: ''
    });
    setEditingMedicine(null);
  };

  const handleOpenDialog = (medicine?: any) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        category: medicine.category,
        quantity: medicine.quantity,
        unitPrice: medicine.unitPrice,
        expiryDate: medicine.expiryDate.toISOString().split('T')[0]
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
      const validation = validateForm(medicineFormSchema, formData);
      if (!validation.success) {
        validation.errors?.forEach(error => toast.error(error));
        setSubmitting(false);
        return;
      }

      const medicineData = {
        ...validation.data!,
        expiryDate: new Date(validation.data!.expiryDate)
      };

      if (editingMedicine) {
        const { error } = await updateMedicine(editingMedicine.id, medicineData);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Medicine updated successfully');
          handleCloseDialog();
          loadMedicines();
        }
      } else {
        const { id, error } = await createMedicine(medicineData);
        if (error) {
          toast.error(error);
        } else {
          toast.success('Medicine added successfully');
          handleCloseDialog();
          loadMedicines();
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    }

    setSubmitting(false);
  };

  const handleDelete = async (medicineId: string, medicineName: string) => {
    if (confirm(`Are you sure you want to delete ${medicineName}?`)) {
      const { error } = await deleteMedicine(medicineId);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Medicine deleted successfully');
        loadMedicines();
      }
    }
  };

  const isLowStock = (quantity: number) => quantity <= 10;
  const isExpiringSoon = (expiryDate: Date) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiryDate <= thirtyDaysFromNow;
  };

  const lowStockCount = filteredMedicines.filter(med => isLowStock(med.quantity)).length;
  const expiringSoonCount = filteredMedicines.filter(med => isExpiringSoon(med.expiryDate)).length;

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
                <h1 className="text-xl font-semibold text-black">Medicine Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search medicines..."
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
                      Add Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Medicine Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Medicine name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., Antibiotic, Painkiller"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                          placeholder="Available quantity"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitPrice">Unit Price ($)</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                          placeholder="Price per unit"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                          required
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
                          {submitting ? 'Saving...' : editingMedicine ? 'Update' : 'Add'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Medicines</p>
                    <p className="text-2xl font-semibold text-black">{filteredMedicines.length}</p>
                  </div>
                  <Pill className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Stock</p>
                    <p className="text-2xl font-semibold text-black">
                      {filteredMedicines.reduce((sum, med) => sum + med.quantity, 0)}
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low Stock</p>
                    <p className="text-2xl font-semibold text-yellow-600">{lowStockCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expiring Soon</p>
                    <p className="text-2xl font-semibold text-red-600">{expiringSoonCount}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medicines Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                Medicine Inventory ({filteredMedicines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading medicines...</span>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No medicines found matching your search.' : 'No medicines in inventory yet.'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="mt-4 bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medicine
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Category</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Stock</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Price</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Expiry</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map((medicine) => (
                      <TableRow key={medicine.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium">{medicine.name}</TableCell>
                        <TableCell>{medicine.category}</TableCell>
                        <TableCell>
                          <span className={isLowStock(medicine.quantity) ? 'text-red-600 font-medium' : ''}>
                            {medicine.quantity}
                          </span>
                        </TableCell>
                        <TableCell>${medicine.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={isExpiringSoon(medicine.expiryDate) ? 'text-red-600 font-medium' : ''}>
                            {medicine.expiryDate.toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {isLowStock(medicine.quantity) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Low Stock
                              </span>
                            )}
                            {isExpiringSoon(medicine.expiryDate) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expiring Soon
                              </span>
                            )}
                            {!isLowStock(medicine.quantity) && !isExpiringSoon(medicine.expiryDate) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(medicine)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(medicine.id, medicine.name)}
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