import { v4 as uuid } from "uuid";

const codeMap = new Map<string, boolean>();
export function getOAuthCode(): string {
    const code = uuid();
    codeMap.set(code, false);
    return code;
}

export function isOAuthValidCode(code: string): boolean {
    const check = codeMap.get(code);
    if (check === undefined || check === true) {
        return false;
    }
    codeMap.delete(code);
    return true;
}
