import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "../spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger";
	size?: "sm" | "md" | "lg";
	children: ReactNode;
	loading?: boolean;
}

export default function Button({
	variant = "primary",
	size = "md",
	className,
	children,
	loading,
	disabled,
	...props
}: ButtonProps) {
	const baseClasses =
		"inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

	const variantClasses = {
		primary: "bg-blue-500 text-white hover:bg-blue-600",
		secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
		danger: "bg-red-500 text-white hover:bg-red-600",
	};

	const sizeClasses = {
		sm: "h-8 px-3 text-sm",
		md: "h-10 px-4 py-2",
		lg: "h-12 px-8 text-lg",
	};

	return (
		<button
			className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading && (
				<>
					<Spinner size="sm" className="mr-2" />
				</>
			)}
			{children}
		</button>
	);
}
