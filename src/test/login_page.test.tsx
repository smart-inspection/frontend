import { Route, Routes } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import user_event from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/features/auth/pages/LoginPage";
import { render_with_providers } from "@/test/render";

const mock_use_current_user_query = vi.fn();
const mock_use_login_mutation = vi.fn();

vi.mock("@/features/auth/api/auth.queries", async () => {
    const actual =
        await vi.importActual<typeof import("@/features/auth/api/auth.queries")>(
            "@/features/auth/api/auth.queries",
        );

    return {
        ...actual,
        use_current_user_query: undefined,
        use_login_mutation: undefined,
        useCurrentUserQuery: () => mock_use_current_user_query(),
        useLoginMutation: () => mock_use_login_mutation(),
    };
});

function render_login_page() {
    return render_with_providers(
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>dashboard_inicial</div>} />
        </Routes>,
        "/login",
    );
}

describe("login_page", () => {
    beforeEach(() => {
        mock_use_current_user_query.mockReturnValue({
            data: undefined,
        });

        mock_use_login_mutation.mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        });
    });

    it("cp_fnt_auth_001_cargar_pagina_de_login", async () => {
        const user = user_event.setup();

        render_login_page();

        const email_input = screen.getByLabelText(/correo electrónico/i);
        const password_input = screen.getByLabelText(/contraseña/i);
        const submit_button = screen.getByRole("button", {
            name: /ingresar/i,
        });

        expect(screen.getByText(/smart inspect/i)).toBeInTheDocument();
        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
        expect(email_input).toBeInTheDocument();
        expect(password_input).toBeInTheDocument();
        expect(submit_button).toBeEnabled();

        await user.type(email_input, "demo@empresa.com");
        await user.type(password_input, "12345678");

        expect(email_input).toHaveValue("demo@empresa.com");
        expect(password_input).toHaveValue("12345678");
    });

    it("cp_fnt_auth_002_iniciar_sesion_con_credenciales_validas", async () => {
        const user = user_event.setup();

        const mutate_spy = vi.fn(
            (
                _payload: { email: string; password: string },
                options?: {
                    onSuccess?: () => void;
                },
            ) => {
                options?.onSuccess?.();
            },
        );

        mock_use_login_mutation.mockReturnValue({
            mutate: mutate_spy,
            isPending: false,
        });

        render_login_page();

        await user.type(
            screen.getByLabelText(/correo electrónico/i),
            "demo@empresa.com",
        );
        await user.type(
            screen.getByLabelText(/contraseña/i),
            "12345678",
        );
        await user.click(
            screen.getByRole("button", {
                name: /ingresar/i,
            }),
        );

        await waitFor(() => {
            expect(mutate_spy).toHaveBeenCalledTimes(1);
        });

        expect(mutate_spy).toHaveBeenCalledWith(
            {
                email: "demo@empresa.com",
                password: "12345678",
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
                onError: expect.any(Function),
            }),
        );

        expect(await screen.findByText("dashboard_inicial")).toBeInTheDocument();
    });

    it("cp_fnt_auth_003_mostrar_error_en_login_invalido", async () => {
        const user = user_event.setup();

        const mutate_spy = vi.fn(
            (
                _payload: { email: string; password: string },
                options?: {
                    onError?: (error: Error) => void;
                },
            ) => {
                options?.onError?.(new Error("401 unauthorized"));
            },
        );

        mock_use_login_mutation.mockReturnValue({
            mutate: mutate_spy,
            isPending: false,
        });

        render_login_page();

        await user.type(
            screen.getByLabelText(/correo electrónico/i),
            "demo@empresa.com",
        );
        await user.type(
            screen.getByLabelText(/contraseña/i),
            "credencial_invalida",
        );
        await user.click(
            screen.getByRole("button", {
                name: /ingresar/i,
            }),
        );

        expect(
            await screen.findByText(
                /credenciales incorrectas\. verifica tu correo y contraseña\./i,
            ),
        ).toBeInTheDocument();

        expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ingresar/i })).toBeEnabled();
    });
});