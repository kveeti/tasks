import { useRouter } from "next/router";

import { Button } from "~ui/Button";

export const NavBar = () => {
	const router = useRouter();

	return (
		<nav className="fixed bottom-0 flex w-full items-center justify-center p-3 backdrop:blur-sm sm:top-0 sm:bottom-[unset]">
			<div className="grid h-[3.5rem] w-full max-w-[280px] grid-cols-3 grid-rows-1 items-center justify-between gap-2 overflow-hidden rounded-xl border border-p-700 bg-p-800 p-2">
				<Button size="small" onClick={() => router.push("/stats")}>
					Stats
				</Button>
				<Button size="small" onClick={() => router.push("/")}>
					Home
				</Button>
				<Button size="small" onClick={() => router.push("/settings")}>
					Settings
				</Button>
			</div>
		</nav>
	);
};
