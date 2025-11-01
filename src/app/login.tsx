"use client";

import React, {useState} from "react";
import styles from "./page.module.css";
import "./login.css";

export default function Login() {
    const [allyCode, setAllyCode] = useState<string>("");
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const allyNum = parseInt(allyCode);
        localStorage.setItem("allyCode", JSON.stringify(allyCode).trim());
        console.log(allyCode);
        window.location.href = "/account";
    }
    return (
        <form className="login" onSubmit={handleSubmit}>
            <img src={"/logo-placeholder-png-2.png"} alt="logo" />
            <h2>Welcome to SWGOH Utils</h2>
            <input
                name="allyCode"
                id={"allyCode"}
                type="text"
                inputMode={"numeric"}
                value={allyCode}
                onChange={(e) => setAllyCode(e.target.value)}
                required={true}
                maxLength={9}
                minLength={9}
                placeholder="Enter Ally Code"
            />
            <button type="submit" id={"login"}>Log In</button>
        </form>
    );
}