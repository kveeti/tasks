import { LayoutGroup, motion } from "framer-motion";
import type { UseFormReturn } from "react-hook-form";

import { classNames } from "~utils/classNames";

import { tagColors } from "../tagColors";
import type { TagColors } from "../tagColors";

type Props = {
	form: UseFormReturn<{ color: TagColors; label: string }>;
};

export const ColorSelector = ({ form }: Props) => {
	return (
		<LayoutGroup>
			<ul className="flex list-none justify-between pt-3">
				{tagColors.map((c) => (
					<Color
						key={c}
						color={c}
						isSelected={form.watch().color === c}
						onClick={() => {
							form.setValue("color", c);
							form.trigger("color");
						}}
					/>
				))}
			</ul>
		</LayoutGroup>
	);
};

type ColorProps = {
	isSelected: boolean;
	color: string;
	onClick: () => void;
};

const Color = ({ color, isSelected, onClick }: ColorProps) => {
	return (
		<li
			tabIndex={0}
			className={classNames(
				"relative h-9 w-9 cursor-pointer rounded-full outline-none outline outline-[3px] outline-offset-2 outline-transparent transition-[outline] duration-200 focus-visible:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-500",
				isSelected ? "focus-visible:outline-offset-[9px]" : "focus-visible:outline-offset-2"
			)}
			style={{ backgroundColor: color }}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.code === "Enter" || e.code === "Space") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			{isSelected && (
				<motion.div
					layoutId="tag-color-outline"
					className="absolute inset-[-7px] rounded-full border-4"
					initial={false}
					animate={{ borderColor: color }}
					transition={{
						type: "spring",
						stiffness: 500,
						damping: 30,
					}}
				/>
			)}
		</li>
	);
};
