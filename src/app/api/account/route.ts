import {NextRequest, NextResponse} from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const allyCode = searchParams.get("allyCode")?.replace(/"/g, "");

    if (!allyCode) {
        return NextResponse.json({ error: "Missing ally code" }, { status: 400 });
    }

    const response = await fetch(`http://localhost:7474/account`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            allyCode: allyCode, // must be 9 digits
        }),
    });
    console.log(response);
    const data = await response.json();

    console.log(data);
    return NextResponse.json({data});
}