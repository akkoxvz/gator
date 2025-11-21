import { readConfig } from "src/config";
import { CommandHandler, UserCommandHandler } from "../../commands/commands";
import { getUserByName } from "../db/queries/users";

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName: string, ...args: string[]): Promise<void> => {
        const config = readConfig();
        const username = config.currentUserName;
        if (!username) {
            throw new Error("User is not logged in");
        }

        const user = await getUserByName(username);
        if (!user) {
            throw new Error(`User ${username} not found`);
        }

        await handler(cmdName, user, ...args);
    }
}

