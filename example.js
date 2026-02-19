import Domlson from "./main.js";

const domlson = new Domlson();

async function start() {
    try {
        const config = await domlson.main("abc.dms");
        console.log("Parsed data:", config);
    } catch (err) {
        console.error("An error occured", err);
    }
}

start();