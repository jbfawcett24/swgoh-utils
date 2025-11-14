"use client";
import styles from "./page.module.css";
import "../globals.css";
import "../account.css";
import React, { useEffect, useState } from "react";
import { DisplayUnit, FullData, Player, Unit } from "@/app/types";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/sidebar";
import {MoonLoader} from "react-spinners";

const apiurl = "http://162.255.77.151:7474";

export default function Account() {
    const [accountData, setAccountData] = useState<Player | null>(null);
    const [charData, setCharData] = useState<Unit[] | null>(null);
    const [fullData, setFullData] = useState<FullData | null>(null);
    const [charLookup, setCharLookup] = useState<Record<string, string> | null>(null);
    const router = useRouter();
    const [tab, setTab] = useState("characters")

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        Promise.all([
            //fetch(`/api/account?allyCode=${allyCode}`).then(res => res.json()),
            fetch("http://localhost:7474/account", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => res.json()),
            fetch("/api/character").then(res => res.json()),
            fetch("/charLookup.json").then(res => res.json())
        ])
            .then(([accountRes, charRes, lookup]) => {
                const account = accountRes;
                const chars = charRes.data;

                console.log(accountRes);
                console.log(account);

                setAccountData(account);
                setCharData(chars);
                setCharLookup(lookup);

                const full = makeFullData(chars, account, lookup);
                setFullData(full);
            })
            .catch(err => console.error("Error fetching data:", err));
    }, [router]);

    function changeTab(e:React.MouseEvent) {
        const target = e.target as HTMLElement;
        setTab(target.classList[0]);
    }

    function sortData(e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedId = e.target.selectedOptions[0].id;
        if (!fullData) return;

        const sortedData = { ...fullData, units: [...fullData.units] };

        switch (selectedId) {
            case "relicUp":
                sortedData.units.sort((a, b) => {
                    const diff = (a.relic ?? 0) - (b.relic ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "relicDown":
                sortedData.units.sort((a, b) => {
                    const diff = (b.relic ?? 0) - (a.relic ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "gearUp":
                sortedData.units.sort((a, b) => {
                    const diff = (a.currentTier ?? 0) - (b.currentTier ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "gearDown":
                sortedData.units.sort((a, b) => {
                    const diff = (b.currentTier ?? 0) - (a.currentTier ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "starUp":
                sortedData.units.sort((a, b) => {
                    const diff = (a.currentRarity ?? 0) - (b.currentRarity ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "starDown":
                sortedData.units.sort((a, b) => {
                    const diff = (b.currentRarity ?? 0) - (a.currentRarity ?? 0);
                    return diff !== 0 ? diff : a.name.localeCompare(b.name);
                });
                break;

            case "azUp":
                sortedData.units.sort((a, b) => a.name.localeCompare(b.name));
                break;

            case "azDown":
                sortedData.units.sort((a, b) => b.name.localeCompare(a.name));
                break;

            default:
                console.log("Unknown sort option:", selectedId);
                return;
        }

        setFullData(sortedData);
    }

    interface SettingsProps {
        lastUpdate: string | null;
    }

    function Settings({ lastUpdate }: SettingsProps) {
        const [loading, setLoading] = useState(false);

        async function syncAccount(){
            setLoading(true);
            if (!charData || !charLookup) {
                console.error("Character data or lookup not loaded yet.");
                return;
            }
            const token = localStorage.getItem("token");
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
            const data = await fetch("api/syncAccount", options);

            const json = await data.json();
            makeFullData(charData, json.data, charLookup);
            console.log(json);
            setLoading(false);
        }

        return (
            <section className={"settings"}>
                <h3>Game Data</h3>
                <p>Last updated: {formatTimestamp(lastUpdate)}</p>
                <button onClick={syncAccount}
                    className={loading? "loading": ""}
                >{loading ? <MoonLoader size={"20px"} color={"#FFF"}/> : "Sync with game"}</button>
            </section>
        )
    }

    function formatTimestamp(iso: string | null): string {
        if (!iso) return "Unknown";

        const date = new Date(iso);

        return date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    return (
        <main>
            <Sidebar />
            <div className="accountInfo">
                <header>
                    <section>
                        <h1>{accountData ? `${accountData.name} - Account` : "Loading..."}</h1>
                        <select className="sort" onChange={(e) => sortData(e)}>
                            <option id="relicDown">Relic ↓</option>
                            <option id="relicUp">Relic ↑</option>
                            <option id="gearDown">Gear ↓</option>
                            <option id="gearUp">Gear ↑</option>
                            <option id="starDown">Stars ↓</option>
                            <option id="starUp">Stars ↑</option>
                            <option id="azDown">A-Z ↓</option>
                            <option id="azUp">A-Z ↑</option>
                        </select>
                    </section>
                    <section className="tabs">
                        <h2 className="characters" id={tab === "characters" ? "selected" : ""} onClick={changeTab}>Characters</h2>
                        <h2 className={"settings"} id={tab === "settings" ? "selected": ""} onClick={changeTab}>Settings</h2>
                    </section>
                </header>
                <section className="units">
                    {fullData && tab === "characters"
                        ? fullData.units.map((unit: DisplayUnit) => (
                            <CharTemplate key={unit.baseId} character={unit} />
                        ))
                        : fullData && tab === "settings" ? <Settings lastUpdate={fullData.last_updated}/> :"Loading..."}
                </section>
            </div>
        </main>
    );
}

function makeFullData(
    charData: Unit[],
    playerData: Player,
    lookup: Record<string, string>
): FullData {
    const unitsWithName = charData
        .filter(unit => lookup[unit.baseId])
        .map(unit => {
            const rosterUnit = playerData.rosterUnit.find(
                (char: { definitionId: string }) =>
                    char.definitionId.split(":")[0] === unit.baseId
            );

            return {
                ...unit,
                name: lookup[unit.baseId], // guaranteed to exist now
                currentRarity: rosterUnit?.currentRarity ?? 0,
                currentLevel: rosterUnit?.currentLevel ?? 0,
                currentTier: rosterUnit?.currentTier ?? 0,
                relic: rosterUnit?.relic?.currentTier ?? null
            };
        });

    const fullData: FullData = {
        name: playerData.name,
        level: playerData.level,
        allyCode: playerData.allyCode,
        playerId: playerData.playerId,
        guildId: playerData.guildId,
        guildName: playerData.guildName,
        guildLogoBackground: playerData.guildLogoBackground,
        guildBannerColor: playerData.guildBannerColor,
        guildBannerLogo: playerData.guildBannerLogo,
        selectedPlayerTitle: playerData.selectedPlayerTitle.id,
        selectedPlayerPortrait: playerData.selectedPlayerPortrait.id,
        playerRating: playerData.playerRating,
        last_updated: playerData.last_updated,
        units: unitsWithName
    };

    // TODO - ADD CHARACTER TYPE (ship/ character) BASED ON CREW ARRAY / MANUAL OVERRIDE FOR CREWLESS

    fullData.units.sort((a, b) => {
        const diff = (b.relic ?? -1) - (a.relic ?? -1);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
    console.log(fullData);
    return fullData;
}

type CharTemplateProps = {
    character: DisplayUnit & { name: string };
};

function CharTemplate({ character }: CharTemplateProps) {
    return (
        <a
            className={character.categoryId.find(tag => tag.startsWith("alignment"))}
            href={`/character/${character.baseId}`}
        >
            <img src={`${apiurl}/${character.iconPath}`} alt={character.baseId} />
            <div>
                <h4>{character.name}</h4>
                <UnitStars stars={character.currentRarity} />
                <p>
                    {character.relic !== null
                        ? character.relic > 2
                            ? `Relic: ${character.relic - 2} | Gear: ${character.currentTier}`
                            : `Gear: ${character.currentTier}`
                        : ""}
                </p>
            </div>
        </a>
    );
}

function UnitStars({ stars }: { stars: number }) {
    const totalStars = 7;
    return (
        <p className="stars">
            {Array.from({ length: totalStars }, (_, i) => (
                <span key={i} className={i + 1 <= stars ? "filledStar" : "emptyStar"}>
                    ★
                </span>
            ))}
        </p>
    );
}