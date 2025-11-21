import { useState } from "react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter
} from "./components/ui/sidebar";
import { Dashboard } from "./components/Dashboard";
import { PatientManagement } from "./components/PatientManagement";
import { PrescriptionManagement } from "./components/PrescriptionManagement";
import { InventoryManagement } from "./components/InventoryManagement";
import { LayoutDashboard, Users, FileText, Package, Settings, HelpCircle, Activity } from "lucide-react";
import { Separator } from "./components/ui/separator";

type Screen = "dashboard" | "patients" | "prescriptions" | "inventory";

const menuItems = [
  { id: "dashboard" as Screen, label: "Dashboard", icon: LayoutDashboard },
  { id: "patients" as Screen, label: "Patient Management", icon: Users },
  { id: "prescriptions" as Screen, label: "Prescriptions", icon: FileText },
  { id: "inventory" as Screen, label: "Inventory", icon: Package },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard />;
      case "patients":
        return <PatientManagement />;
      case "prescriptions":
        return <PrescriptionManagement />;
      case "inventory":
        return <InventoryManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-lg">ClinicCare</h2>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentScreen(item.id)}
                        isActive={currentScreen === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Other</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <HelpCircle className="h-4 w-4" />
                      <span>Help & Support</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-4 py-3 text-xs text-gray-500">
              <p>© 2024 ClinicCare System</p>
              <p>Version 1.0.0</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-xl">Clinic Management System</h2>
                <p className="text-sm text-gray-500">Welcome back, Dr. Admin</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="text-sm">Dr. Sarah Williams</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  SW
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 bg-gray-50">
            {renderScreen()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
