interface UserLog {
    userId: string;
    log: string;
}

class Logger {
    private logs: Map<string, UserLog> = new Map();

    public logProcess(user: string, process: string) {
        if (this.logs.has(user)) {
            this.logs.delete(user);
        }

        const log: UserLog = { userId: user, log: process };
        this.logs.set(user, log);

        this.printLogs();
    }

    private printLogs() {
        console.clear();
        this.logs.forEach((log) => {
            console.log(`${log.userId} ${log.log}`);
        });
    }
}

export const logger = new Logger()