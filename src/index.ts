import {
    setUser,
    readConfig
} from "./config";

function main() {
    setUser("John");
    const config = readConfig();
    console.log(config);
}

main();
