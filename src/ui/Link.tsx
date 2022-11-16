import { ComponentProps } from "react";

export const Link = (props: Omit<ComponentProps<"a">, "className">) => {
	return (
		<a
			{...props}
			className="w-max rounded-md outline-none outline-[3px] transition-[outline,_color,_background,_border] duration-200 focus-visible:outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-blue-500"
		>
			<span className="border-b-2 border-b-p-400 border-opacity-40 font-bold text-p-400 transition-all duration-200 hover:border-opacity-100 sm:text-base">
				{props.children}
			</span>
		</a>
	);
};
