import { LayoutGroup, motion } from "framer-motion";
import { z } from "zod";

import { cn } from "@/utils/classNames";
import type { UseFormReturn } from "@/utils/useForm";

export const tagColors = ["#d13c4b", "#1287A8", "#598392", "#AEC3B0", "#EFF6E0"] as const;
export type TagColors = (typeof tagColors)[number];
export const zodTagColors = z.enum(tagColors);

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
			className={cn(
				"relative h-9 w-9 cursor-pointer rounded-full outline-none outline-[3px] transition-[outline,outline-offset] duration-200 focus-visible:outline-gray-300",
				isSelected ? "outline-offset-[9px]" : "outline-offset-2"
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
