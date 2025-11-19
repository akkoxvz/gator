import { createUser, getUserByName, getUsers, resetUserTable } from "../lib/db/queries/users";
import { readConfig, setUser } from "../config";

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

export async function handlerUsers(cmdName: string, ...args: string[]) {
    const users = await getUsers();
    
    const config = readConfig();
    const currUser = config.currentUserName;

    users.forEach(user => {
        console.log(`* ${user.name}${user.name == currUser ? ' (current)': ''}`)
    });
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await resetUserTable()
}