"use client"
import Sidebar from "@/app/sidebar";
import "@/app/account.css";
import "@/app/planning.css";
import "@/app/globals.css";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {DisplayUnit, FullData, Player, RosterUnit, Unit} from "@/app/types";
import {makeFullData, UnitStars} from "@/app/account/page";
import Select from 'react-select';

export default function Planning() {

    const [accountData, setAccountData] = useState<Player | null>(null);
    const [charData, setCharData] = useState<Unit[] | null>(null);
    const [fullData, setFullData] = useState<FullData | null>(null);
    const [charLookup, setCharLookup] = useState<Record<string, string> | null>(null);
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        Promise.all([
            //fetch(`/api/account?allyCode=${allyCode}`).then(res => res.json()),
            fetch("/api/account", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => res.json()),
            fetch("/api/character").then(res => res.json()),
            fetch("/charLookup.json").then(res => res.json()),
            fetch("http://localhost:7474/get_plan", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => {
                console.log(res)
                return res.json()}),
        ])
            .then(([accountRes, charRes, lookup, plans]) => {
                //console.log(charRes);
                const account = accountRes.data;
                const chars = charRes.data;

                console.log(accountRes);
                console.log(account);
                console.log(plans)

                setAccountData(account);
                setCharData(chars);
                setCharLookup(lookup);
                setPlans(plans);

                const full = makeFullData(chars, account, lookup);
                setFullData(full);
            })
            .catch(err => console.error("Error fetching data:", err));
    }, [router]);
    return (
        <main>
            <Sidebar/>
            <div className="planning">
                <header>
                    <h1>Account Planning</h1>
                </header>
                <section className={"planningMain"}>
                    {fullData ? (
                        <>
                            {plans.map((plan: Plan, index) => (
                                <PlanCard key={index} plan={plan} fullData={fullData} />
                            ))}
                            <AddNewPlan fullData={fullData} />
                        </>
                    ) : (
                        "Loading..."
                    )}
                </section>

            </div>
        </main>
    )
}

type Plan = {
    name: string;
    icon: string;
    characters: CharPlan[];
}

type CharPlan = {
    baseId: string;
    name: string;
    icon: string;
    goalGear: number;
    goalRelic: number;
    goalStars: number;
}

type PlanCardProps = {
    plan: Plan;
    fullData: FullData;
}

function PlanCard({ plan, fullData }: PlanCardProps) {
    const [cardOpen, setCardOpen] = useState(false);
    const totalNeeded = plan.characters.reduce((total, char) => (char.goalStars + char.goalGear + char.goalRelic) + total, 0);

    const planIds = plan.characters.map(c => c.baseId);
    const accountChars = fullData?.units.filter(u => planIds.includes(u.baseId)) ?? [];

    const current = accountChars.reduce((total, char) => (total + char.currentTier + char.currentRarity + (char.relic?? 0)), 0);
    const percent = current / totalNeeded < 1 ? current/totalNeeded * 100 : 100;

    console.log(percent);

    return (
        <section className={"planCard"} onClick={() => setCardOpen(!cardOpen)}
             style={{ "--p": percent } as React.CSSProperties}>
            {cardOpen ? (
                <PlanCardOpen plan={plan} fullData={fullData} />
            ) : (
                <div className={"closed"}>
                    <img src={"http://localhost:7474/" + plan.icon} alt={plan.name}/>
                    <h2>{plan.name} : {Math.round(percent)}%</h2>
                </div>
            )}
        </section>
    )
}

function PlanCardOpen({ plan, fullData }:PlanCardProps) {
    const planIds = plan.characters.map(c => c.baseId);
    const accountChars = fullData?.units.filter(u => planIds.includes(u.baseId)) ?? [];

    const totalNeeded = plan.characters.reduce((total, char) => (char.goalStars + char.goalGear + char.goalRelic) + total, 0);

    const current = accountChars.reduce((total, char) => (total + char.currentTier + char.currentRarity + (char.relic?? 0)), 0);
    const percent = current / totalNeeded < 1 ? current/totalNeeded * 100 : 100;

    return (
        <div className={"open"}>
            <h2>{plan.name}: {Math.round(percent)}%</h2>
            {plan.characters.map((character: CharPlan) => {
                const accountChar = accountChars.find(c => c.baseId === character.baseId) ?? null;
                return <CharPlanSection key={character.baseId} charPlan={character} accountChar={accountChar} />
            })}
        </div>
    )
}

