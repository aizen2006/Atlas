import { createServer } from "node:net";

// Is `port` bindable right now on localhost?
function isFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = createServer();
        server.once("error", () => resolve(false));
        server.once("listening", () => server.close(() => resolve(true)));
        server.listen(port, "127.0.0.1");
    });
}

// Ask the OS for any free port by binding to 0.
function anyFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            server.close(() => {
                if (address && typeof address === "object") resolve(address.port);
                else reject(new Error("Could not determine a free port"));
            });
        });
    });
}

/**
 * Resolve the port Atlas should listen on: the preferred one if it's free,
 * otherwise an OS-assigned random free port. Keeps `npm run atlas` working even
 * when 3932 is already taken by another instance.
 */
export async function resolvePort(preferred = 3932): Promise<number> {
    if (await isFree(preferred)) return preferred;
    return anyFreePort();
}
