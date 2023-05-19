import { type ComponentProps } from "react";
import { type FieldValues, useForm as RHF_useForm, type UseFormProps } from "react-hook-form";

type Props<TFieldValues extends FieldValues = FieldValues> = {
	onSubmit: (values: TFieldValues) => Promise<void> | void;
} & UseFormProps<TFieldValues>;

export function useForm<TFieldValues extends FieldValues = FieldValues>(
	props: Props<TFieldValues>
) {
	const { onSubmit, ...restProps } = props;

	const inner_onSubmit = (values: TFieldValues) => {
		onSubmit(values);
	};

	const { handleSubmit: RHF_form_handleSubmit, ...restOfForm } =
		RHF_useForm<TFieldValues>(restProps);

	return {
		...restOfForm,
		handleSubmit: RHF_form_handleSubmit(inner_onSubmit),
		Form: ({ children, ...rest }: Omit<ComponentProps<"form">, "onSubmit">) => (
			<form onSubmit={RHF_form_handleSubmit(inner_onSubmit)} {...rest}>
				{children}
			</form>
		),
	};
}
