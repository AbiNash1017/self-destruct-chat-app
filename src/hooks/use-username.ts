import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

const NICKNAMES = [
    "Lazy Panda",
    "Cute Bunny",
    "Smarty Wolf",
    "Chill Koala",
    "Brave Tiger",
    "Silly Monkey",
    "Gentle Deer",
    "Clever Fox",
    "Happy Dolphin",
    "Bold Eagle"
];

const STORAGE_KEY = "chat_username";

const generateUsername = () => {
    const word = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)]
    return `${word}-${nanoid(5)}`
}

export const useUsername = () => {
    const [username, setUsername] = useState("");

    //goes to local browser level storgae and check does  user name exist under chat user name if yes it will use that username
    useEffect(() => {
        const main = () => {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored) {
                setUsername(stored);
                return;
            }
            const generated = generateUsername();
            localStorage.setItem(STORAGE_KEY, generated);
            setUsername(generated)
        }
        main();
    }, []);

    return { username };
}