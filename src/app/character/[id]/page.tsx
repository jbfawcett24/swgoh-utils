"use client"

import { useParams} from "next/navigation";
import { useEffect, useState } from "react";

export default function Character() {
    const {id} = useParams();
    const [character, setCharacter] = useState(null);
    const [charLookup, setCharacterLookup] = useState(null);

    useEffect(() => {
        async function getCharacter() {
            console.log(id);
            const res = await fetch (`/api/character?charId=${id}`);
            const character = await res.json();
            console.log(character.data);
            setCharacter(character.data);
        }
        async function getLookup() {
            const res = await fetch("/charLookup.json");
            const data = await res.json();
            console.log(data);
            setCharacterLookup(data);
        }
        getCharacter();
        getLookup();
    }, [id])

    return (
        <div>
            {character ? <p>{charLookup?.[character.baseId]}</p> : <p>Loading...</p>}
        </div>
    );
}