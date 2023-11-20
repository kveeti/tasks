import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WithAnimation } from "@/components/with-animation";

export function AppSettingsPage() {
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

	return (
		<WithAnimation>
			<div className="flex h-full w-full flex-col">
				<div className="flex items-center justify-between gap-4 p-4 border-b">
					<h1 className="text-xl font-bold">settings</h1>
				</div>

				<div className="flex divide-y relative h-full flex-col overflow-auto bg-black">
					<section className="border-b divide-y divide-gray-900">
						<div className="flex items-center justify-between gap-2 px-4 py-3">
							<h2 className="font-semibold">notifications</h2>
						</div>

						<div className="flex items-center justify-between gap-2 px-5 py-2 text-sm font-medium">
							<label htmlFor="notifications">enable notifications</label>
							<Switch
								id="notifications"
								checked={notificationsEnabled}
								onCheckedChange={() =>
									setNotificationsEnabled(!notificationsEnabled)
								}
							/>
						</div>

						<AnimatePresence initial={false}>
							{notificationsEnabled && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="overflow-hidden"
								>
									<div className="flex items-center justify-between gap-2 px-5 py-2 text-sm font-medium">
										<label htmlFor="notifications">task ending</label>
										<Switch id="notifications" />
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</section>
				</div>

				<div className="border-t p-4 flex gap-4 justify-between">
					<Button variant="destructive">delete account</Button>
					<Button variant="secondary">log out</Button>
				</div>
			</div>
		</WithAnimation>
	);
}
