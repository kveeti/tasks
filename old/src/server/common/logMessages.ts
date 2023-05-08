import { LogType } from "@prisma/client";

type LogMessages = {
	[key in LogType]: (...actorsIds: string[]) => string;
};

export const logMessages: LogMessages = {
	[LogType.UpdateUser]: (actor1, actor2) => `User ${actor1} updated user ${actor2}`,
	[LogType.DeleteUser]: (actor1, actor2) => `User ${actor1} deleted user ${actor2}`,

	[LogType.CreateTag]: (actor1, actor2) => `User ${actor1} created tag ${actor2}`,
	[LogType.UpdateTag]: (actor1, actor2) => `User ${actor1} updated tag ${actor2}`,
	[LogType.DeleteTag]: (actor1, actor2) => `User ${actor1} deleted tag ${actor2}`,

	[LogType.CreateTask]: (actor1, actor2) => `User ${actor1} created task ${actor2}`,
	[LogType.UpdateTask]: (actor1, actor2) => `User ${actor1} updated task ${actor2}`,
	[LogType.DeleteTask]: (actor1, actor2) => `User ${actor1} deleted task ${actor2}`,
	[LogType.StopTask]: (actor1, actor2) => `User ${actor1} stopped task ${actor2}`,
};
