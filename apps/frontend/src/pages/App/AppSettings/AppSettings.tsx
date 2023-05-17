import { TurnOnNotifications } from "./Notifications";

export function AppSettingsPage() {
	return (
		<div className="flex flex-col gap-2 p-2">
			<TurnOnNotifications />
		</div>
	);
}
