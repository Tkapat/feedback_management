export declare class HttpError extends Error {
    status: number;
    errors?: unknown | undefined;
    constructor(status: number, message: string, errors?: unknown | undefined);
}
//# sourceMappingURL=HttpError.d.ts.map