import { PlayIcon } from "@radix-ui/react-icons";
import { Button2, Button3 } from "../Ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Ui/Select";

export function AppPage() {
	return (
		<div className="flex flex-col p-10 items-center justify-center w-full h-full gap-10">
			<div className="flex flex-col items-center justify-center gap-10">
				<span className="transition-all duration-200 w-full justify-center flex text-[4.4rem] leading-[1] line font-semibold border-2 border-gray-800 border-b-4 bg-gray-1000 py-4 px-3 rounded-xl">
					<h2 className="tabular-nums">
						<span>110</span>
						<span>:</span>
						<span>00</span>
					</h2>
				</span>

				<div className="flex gap-1.5 w-[15rem]">
					<div className="flex w-full flex-col gap-1.5 border-2 border-gray-800/80 rounded-2xl p-1.5">
						<Button2 className="py-2 text-sm">+ 30 min</Button2>
						<Button2 className="py-2 text-sm">- 30 min</Button2>
					</div>

					<div className="flex w-full flex-col gap-1.5 border-2 border-gray-800/80 rounded-2xl p-1.5">
						<Button2 className="py-2 text-sm">+ 5 min</Button2>
						<Button2 className="py-2 text-sm">- 5 min</Button2>
					</div>
				</div>

				<div>
					<Select required>
						<SelectTrigger aria-label="Tag">
							<SelectValue placeholder="Tag" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="coding">Coding</SelectItem>
							<SelectItem value="test">test</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="w-full">
					<Button3 className="grow h-full p-4 flex items-start justify-center">
						<PlayIcon className="h-6 w-6" />
					</Button3>
				</div>
			</div>
		</div>
	);
}
