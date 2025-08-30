import React from "react";
import { CheckIcon } from "../icons";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
	id: string;
	label: string;
};

const Checkbox: React.FC<CheckboxProps> = ({ id, label, ...rest }) => (
	<label htmlFor={id} className="text-s text-primary relative flex cursor-pointer items-center gap-2">
		<input
			id={id}
			name={id}
			type="checkbox"
			className="peer border-secondary checked:bg-primary flex h-4 w-4 appearance-none items-center justify-center rounded-sm border-1 checked:border-0"
			{...rest}
		/>
		<CheckIcon className="text-accent absolute left-0.5 hidden h-3 w-3 peer-checked:block" />
		{label}
	</label>
);

export default Checkbox;
