import {NextRequest, NextResponse} from "next/server";

export async function POST(request: Request) {

    const requestData = await request.json();

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
        return NextResponse.json(
            { error: "Missing Authorization header" },
            { status: 401 }
        );
    }

    // If it’s like "Bearer <token>" extract the token
    const token = authHeader.replace("Bearer ", "");

    const response = await fetch(`http://localhost:7474/set_plan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
    });

    return NextResponse.json(
        { success: response.ok },
        { status: response.status }
    );
}