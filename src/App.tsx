import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/contexts/DemoContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PTUIProvider } from "@/contexts/PTUIContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PTLayout } from "@/components/pt/PTLayout";
import { ClientLayout } from "@/components/client/ClientLayout";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import PTHome from "./pages/pt/PTHome.tsx";
import PTClients from "./pages/pt/PTClients.tsx";
import PTClientNew from "./pages/pt/PTClientNew.tsx";
import PTClientProfile from "./pages/pt/PTClientProfile.tsx";
import PTWorkoutBuilder from "./pages/pt/PTWorkoutBuilder.tsx";
import PTSettings from "./pages/pt/PTSettings.tsx";
import PTAI from "./pages/pt/PTAI.tsx";
import PTChat from "./pages/pt/PTChat.tsx";
import PTBusiness from "./pages/pt/PTBusiness.tsx";
import ClientHome from "./pages/client/ClientHome.tsx";
import ClientWorkout from "./pages/client/ClientWorkout.tsx";
import ClientChat from "./pages/client/ClientChat.tsx";
import ClientNutrition from "./pages/client/ClientNutrition.tsx";
import ClientProgress from "./pages/client/ClientProgress.tsx";
import ClientSettings from "./pages/client/ClientSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-center" richColors />
      <BrowserRouter>
        <AuthProvider>
          <DemoProvider>
            <PTUIProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                {/* PT routes */}
                <Route
                  path="/pt"
                  element={
                    <ProtectedRoute requireRole="trainer">
                      <PTLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PTHome />} />
                  <Route path="clients" element={<PTClients />} />
                  <Route path="clients/new" element={<PTClientNew />} />
                  <Route path="clients/:id" element={<PTClientProfile />} />
                  <Route path="clients/:clientId/workouts/:workoutId" element={<PTWorkoutBuilder />} />
                  <Route path="ai" element={<PTAI />} />
                  <Route path="chat" element={<PTChat />} />
                  <Route path="chat/:clientId" element={<PTChat />} />
                  <Route path="business" element={<PTBusiness />} />
                  <Route path="settings" element={<PTSettings />} />
                </Route>

                {/* Client routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute requireRole="client">
                      <ClientLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ClientHome />} />
                  <Route path="workout" element={<ClientWorkout />} />
                  <Route path="chat" element={<ClientChat />} />
                  <Route path="nutrition" element={<ClientNutrition />} />
                  <Route path="progress" element={<ClientProgress />} />
                  <Route path="settings" element={<ClientSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </PTUIProvider>
          </DemoProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
