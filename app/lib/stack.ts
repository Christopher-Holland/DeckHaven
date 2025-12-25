/**
 * Stack Auth Configuration
 * 
 * Initializes and configures Stack-Auth for user authentication.
 * Stack-Auth provides authentication, user management, and session handling.
 * 
 * Required environment variables:
 * - STACK_PROJECT_ID: Your Stack project ID
 * - STACK_PUBLISHABLE_CLIENT_KEY: Your publishable client key
 * - STACK_SECRET_KEY: Your secret key
 * 
 * @module lib/stack
 */

import { StackServerApp } from "@stackframe/stack";

/**
 * Stack Server App instance
 * Handles server-side authentication operations
 */
export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        signIn: "/auth/signin",
        signUp: "/auth/signup",
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
    },
});
