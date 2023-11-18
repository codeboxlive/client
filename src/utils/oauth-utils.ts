import { v4 as uuid } from "uuid";

const codeMap = new Map<string, string>();
export function getOAuthCode(oid: string): string {
    const code = uuid();
    codeMap.set(oid, code);
    return code;
}

export function isOAuthValidCode(code: string, oid: string): boolean {
    const check = codeMap.get(oid);
    if (check !== code) {
        return false;
    }
    codeMap.delete(code);
    return true;
}
