import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Modal } from "@/Ui/Modal";
import { Button } from "@/Ui/NewButton";
import { LinkButton } from "@/Ui/NewLink";
import { db } from "@/db/db";
import { useUser } from "@/utils/useUser";

export function UserMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const user = useUser();

	const navigate = useNavigate();

	return (
		<>
			<Button
				className="rounded-full bg-gray-600 h-10 w-10 flex items-center justify-center"
				onPress={() => setIsOpen(true)}
			>
				{(user?.email[0] || "T").toUpperCase()}
			</Button>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
				<div className="flex flex-col gap-4">
					<h1 className="text-2xl font-bold">actions</h1>

					<div className="flex flex-col gap-2">
						<LinkButton
							to="/app/settings"
							onPress={() => setIsOpen(false)}
							className="w-full p-3"
						>
							settings
						</LinkButton>

						<Button
							className="w-full p-3"
							onPress={() => {
								db.delete();
								localStorage.clear();
								navigate("/auth/login");
							}}
						>
							logout
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