type CharPlanProps = {
    charPlan: CharPlan;
    accountChar: DisplayUnit | null;
}

function CharPlanSection({ charPlan, accountChar }: CharPlanProps) {
    const totalNeeded = charPlan.goalRelic + charPlan.goalGear + charPlan.goalStars;
    const relic = accountChar?.relic ?
        accountChar.relic -2 < 0 ?
            0 : accountChar.relic -2 < charPlan.goalRelic ?
                accountChar.relic -2 : charPlan.goalRelic
        : 0;

    const gear = accountChar?.currentTier && (accountChar.currentTier > charPlan.goalGear) ? charPlan.goalGear : accountChar?.currentTier;

    const stars = accountChar?.currentRarity  && (accountChar?.currentRarity > charPlan.goalStars) ? charPlan.goalStars : accountChar?.currentRarity ? accountChar?.currentRarity : 0;

    const current =
        (relic ?? 0) +
        (gear ?? 0) +
        (accountChar?.currentRarity ?? 0);

    const percent = current/totalNeeded <= 1 ? current/totalNeeded * 100 : 100;

    console.log(`${current}/${totalNeeded} - ${percent}`);

    return (
        <div className={"character"}>
            <img src={"http://localhost:7474/" + charPlan.icon} alt={charPlan.baseId}/>
            <div>
                <div className={"unitInfo"}>
                    <h3>{charPlan.name} | {charPlan.goalRelic > 0 ?
                        `Relic: ${relic}/${charPlan.goalRelic} | ` : ""}
                        Gear: {gear}/{charPlan.goalGear} |</h3>
                    <UnitStars stars={stars} total={charPlan.goalStars}/>
                </div>
                <div className={"progressBar"}
                     style={{ "--p": percent } as React.CSSProperties}>
                </div>
            </div>
        </div>
    )
}

type addProps = {
    fullData: FullData;
    close: () => void;
}

function AddNewPlan({fullData}:addProps) {
    const [open, setOpen] = useState(false);
    return (
        <section className = "addNew">
            {open ?
                <CreatePlan fullData={fullData} close={() => setOpen(false)}/>
                :
                <p onClick={() => setOpen(!open)} className={"createPlan"}><span>+</span> Create Plan</p>}
        </section>
    )
}

type IconOption = {
    value: string;   // always string
    label: string;
};

