"use client";
import "../login.css"
import React, {useState} from "react";
import { MoonLoader } from "react-spinners";

export default function signUpPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [allyCode, setAllyCode] = useState("")
    const [email, setEmail] = useState("");
    const [userError, setUserError] = useState("");
    const [allyError, setAllyError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log(username, password, confirmPassword, allyCode)
        let error = false;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (username === "") {
            setUserError("Please enter a username");
            error = true;
        }
        if (allyCode.length < 9) {
            setAllyError("Please enter a valid ally code");
        }
        if (password !== confirmPassword) {
           setPasswordError("Passwords do not match");
           error = true;
        }
        if (password === "") {
            setPasswordError("Please enter a password");
            error = true;
        }
        if (!emailRegex.test(email)) {
            setEmailError("Invalid email address");
            error = true;
        }
        if (email === "") {
            setEmailError("Please enter a valid email address");
            error = true;
        }
        if (!error) {
            setUserError("");
            setAllyError("");
            setEmailError("");
            setPasswordError("");
            setLoading(true);
            console.log("User works!")
            const options = {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email,
                    allyCode: allyCode,
                })
            }
            const res = await fetch("/api/signUp", options);
            console.log(res);
            if (res.status === 409) {
                setUserError("User already exists");
                setLoading(false);
            } else {
                const data =  await res.json();
                localStorage.setItem("token", data.token);
                window.location.href = "/account";
            }
        }
    }

    return (
        <form className={"login signUp"} onSubmit={handleSubmit}>
            <h2>Create Your Account</h2>
            <label htmlFor={"username"}>Username</label>
            <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            ></input>
            {userError && (<p className={"error"}>{userError}</p>)}
            <label htmlFor={"allyCode"}>Ally Code</label>
            <input
                type={"text"}
                inputMode="numeric"
                value={allyCode}
                onChange={(e) => setAllyCode(e.target.value)}
            ></input>
            {allyError && (<p className={"error"}>{allyError}</p>)}
            <label htmlFor={"email"}>Email</label>
            <input
                type={"text"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            ></input>
            {emailError && (<p className={"error"}>{emailError}</p>)}
            <label htmlFor={"password"}>Password</label>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ></input>
            {passwordError && <p className="error">{passwordError}</p>}
            <label htmlFor={"confirmPassword"}>Confirm Password</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
            <button type="submit" id={"loginButton"}>{loading ? <MoonLoader size={"40px"} color={"#FFF"}/> : "Log In"}</button>
        </form>
    )
}