import type { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter: max X requests per minute per IP
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '10', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10); // Default 1 minute

interface RateInfo {
    timestamps: number[];
}

const ipMap = new Map<string, RateInfo>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = (req.ip ?? '') as string; // ensure string
    const now = Date.now();
    const info = ipMap.get(ip) ?? { timestamps: [] };
    // Remove timestamps older than window
    info.timestamps = info.timestamps.filter((t) => now - t < WINDOW_MS);
    if (info.timestamps.length >= MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    info.timestamps.push(now);
    ipMap.set(ip, info);
    next();
}