function CreatePlan({fullData, close}:addProps) {
    const options:IconOption[] = fullData.units.map(unit => { return {value: unit.iconPath || "hi", label: unit.name} });
    const [newPlan, setNewPlan] = useState<Plan>({
        characters: [],
        icon: options[0].value,
        name: ""
    })
    const [error, setError] = useState<String>("");

    function addChar() {
        setNewPlan(prev => ({
            ...prev,
            characters: [
                ...prev.characters,
                {
                    baseId: "ADMIRALPIETT",
                    name: "Admiral Piett",
                    icon: "",
                    goalGear: 0,
                    goalRelic: 0,
                    goalStars: 0
                }
            ]
        }))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if(newPlan.name.length === 0) {
            setError("You need a name");
            return;
        } else if(newPlan.characters.length === 0) {
            setError("You need at least one character");
            return;
        } else {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(newPlan)
            }
            const response = await fetch("/api/setPlan", options);
            console.log(response);

            if(response.ok) {
                window.location.reload();
            }
        }
    }

    return (
        <form className={"newPlanForm"} onSubmit={(e) => handleSubmit(e)}>
            <p className={"close"} onClick={(e) => close()}>X</p>
            <div className={"newPlanHeader"}>
                <div className={"icon"}>
                    <img src={"http://localhost:7474/" + newPlan.icon} alt={"selected icon"}/>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        defaultValue={options[0]}
                        isDisabled={false}
                        isLoading={false}
                        isClearable={false}
                        isRtl={false}
                        isSearchable={true}
                        name="icon"
                        options={options}
                        onChange={(opt) => setNewPlan(prev => ({
                            ...prev,
                            icon: opt!.value
                        }))}
                    />
                </div>
                <div className={"newPlanTitle"}>
                    <div>
                        <label htmlFor={"name"}>Plan Name: </label>
                        <input
                            id={"name"}
                            type="text"
                            placeholder={"plan name"}
                            onChange={(e) =>
                                setNewPlan(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            />
                    </div>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        isDisabled={false}
                        isLoading={false}
                        isClearable={false}
                        isRtl={false}
                        isSearchable={true}
                        name="icon"
                        options={[{value: "Coming Soon", label: "Coming Soon"}]}
                    />
                </div>
            </div>
            <div className={"newPlanCharacters"}>
                {newPlan.characters.map((character, index) => (<CreateChar key={index} character={character} index={index} fullData={fullData} setNewPlan={setNewPlan} newPlan={newPlan}/>))}
            </div>
            <p className={"createNew"} onClick={addChar}>
                + Add Character
            </p>
            <button type={"submit"}>Create Plan</button>
            <p className={"error"}>{error}</p>
        </form>
    )
}

type createCharProps = {
    character: CharPlan;
    index: number;
    fullData: FullData;
    setNewPlan: React.Dispatch<React.SetStateAction<Plan>>;
    newPlan: Plan;
}

function CreateChar({character, index, fullData, setNewPlan, newPlan}:createCharProps) {
    const options = fullData.units.filter(unit =>
        !newPlan.characters.some(char => char.baseId === unit.baseId))
        .map(unit => {return {value: unit.baseId, label: unit.name}});
    return <section className={"createChar"}>
        <Select
            className="basic-single"
            classNamePrefix="select"
            defaultValue={options[0]}
            isDisabled={false}
            isLoading={false}
            isClearable={false}
            isRtl={false}
            isSearchable={true}
            name="charName"
            options={options}
            onChange={(opt) => {
                if (!opt) return;

                const selected = fullData.units.find(u => u.baseId === opt.value);
                if (!selected) return;

                setNewPlan(prev => {
                    const updated = [...prev.characters];
                    updated[index] = {
                        ...updated[index],
                        baseId: selected.baseId,
                        name: selected.name,
                        icon: selected.iconPath ?? "",
                    };
                    return { ...prev, characters: updated };
                });
            }}
        />
        <div className={"goalInput"}>
            <label htmlFor={"relic"}>Goal Relic</label>
            <input
                type="number"
                className="relic"
                name="relic"
                value={character.goalRelic}
                onChange={(e) => {
                    const relicValue = parseInt(e.target.value) || 0;
                    setNewPlan(prev => {
                        const updated = [...prev.characters];
                        updated[index] = {
                            ...updated[index],
                            goalRelic: relicValue,
                            // Lock gear to 13 if relic > 0
                            goalGear: relicValue > 0 ? 13 : updated[index].goalGear,
                            // Lock stars to 7 if relic > 0
                            goalStars: relicValue > 0 ? 7 : updated[index].goalStars
                        };
                        return { ...prev, characters: updated };
                    });
                }}
            />
        </div>
        <div className={"goalInput"}>
            <label htmlFor={"gear"}>Goal Gear</label>
            <input
                type="number"
                className="gear"
                name="gear"
                value={character.goalGear}
                disabled={character.goalRelic > 0}
                onChange={(e) => {
                    const gearValue = parseInt(e.target.value) || 0;
                    setNewPlan(prev => {
                        const updated = [...prev.characters];
                        updated[index] = {
                            ...updated[index],
                            goalGear: gearValue
                        };
                        return { ...prev, characters: updated };
                    });
                }}
            />
        </div>
        <div className={"goalInput"}>
            <label htmlFor={"star"}>Goal Stars</label>
            <input
                type="number"
                className="star"
                name="star"
                value={character.goalStars}
                disabled={character.goalRelic > 0}
                onChange={(e) => {
                    const starsValue = parseInt(e.target.value) || 0;
                    setNewPlan(prev => {
                        const updated = [...prev.characters];
                        updated[index] = {
                            ...updated[index],
                            goalStars: starsValue
                        };
                        return { ...prev, characters: updated };
                    });
                }}
            />
        </div>
        <p
            className="delete"
            onClick={() => {
                setNewPlan(prev => ({
                    ...prev,
                    characters: prev.characters.filter((_, i) => i !== index)
                }));
            }}
        >
            x
        </p>
    </section>
    // TODO - add goal gear, relic, and stars
    // submit button
    // delete character
    // style it all
    // delete plan - stretch
    // journey guide auto fill

}