import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import PortfolioPage from "./pages/PortfolioPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <Outlet />
    </>
  ),
});

const portfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PortfolioPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([portfolioRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
