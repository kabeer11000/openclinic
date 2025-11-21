import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Eye, FileText, Calendar, User } from "lucide-react";

const mockPrescriptions = [
  {
    id: "RX001",
    patientId: "P001",
    patientName: "John Smith",
    doctorName: "Dr. Sarah Williams",
    date: "2024-11-18",
    medications: ["Amoxicillin 500mg", "Paracetamol 500mg"],
    diagnosis: "Upper Respiratory Infection",
    status: "Active"
  },
  {
    id: "RX002",
    patientId: "P002",
    patientName: "Sarah Johnson",
    doctorName: "Dr. Michael Chen",
    date: "2024-11-18",
    medications: ["Ibuprofen 400mg"],
    diagnosis: "Headache",
    status: "Active"
  },
  {
    id: "RX003",
    patientId: "P003",
    patientName: "Michael Brown",
    doctorName: "Dr. Sarah Williams",
    date: "2024-11-17",
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
    diagnosis: "Diabetes Management",
    status: "Active"
  },
  {
    id: "RX004",
    patientId: "P004",
    patientName: "Emily Davis",
    doctorName: "Dr. James Anderson",
    date: "2024-11-16",
    medications: ["Cetirizine 10mg"],
    diagnosis: "Allergic Rhinitis",
    status: "Active"
  },
  {
    id: "RX005",
    patientId: "P005",
    patientName: "David Wilson",
    doctorName: "Dr. Michael Chen",
    date: "2024-11-10",
    medications: ["Omeprazole 20mg"],
    diagnosis: "Acid Reflux",
    status: "Completed"
  },
];

export function PrescriptionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPrescriptionOpen, setIsAddPrescriptionOpen] = useState(false);

  const filteredPrescriptions = mockPrescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2">Prescription Management</h1>
          <p className="text-gray-600">Manage patient prescriptions and medication records</p>
        </div>
        <Dialog open={isAddPrescriptionOpen} onOpenChange={setIsAddPrescriptionOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
              <DialogDescription>
                Fill in the prescription details for the patient
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select>
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p001">John Smith (P001)</SelectItem>
                      <SelectItem value="p002">Sarah Johnson (P002)</SelectItem>
                      <SelectItem value="p003">Michael Brown (P003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Prescribing Doctor</Label>
                  <Select>
                    <SelectTrigger id="doctor">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d001">Dr. Sarah Williams</SelectItem>
                      <SelectItem value="d002">Dr. Michael Chen</SelectItem>
                      <SelectItem value="d003">Dr. James Anderson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" placeholder="Patient diagnosis" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Medications</Label>
                <Textarea 
                  id="medications" 
                  placeholder="List medications with dosage (e.g., Amoxicillin 500mg - 3 times daily for 7 days)"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea 
                  id="instructions" 
                  placeholder="Special instructions for patient"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input id="duration" type="number" placeholder="7" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPrescriptionOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddPrescriptionOpen(false)}>Create Prescription</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by prescription ID, patient name, or doctor..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rx ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Medications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell className="font-mono">{prescription.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div>{prescription.patientName}</div>
                          <div className="text-xs text-gray-500">{prescription.patientId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prescription.doctorName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {prescription.date}
                      </div>
                    </TableCell>
                    <TableCell>{prescription.diagnosis}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {prescription.medications.map((med, index) => (
                          <Badge key={index} variant="outline" className="block w-fit">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={prescription.status === "Active" ? "default" : "secondary"}>
                        {prescription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredPrescriptions.length} of {mockPrescriptions.length} prescriptions
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
