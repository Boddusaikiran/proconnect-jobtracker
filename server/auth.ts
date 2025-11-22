import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { users, type User } from "@shared/schema";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
    // Check if it's a bcrypt hash (starts with $2a, $2b, $2y)
    if (stored.startsWith("$")) {
        return await bcrypt.compare(supplied, stored);
    }

    // Fallback to legacy scrypt verification
    try {
        const [hashed, salt] = stored.split(".");
        const hashedBuf = Buffer.from(hashed, "hex");
        const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
        return timingSafeEqual(hashedBuf, suppliedBuf);
    } catch (e) {
        console.error("[Auth] Password comparison failed:", e);
        return false;
    }
}

export function setupAuth(app: any) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                console.log(`[Auth] Attempting login for: ${email}`);
                const user = await storage.getUserByEmail(email);
                if (!user) {
                    console.log("[Auth] User not found");
                    return done(null, false, { message: "Invalid credentials" });
                }

                // Check if user has a password (might be Google-only)
                if (!user.password) {
                    console.log("[Auth] No password set (Google user)");
                    return done(null, false, { message: "Please log in with Google" });
                }

                console.log("[Auth] Verifying password...");
                const isValid = await comparePasswords(password, user.password);
                console.log(`[Auth] Password valid: ${isValid}`);
                if (!isValid) return done(null, false, { message: "Invalid credentials" });

                return done(null, user);
            } catch (err) {
                console.error("[Auth] Login error:", err);
                return done(err);
            }
        })
    );

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || "mock_client_id",
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_client_secret",
                callbackURL: "/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) return done(new Error("No email found from Google"));

                    let user = await storage.getUserByEmail(email);

                    if (!user) {
                        // Create new user
                        const newUser = {
                            username: email.split("@")[0],
                            email,
                            fullName: profile.displayName,
                            googleId: profile.id,
                            role: "candidate", // Default role
                            password: "", // No password for Google users
                            headline: "New User",
                            avatarUrl: profile.photos?.[0]?.value,
                        };
                        user = await storage.createUser(newUser as any);
                    } else if (!user.googleId) {
                        // Link Google account to existing user
                        await storage.updateUser(user.id, { googleId: profile.id });
                    }

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Routes
    app.post("/api/auth/login", (req: any, res: any, next: any) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ error: info.message });
            req.logIn(user, (err: any) => {
                if (err) return next(err);
                const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || "dev_jwt_secret", { expiresIn: "30d" });
                res.json({ user, token });
            });
        })(req, res, next);
    });

    app.get(
        "/api/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req: any, res: any) => {
            const token = jwt.sign({ sub: req.user.id }, process.env.JWT_SECRET || "dev_jwt_secret", { expiresIn: "30d" });
            // Redirect to frontend with token
            res.redirect(`/?token=${token}`);
        }
    );

    app.post("/api/auth/logout", (req: any, res: any) => {
        req.logout(() => {
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req: any, res: any) => {
        if (!req.user) return res.status(401).json({ error: "Not authenticated" });
        res.json(req.user);
    });
}
