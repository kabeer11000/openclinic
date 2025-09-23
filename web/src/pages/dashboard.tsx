import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { $user } from '@/store/auth';
import { $patients, $medicines, $visits, $todayStats, $loading, loadPatients, loadMedicines, loadTodayStats, loadVisits } from '@/store/clinic';
import { logout } from '@/lib/auth';
import {
  Search,
  Plus,
  UserPlus,
  Pill,
  FileText,
  BarChart3,
  LogOut,
  User,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const user = useStore($user);
  const patients = useStore($patients);
  const medicines = useStore($medicines);
  const visits = useStore($visits);
  const todayStats = useStore($todayStats);
  const loading = useStore($loading);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodayStats();
      loadPatients();
      loadMedicines();
      loadVisits();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = [];

      // Search patients
      const matchingPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.contact.includes(searchQuery)
      ).map(patient => ({ ...patient, type: 'patient' }));

      // Search medicines
      const matchingMedicines = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(medicine => ({ ...medicine, type: 'medicine' }));

      results.push(...matchingPatients.slice(0, 3));
      results.push(...matchingMedicines.slice(0, 3));

      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, patients, medicines]);

  const handleSearchSelect = (result: any) => {
    if (result.type === 'patient') {
      router.push(`/patients/${result.id}`);
    } else if (result.type === 'medicine') {
      router.push('/medicines');
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      toast.error(error);
    } else {
      toast.success('Logged out successfully');
    }
  };

  // Get recent patients (limit to 3 for display)
  const recentPatients = patients.slice(0, 3).map(patient => ({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    lastVisit: patient.updatedAt.toLocaleDateString(),
    status: 'Active'
  }));

  // Get low stock medicines (limit to 3 for display)
  const lowStockMedicines = medicines
    .filter(med => med.quantity <= 20)
    .slice(0, 3)
    .map(med => ({
      id: med.id,
      name: med.name,
      quantity: med.quantity,
      minStock: 20
    }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-black">Open Clinic</h1>
                <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                  <span>/</span>
                  <span>Dashboard</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Input
                    placeholder="Search patients, medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    className="pl-9 w-64 border-gray-300 focus:border-black focus:ring-black"
                  />
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleSearchSelect(result)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            {result.type === 'patient' ? (
                              <User className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Pill className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {result.type === 'patient' ? result.name : result.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.type === 'patient'
                                  ? `${result.age} years, ${result.contact}`
                                  : `${result.category}, Stock: ${result.quantity}`
                                }
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                      {searchResults.length === 0 && searchQuery.trim() && (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today's Patients</p>
                    <p className="text-2xl font-semibold text-black">{todayStats.patients}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
                    <p className="text-2xl font-semibold text-black">${todayStats.revenue}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Visits Today</p>
                    <p className="text-2xl font-semibold text-black">{todayStats.visits}</p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low Stock</p>
                    <p className="text-2xl font-semibold text-red-600">{todayStats.lowStock}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-black hover:bg-gray-800 text-white"
                onClick={() => router.push('/patients')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                New Patient
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => router.push('/medicines')}
              >
                <Pill className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => router.push('/visits')}
              >
                <FileText className="h-4 w-4 mr-2" />
                New Visit
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => toast.info('Reports feature coming soon!')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white">Overview</TabsTrigger>
              <TabsTrigger value="patients" className="data-[state=active]:bg-white">Patients</TabsTrigger>
              <TabsTrigger value="pharmacy" className="data-[state=active]:bg-white">Pharmacy</TabsTrigger>
              <TabsTrigger value="visits" className="data-[state=active]:bg-white">Visits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Patients */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">Recent Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Age</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Last Visit</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPatients.map((patient) => (
                          <TableRow key={patient.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.age}</TableCell>
                            <TableCell>{patient.lastVisit}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                patient.status === 'Active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {patient.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Low Stock Medicines */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">Low Stock Alert</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Medicine</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Current</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Min Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowStockMedicines.map((medicine) => (
                          <TableRow key={medicine.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell className="text-red-600 font-medium">{medicine.quantity}</TableCell>
                            <TableCell>{medicine.minStock}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patients">
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Patient Management ({patients.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => router.push('/patients')}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    View All Patients
                  </Button>
                </CardHeader>
                <CardContent>
                  {patients.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No patients registered yet.</p>
                      <Button
                        onClick={() => router.push('/patients')}
                        className="mt-4 bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Patient
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Age</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Contact</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Last Visit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patients.slice(0, 5).map((patient) => (
                          <TableRow key={patient.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium">
                              <button
                                onClick={() => router.push(`/patients/${patient.id}`)}
                                className="text-black hover:underline"
                              >
                                {patient.name}
                              </button>
                            </TableCell>
                            <TableCell>{patient.age}</TableCell>
                            <TableCell>{patient.contact}</TableCell>
                            <TableCell>{patient.updatedAt.toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pharmacy">
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Pharmacy Management ({medicines.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => router.push('/medicines')}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    View All Medicines
                  </Button>
                </CardHeader>
                <CardContent>
                  {medicines.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No medicines in inventory yet.</p>
                      <Button
                        onClick={() => router.push('/medicines')}
                        className="mt-4 bg-black hover:bg-gray-800 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Medicine
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Category</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Stock</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Price</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicines.slice(0, 5).map((medicine) => (
                          <TableRow key={medicine.id} className="border-gray-100 hover:bg-gray-50">
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>{medicine.category}</TableCell>
                            <TableCell>
                              <span className={medicine.quantity <= 10 ? 'text-red-600 font-medium' : ''}>
                                {medicine.quantity}
                              </span>
                            </TableCell>
                            <TableCell>${medicine.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              {medicine.quantity <= 10 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  In Stock
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visits">
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                    Recent Visits ({visits.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={() => router.push('/visits')}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    View All Visits
                  </Button>
                </CardHeader>
                <CardContent>
                  {visits.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No visits recorded yet.</p>
                      <Button
                        onClick={() => router.push('/visits')}
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
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Patient</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Diagnosis</TableHead>
                          <TableHead className="text-xs font-medium text-gray-500 uppercase">Medicines</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visits.slice(0, 5).map((visit) => {
                          const patient = patients.find(p => p.id === visit.patientId);
                          return (
                            <TableRow key={visit.id} className="border-gray-100 hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {visit.date.toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() => router.push(`/patients/${visit.patientId}`)}
                                  className="text-black hover:underline"
                                >
                                  {patient ? patient.name : 'Unknown Patient'}
                                </button>
                              </TableCell>
                              <TableCell>{visit.diagnosis}</TableCell>
                              <TableCell>
                                {visit.prescribedMedicines.length > 0 ? (
                                  <span className="text-sm">
                                    {visit.prescribedMedicines.length} medicine(s)
                                  </span>
                                ) : (
                                  <span className="text-gray-400">No medicines</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}