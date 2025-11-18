import os from "os";
import fs from "fs";
import path from "path";

type Config = {
    dbUrl: string
    currentUserName: string
};

export function setUser(user: string) {
    const config = readConfig()
    config.currentUserName = user;
    writeConfigFile(config)
}

export function readConfig(): Config {
    const fullPath = getConfigFilePath();

    const data = fs.readFileSync(fullPath, "utf-8");
    const rawConfig = JSON.parse(data);

    return validateConfigFile(rawConfig);
}

function getConfigFilePath() {
    const configFileName = '.gatorconfig.json';
    const homeDir = os.homedir();

    return path.join(homeDir, configFileName);
}

function writeConfigFile(cfg: Config) {
    const fullPath = getConfigFilePath();
    
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    }

    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(fullPath, data, { encoding: "utf-8" });
}

function validateConfigFile(rawConfig: any): Config {
    if (!rawConfig || typeof rawConfig != "object") {
        throw new Error("Invalid data")
    }

    if (!rawConfig.db_url || typeof rawConfig.db_url != "string") {
        throw new Error("db_url is required in config file");
    }

    if (!rawConfig.current_user_name || typeof rawConfig.current_user_name != "string") {
        throw new Error("current_user_name is required in config file");
    }

    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name
    } as Config;
}
