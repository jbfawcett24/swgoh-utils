import {NextResponse} from "next/server";

export async function GET(request:Request) {
    const { searchParams } = new URL(request.url);
    let charId = searchParams.get("charId");

    if (!charId) {
        charId = "";
    }
    console.log(charId);

    const response = await fetch(`http://localhost:7474/characters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            charId: charId,
        }),
    });

    let data = await response.json();

    //console.log(data);
    if(charId === "") {
        return NextResponse.json({data});
    }
    return NextResponse.json({data});
}