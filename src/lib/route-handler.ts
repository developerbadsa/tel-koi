import { NextResponse } from "next/server";
import { isDatabaseConnectionError } from "@/lib/db";

type RouteHandler<TArgs extends unknown[]> = (...args: TArgs) => Promise<NextResponse>;

export function withRouteErrorHandling<TArgs extends unknown[]>(label: string, handler: RouteHandler<TArgs>): RouteHandler<TArgs> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`[${label}]`, error);

      if (isDatabaseConnectionError(error)) {
        const response = NextResponse.json(
          {
            error: "Database is temporarily unavailable. Please try again in a moment.",
            code: "DATABASE_UNAVAILABLE",
          },
          { status: 503 },
        );
        response.headers.set("Retry-After", "30");
        return response;
      }

      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  };
}
