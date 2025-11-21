import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Search, Plus, Edit, Package, AlertTriangle, TrendingDown } from "lucide-react";

const mockInventory = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    manufacturer: "PharmaCorp",
    stock: 450,
    threshold: 100,
    unit: "Tablets",
    expiryDate: "2025-08-15",
    price: 0.15,
    batchNo: "BATCH2024A"
  },
  {
    id: "MED002",
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    manufacturer: "MediLabs",
    stock: 125,
    threshold: 50,
    unit: "Capsules",
    expiryDate: "2025-06-20",
    price: 0.45,
    batchNo: "BATCH2024B"
  },
  {
    id: "MED003",
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    manufacturer: "PharmaCorp",
    stock: 280,
    threshold: 75,
    unit: "Tablets",
    expiryDate: "2025-12-10",
    price: 0.20,
    batchNo: "BATCH2024C"
  },
  {
    id: "MED004",
    name: "Metformin 500mg",
    category: "Diabetes",
    manufacturer: "HealthPharma",
    stock: 35,
    threshold: 100,
    unit: "Tablets",
    expiryDate: "2025-04-30",
    price: 0.30,
    batchNo: "BATCH2024D"
  },
  {
    id: "MED005",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    manufacturer: "CardioMed",
    stock: 180,
    threshold: 60,
    unit: "Tablets",
    expiryDate: "2025-09-25",
    price: 0.35,
    batchNo: "BATCH2024E"
  },
  {
    id: "MED006",
    name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    manufacturer: "DigestPharma",
    stock: 15,
    threshold: 80,
    unit: "Capsules",
    expiryDate: "2025-03-15",
    price: 0.40,
    batchNo: "BATCH2024F"
  },
  {
    id: "MED007",
    name: "Cetirizine 10mg",
    category: "Antihistamines",
    manufacturer: "AllergyMed",
    stock: 320,
    threshold: 100,
    unit: "Tablets",
    expiryDate: "2025-11-30",
    price: 0.25,
    batchNo: "BATCH2024G"
  },
];

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);

  const filteredInventory = mockInventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (stock: number, threshold: number) => {
    const percentage = (stock / threshold) * 100;
    if (percentage <= 25) return { status: "critical", color: "text-red-600", variant: "destructive" as const };
    if (percentage <= 50) return { status: "low", color: "text-orange-600", variant: "default" as const };
    if (percentage <= 100) return { status: "medium", color: "text-yellow-600", variant: "secondary" as const };
    return { status: "good", color: "text-green-600", variant: "outline" as const };
  };

  const lowStockCount = mockInventory.filter(item => item.stock < item.threshold).length;
  const criticalStockCount = mockInventory.filter(item => (item.stock / item.threshold) * 100 <= 25).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage medicines stock and inventory levels</p>
        </div>
        <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Medicine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Medicine</DialogTitle>
              <DialogDescription>
                Enter medicine details to add to inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicineName">Medicine Name</Label>
                <Input id="medicineName" placeholder="e.g., Paracetamol 500mg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="painRelief">Pain Relief</SelectItem>
                    <SelectItem value="antibiotics">Antibiotics</SelectItem>
                    <SelectItem value="diabetes">Diabetes</SelectItem>
                    <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                    <SelectItem value="gastrointestinal">Gastrointestinal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" placeholder="Manufacturer name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNo">Batch Number</Label>
                <Input id="batchNo" placeholder="BATCH2024X" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Stock</Label>
                <Input id="quantity" type="number" placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Minimum Threshold</Label>
                <Input id="threshold" type="number" placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="capsules">Capsules</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="vials">Vials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Unit Price ($)</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMedicineOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddMedicineOpen(false)}>Add to Inventory</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Items</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockInventory.length}</div>
            <p className="text-xs text-gray-500 mt-1">Unique medicines in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-gray-500 mt-1">Below threshold level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{criticalStockCount}</div>
            <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Value</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              ${mockInventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicines Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by medicine name, ID, or category..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painRelief">Pain Relief</SelectItem>
                <SelectItem value="antibiotics">Antibiotics</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Batch No.</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock, item.threshold);
                  const stockPercentage = Math.min((item.stock / item.threshold) * 100, 100);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex justify-between items-center">
                            <span className={stockStatus.color}>
                              {item.stock} {item.unit}
                            </span>
                            {item.stock < item.threshold && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <Progress value={stockPercentage} className="h-2" />
                          <div className="text-xs text-gray-500">
                            Threshold: {item.threshold} {item.unit}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.batchNo}</TableCell>
                      <TableCell>{item.expiryDate}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Restock
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredInventory.length} of {mockInventory.length} items
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
