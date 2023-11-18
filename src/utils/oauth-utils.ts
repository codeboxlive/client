import { v4 as uuid } from "uuid";

export interface IOAuthCodeData {
    accessToken: string;
    tid: string;
}

const codeMap = new Map<string, IOAuthCodeData>();
export function getOAuthCode(accessToken: string, tid: string): string {
    const code = uuid();
    codeMap.set(code, {
        accessToken,
        tid,
    });
    return code;
}

export function getTokenForCode(code: string): IOAuthCodeData {
    const res = codeMap.get(code);
    if (res === undefined) {
        throw new Error("Code not found");
    }
    codeMap.delete(code);
    return res;
}
