import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Users, FileText, Package, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const patientData = [
  { day: "Mon", patients: 24 },
  { day: "Tue", patients: 32 },
  { day: "Wed", patients: 28 },
  { day: "Thu", patients: 35 },
  { day: "Fri", patients: 30 },
  { day: "Sat", patients: 18 },
  { day: "Sun", patients: 12 },
];

const inventoryAlerts = [
  { medicine: "Paracetamol 500mg", stock: 45, threshold: 100, severity: "medium" },
  { medicine: "Amoxicillin 250mg", stock: 12, threshold: 50, severity: "high" },
  { medicine: "Ibuprofen 400mg", stock: 8, threshold: 75, severity: "critical" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of clinic operations and key metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Today's Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">24</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from yesterday
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Patients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1,284</div>
            <p className="text-xs text-gray-500 mt-1">Active registered patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">18</div>
            <p className="text-xs text-gray-500 mt-1">Issued today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">3</div>
            <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventoryAlerts.length > 0 ? (
            inventoryAlerts.map((alert, index) => (
              <Alert key={index} className={
                alert.severity === "critical" ? "border-red-500 bg-red-50" :
                alert.severity === "high" ? "border-orange-500 bg-orange-50" :
                "border-yellow-500 bg-yellow-50"
              }>
                <AlertTriangle className={`h-4 w-4 ${
                  alert.severity === "critical" ? "text-red-600" :
                  alert.severity === "high" ? "text-orange-600" :
                  "text-yellow-600"
                }`} />
                <AlertTitle>Low Stock Alert</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {alert.medicine} - Only {alert.stock} units remaining (Threshold: {alert.threshold})
                  </span>
                  <Badge variant={
                    alert.severity === "critical" ? "destructive" : "default"
                  }>
                    {alert.severity.toUpperCase()}
                  </Badge>
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <p className="text-gray-500">No inventory alerts at this time</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Visits This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "09:00 AM", patient: "John Smith", reason: "Regular Checkup", status: "completed" },
              { time: "10:30 AM", patient: "Sarah Johnson", reason: "Follow-up Visit", status: "completed" },
              { time: "11:15 AM", patient: "Michael Brown", reason: "Consultation", status: "in-progress" },
              { time: "02:00 PM", patient: "Emily Davis", reason: "Vaccination", status: "upcoming" },
              { time: "03:30 PM", patient: "David Wilson", reason: "Regular Checkup", status: "upcoming" },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </div>
                  <div>
                    <div>{appointment.patient}</div>
                    <div className="text-sm text-gray-500">{appointment.reason}</div>
                  </div>
                </div>
                <Badge variant={
                  appointment.status === "completed" ? "secondary" :
                  appointment.status === "in-progress" ? "default" :
                  "outline"
                }>
                  {appointment.status === "in-progress" ? "In Progress" : 
                   appointment.status === "completed" ? "Completed" : "Upcoming"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
