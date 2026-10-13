import { createClerkClient, verifyToken } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
  const secretKey = process.env.NEXT_PUBLIC_CLERK_SECRET_KEY;
  if (!token || !role) {
    return redirectToError("missing_or_invalid_token_or_role", request);
  }

  if (!isSignupRole(role)) {
    return redirectToError("invalid_role", request);
  }

  if (!secretKey) {
    console.error("NEXT_PUBLIC_CLERK_SECRET_KEY is not configured");
    return redirectToError("authentication_unavailable", request);
  }

  try {
    const claims = await verifyToken(token, {
      secretKey,
    });
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(claims.sub);

    if (user.unsafeMetadata.role !== role) {
      return redirectToError("role_mismatch", request);
    }
  } catch (err) {
    console.log(err);
    return redirectToError("invalid_token", request);
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sign-up`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
        cache: "no-store",
      },
    );

    if (!backendResponse.ok) {
      return redirectToError("backend_error", request);
    }
    const dashboardUrl =
      role === "client"
        ? process.env.NEXT_PUBLIC_CLIENT_DASHBOARD_URL
        : process.env.NEXT_PUBLIC_FREELANCER_DASHBOARD_URL;
    return NextResponse.redirect(new URL("/profile/edit", dashboardUrl), 303);
  } catch (err) {
    console.log(err);
    return redirectToError("backend_error", request);
  }
}
