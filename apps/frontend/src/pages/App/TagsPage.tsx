import { createId } from "@tasks/shared";

import { Button3 } from "@/Ui/Button";
import { useUserId } from "@/auth";
import { db } from "@/db/db";
import { useForm } from "@/utils/useForm";

import { WithAnimation } from "./WithAnimation";

export function TagsPage() {
	const userId = useUserId();

	const newTagForm = useForm({
		defaultValues: {
			label: "",
			color: "#fff",
		},
		onSubmit: (values) => {
			db.tags.add({
				id: createId(),
				userId,
				createdAt: new Date(),
				color: values.color,
				label: values.label,
			});
		},
	});

	return (
		<WithAnimation>
			<div className="flex h-full flex-col items-center justify-center">
				<newTagForm.Form>
					<div className="flex flex-col gap-2">
						<label htmlFor="label">
							Label
							<input
								type="text"
								className="text-black"
								{...newTagForm.register("label")}
							/>
						</label>
						<label htmlFor="color">
							Color
							<input
								type="text"
								className="text-black"
								{...newTagForm.register("color")}
							/>
						</label>
						<Button3 type="submit" className="p-4">
							Submit
						</Button3>
					</div>
				</newTagForm.Form>
			</div>
		</WithAnimation>
	);
}
