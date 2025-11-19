import { setUser } from "../config";

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("the login handler expects a single argument, the username");
    }

    const userName = args[0]
    setUser(userName);
    console.log(`Username ${userName} was set`);
}