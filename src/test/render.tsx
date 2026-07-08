import type { PropsWithChildren, ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import {
    MemoryRouter,
    RouterProvider,
    createMemoryRouter,
    type RouteObject,
} from "react-router-dom";

export function create_test_query_client() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
            mutations: {
                retry: false,
            },
        },
    });
}

type ProvidersProps = PropsWithChildren<{
    query_client: QueryClient;
}>;

function TestProviders({ children, query_client }: ProvidersProps) {
    return (
        <QueryClientProvider client={query_client}>{children}</QueryClientProvider>
    );
}

export function render_with_providers(
    ui: ReactElement,
    route = "/",
) {
    const query_client = create_test_query_client();

    return {
        query_client,
        ...render(
            <TestProviders query_client={query_client}>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            </TestProviders>,
        ),
    };
}

export function render_with_router(
    routes: RouteObject[],
    initial_entries: string[] = ["/"],
) {
    const query_client = create_test_query_client();
    const router = createMemoryRouter(routes, {
        initialEntries: initial_entries,
    });

    return {
        query_client,
        router,
        ...render(
            <TestProviders query_client={query_client}>
                <RouterProvider router={router} />
            </TestProviders>,
        ),
    };
}