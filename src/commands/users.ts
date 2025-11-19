import { createUser, getUserByName } from "../lib/db/queries/users";
import { setUser } from "../config";

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("the login handler expects a single argument, the username");
    }

    const userName = args[0]
    const currUser = await getUserByName(userName);
    if (!currUser) {
        throw new Error(`user ${userName} not found`);
    }
    setUser(userName);
    console.log(`Username ${userName} was set`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("the register handler expects a single argument, the username");
    }

    const username = args[0]
    const result = await getUserByName(username);
    if (result) {
        throw new Error(`error handlerRegister: user ${username} already exists`)
    }

    const currUser = await createUser(username)
    setUser(username)

    console.log(`User ${username} was created and set`)
}