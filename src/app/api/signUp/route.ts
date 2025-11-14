export async function POST(request: Request) {
    const data = await request.json();
    console.log(data);

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    }

    const apiResponse = await fetch("http://localhost:7474/signUp", options);
    console.log(apiResponse);

    if(apiResponse.status >= 200 && apiResponse.status < 300) {
        console.log("signing in");
        const loginOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: data.username,
                password: data.password,
            }),
        }
        const logInRes = await fetch("http://localhost:7474/signIn", loginOptions);
        console.log(logInRes);
        const loginData = await logInRes.json();
        console.log(loginData);
        return new Response(JSON.stringify(loginData), {status: 200});
    }

    return new Response(null, { status: apiResponse.status });
}