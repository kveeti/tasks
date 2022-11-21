import type { LogActorType, LogType } from "@prisma/client";
import { UseFormReturn, useForm } from "react-hook-form";

type FormType = {
	logType: LogType;
	targetType: LogActorType;
	executorId: string;
	targetId: string;
	targetOwnerId: string;
};

export type LogFiltersForm = UseFormReturn<FormType>;

export const useLogFiltersForm = () => {
	const form = useForm<FormType>();

	return form;
};
