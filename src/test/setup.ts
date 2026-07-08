import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
    const native_request = globalThis.Request;
    const native_response = globalThis.Response;
    const native_headers = globalThis.Headers;

    class RequestWithoutSignal extends native_request {
        constructor(input: RequestInfo | URL, init?: RequestInit) {
            const patched_init = init
                ? {
                    ...init,
                    signal: undefined,
                }
                : init;

            super(input, patched_init);
        }
    }

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    Object.defineProperty(window, "scrollTo", {
        writable: true,
        value: vi.fn(),
    });

    Object.defineProperty(window, "requestAnimationFrame", {
        writable: true,
        value: (callback: FrameRequestCallback) =>
            window.setTimeout(() => callback(performance.now()), 0),
    });

    Object.defineProperty(window, "cancelAnimationFrame", {
        writable: true,
        value: (id: number) => window.clearTimeout(id),
    });

    Object.defineProperty(window, "Request", {
        writable: true,
        value: RequestWithoutSignal,
    });

    Object.defineProperty(window, "Response", {
        writable: true,
        value: native_response,
    });

    Object.defineProperty(window, "Headers", {
        writable: true,
        value: native_headers,
    });

    vi.stubGlobal("Request", RequestWithoutSignal);
    vi.stubGlobal("Response", native_response);
    vi.stubGlobal("Headers", native_headers);
});

afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
});