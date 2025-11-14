import {NextResponse} from "next/server";

export async function GET(req: Request){
    const auth = req.headers.get('authorization');

    if (!auth) {
        return new Response("Unauthorized", { status: 401 });
    }

    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            authorization: auth,
        },
    }

    const response = await fetch("http://localhost:7474/refreshAccount", options);

    const data = await response.json();
    return NextResponse.json({ status: 200, data });
}

