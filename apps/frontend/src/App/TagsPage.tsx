import { Button3 } from "../Ui/Button";
import { db } from "../db/db";
import { useUserId } from "../utils/auth";
import { useForm } from "../utils/useForm";
import { uuid } from "../utils/uuid";

export function TagsPage() {
	const userId = useUserId();

	const newTagForm = useForm({
		defaultValues: {
			label: "",
			color: "#fff",
		},
		onSubmit: (values) => {
			console.log(values);

			db.tags.add({
				id: uuid(),
				userId,
				createdAt: new Date(),
				color: values.color,
				label: values.label,
			});
		},
	});

	return (
		<div className="flex flex-col items-center justify-center h-full">
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
	);
}
