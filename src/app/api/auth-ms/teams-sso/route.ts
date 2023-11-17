import type { NextApiRequest, NextApiResponse } from 'next';

export const GET = (req: NextApiRequest, res: NextApiResponse) => {
    const { authorization } = req.headers;
    if (!authorization) {
        res.status(500).json({ error: "Invalid headers. Please include an Authorization header with a Teams auth token."});
        return res;
    }

    try {
        throw new Error("Not implemented exception");
    } catch (error) {
        res.status(500).json({ error: 'Token exchange failed' });
    }

    return res;
}
