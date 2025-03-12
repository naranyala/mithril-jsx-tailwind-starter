import "./style.css";
import m from "mithril";
import Layout from "./layouts/default";

// Error Boundary Component
const ErrorBoundary = {
	oninit(vnode) {
		this.error = null;
		this.originalView = vnode.children;
	},

	view(vnode) {
		if (this.error) {
			return (
				<Layout>
					<div class="min-h-screen p-8 bg-red-50">
						<div class="max-w-3xl mx-auto">
							<h1 class="text-2xl font-bold text-red-700 mb-4">
								Something went wrong
							</h1>
							<div class="bg-white rounded-lg shadow-lg p-6">
								<div class="text-red-600 font-mono mb-4">
									{this.error.message}
								</div>
								<pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">
									{this.error.stack}
								</pre>
								<button
									onclick={() => {
										this.error = null;
										m.redraw();
									}}
									class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
								>
									Try Again
								</button>
							</div>
						</div>
					</div>
				</Layout>
			);
		}
		return vnode.children;
	},

	onbeforeupdate(vnode) {
		// Reset error when route changes
		if (vnode.children !== this.originalView) {
			this.error = null;
			this.originalView = vnode.children;
		}
	},
};

// Route Error Component
const RouteError = {
	view({ attrs: { error } }) {
		return (
			<div>
				<div class="min-h-screen p-8 bg-red-50">
					<div class="max-w-3xl mx-auto">
						<h1 class="text-2xl font-bold text-red-700 mb-4">
							Error Loading Route
						</h1>
						<div class="bg-white rounded-lg shadow-lg p-6">
							<div class="text-red-600 font-mono mb-4"> {error.message} </div>
							<pre class="bg-gray-100 p-4 rounded overflow-auto text-sm">
								{error.stack}
							</pre>
							<button
								onclick={() => window.location.reload()}
								class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	},
};

// Dynamic route generation with error handling
const modules = import.meta.glob("./pages/**/index.{jsx,tsx}");
const tempRoutes: Record<string, any> = {};

for (const path in modules) {
	let routePath = path
		.replace("./pages", "")
		.replace(/\/index\.(jsx|tsx)$/, "")
		.replace(/\[([^\]]+)\]/g, ":$1");

	if (!routePath.startsWith("/")) {
		routePath = "/" + routePath;
	}

	tempRoutes[routePath] = {
		onmatch: async () => {
			try {
				const module = await modules[path]();
				const Component = module.default;

				// Wrap component with error boundary
				return {
					view: (vnode) => (
						<ErrorBoundary>
							<Component {...vnode.attrs} />
						</ErrorBoundary>
					),
				};
			} catch (error) {
				// Handle route loading errors
				return {
					view: () => <RouteError error={error} />,
				};
			}
		},
	};
}

// Not Found route with error boundary
tempRoutes["/:404..."] = {
	view: () => (
		<ErrorBoundary>
			<Layout>
				<div className="m-0 p-0">
					<h1 className="text-center font-bold text-3xl"> 404 Not Found</h1>
				</div>
			</Layout>
		</ErrorBoundary>
	),
};

export const routes = tempRoutes;

export function initRouter() {
	try {
		// Global error handler for uncaught errors
		window.onerror = (msg, url, lineNo, columnNo, error) => {
			console.error("[Global Error]", { msg, url, lineNo, columnNo, error });
			m.redraw(); // Ensure error state is rendered
		};

		// Global promise rejection handler
		window.onunhandledrejection = (event) => {
			console.error("[Unhandled Promise Rejection]", event.reason);
			m.redraw();
		};

		// Initialize router
		m.route(document.body, "/", routes);
	} catch (err) {
		console.error("[Router Initialization Error]", err);
		// Render fatal error directly to body
		m.render(document.body, <RouteError error={err} />);
	}
}
