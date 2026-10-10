import {NextRequest, NextResponse} from "next/server";

const roles = ["client", "freelancer"];

type SignupRole = (typeof roles)[number];

function redirectToError(reason: string, request: NextRequest) {
    const errorUrl = new URL("/error", request.url);
    errorUrl.searchParams.set("reason", reason);
    return NextResponse.redirect(errorUrl.toString());
}

function isSignupRole(role: string | null): role is SignupRole {
    return role !== null && roles.includes(role);
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");
    const role = request.nextUrl.searchParams.get("role") as SignupRole | null;
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!token || !role) {
        return redirectToError("missing_or_invalid_token_or_role", request);
    }

    if(!isSignupRole(role)) {
        return redirectToError("invalid_role", request);
    }

    if(!secretKey) {
        console.error("CLERK_SECRET_KEY is not configured");
        return redirectToError("authentication_unavailable", request);
    }

    return NextResponse.json({ token, role });
}