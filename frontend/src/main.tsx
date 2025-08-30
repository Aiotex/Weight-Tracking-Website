import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";

import LandingPage from "./pages/landingPage.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import Overview from "./pages/overview.tsx";
import Analytics from "./pages/analytics.tsx";
import Settings from "./pages/settings.tsx";
import AppLayout from "./components/Layout.tsx";
import PersistLogin from "./components/PersistLogin.tsx";

import { AuthProvider } from "./context/AuthProvider.tsx";
import { UserPreferencesProvider } from "./context/UserPreferencesProvider.tsx";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RequireAuth from "./components/RequireAuth.tsx";

import { ROLES } from "./constants.ts";
import ErrorPage from "./pages/errorPage.tsx";

createRoot(document.getElementById("root")!).render(
	// TODO: Test app in StrictMode
	<BrowserRouter>
		<SkeletonTheme baseColor="#374151" highlightColor="#4b5563" borderRadius="0.5rem">
			<AuthProvider>
				<UserPreferencesProvider>
					<Routes>
						<Route index path="/" element={<LandingPage />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />

						{/* Not Found */}
						<Route path="404" element={<ErrorPage statusCode={404} />} />
						{/* Unauthorized */}
						<Route path="401" element={<ErrorPage statusCode={401} />} />
						{/* Forbidden */}
						<Route path="403" element={<ErrorPage statusCode={403} />} />
						{/* Internal Server Error */}
						<Route path="500" element={<ErrorPage statusCode={500} />} />
						{/* Bad Request */}
						<Route path="400" element={<ErrorPage statusCode={400} />} />
						{/* Service Unavailable */}
						<Route path="503" element={<ErrorPage statusCode={503} />} />

						<Route element={<PersistLogin />}>
							<Route element={<RequireAuth allowedRoles={[ROLES.USER.key, ROLES.ADMIN.key]} />}>
								<Route path="dashboard" element={<AppLayout />}>
									<Route path="overview" element={<Overview />} />
									<Route path="analytics" element={<Analytics />} />
									<Route path="settings" element={<Settings />} />
								</Route>
							</Route>
						</Route>

						{/* Catch-all for 404 */}
						<Route path="*" element={<ErrorPage statusCode={400} />} />
					</Routes>
				</UserPreferencesProvider>
			</AuthProvider>
			<ToastContainer
				position="top-center"
				autoClose={2000}
				hideProgressBar={true}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="colored"
				className={"text-m"}
			/>
		</SkeletonTheme>
	</BrowserRouter>,
);

//TODO: use a libary to combine tailwind classes
