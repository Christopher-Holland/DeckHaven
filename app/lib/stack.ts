import { StackServerApp } from "@stackframe/stack";

// Initialize Stack-Auth
// You'll need to set these environment variables:
// STACK_PROJECT_ID - Your Stack project ID
// STACK_PUBLISHABLE_CLIENT_KEY - Your publishable client key
// STACK_SECRET_KEY - Your secret key

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
});

