"use client";
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {Player, Unit} from "@/app/types";
import {router} from "next/client";
const apiurl = "http://localhost:7474";

export default function Account() {
    const [accountData, setAccountData] = useState<Player | null>(null);
    const [charData, setCharData] = useState<[Unit] | null>(null);
    useEffect(() => {
        const allyCode = localStorage.getItem("allyCode");
        if(!allyCode) {
            router.push("/");
            return;
        }
        console.log(allyCode);
        fetch(`/api/account?allyCode=${allyCode}`)
            .then(res => res.json())
            .then(json => setAccountData(json.data))
            .catch(err => console.log(err));
        fetch("/api/character")
            .then(res => res.json())
            .then(json => setCharData(json.data))
            .catch(err => console.log(err));
    }, [router])
    // @ts-ignore
    return (
        <div>
            <p>{accountData ? accountData.name : "Loading..."}</p>
            <p>{charData ? charData[0].baseId : "Loading..."}</p>
        </div>
    );
}
