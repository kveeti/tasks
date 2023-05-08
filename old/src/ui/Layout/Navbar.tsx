import { useRouter } from "next/router";

import { Button } from "~ui/Button";
import { Card } from "~ui/Card";

export const NavBar = () => {
	const router = useRouter();

	return (
		<nav className="fixed bottom-0 flex w-full items-center justify-center p-3 backdrop:blur-sm sm:top-0 sm:bottom-[unset]">
			<Card className="rounded-xl">
				<div className="grid h-[3.5rem] w-full max-w-[280px] grid-cols-3 grid-rows-1 items-center justify-between gap-2 overflow-hidden p-2">
					<Button onClick={() => router.push("/stats")}>Stats</Button>
					<Button onClick={() => router.push("/")}>Home</Button>
					<Button onClick={() => router.push("/settings")}>Settings</Button>
				</div>
			</Card>
		</nav>
	);
};
