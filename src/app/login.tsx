"use client";

import React, {useState} from "react";
import styles from "./page.module.css";
import "./login.css";
import {MoonLoader} from "react-spinners";

export default function Login() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const res = await fetch("http://localhost:7474/signIn", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        })
        try {
            const data = await res.json();
            localStorage.setItem("token", data.token);
            window.location.href = "/account";
        } catch (err) {
            setError("Username or password is incorrect");
        }
        setLoading(false);
    }
    return (
        <form className="login" onSubmit={handleSubmit}>
            <img src={"/logo-placeholder-png-2.png"} alt="logo" />
            <h2>Welcome to SWGOH Utils</h2>
            <input
                name="username"
                id={"username"}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={true}
                placeholder="Username"
            />
            <input
                name="password"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={true}
                placeholder="Password"
            />
            <p className={"error"}>{error}</p>
            <button type="submit" id={"login"}>{loading ? <MoonLoader size={"40px"} color={"#FFF"}/> : "Log In"}</button>
            <p id={"newHere"}>New here? <a href="/signUp" id={"createAccountLink"}>Create an account</a></p>
        </form>
    );
}