// modified version of https://github.com/swordray/ispinner

export function Spinner({ className }: { className?: string }) {
	return (
		<div className={className}>
			<div
				style={{
					position: "relative",
					width: "2.1875rem",
					height: "2.1875rem",
				}}
			>
				{Array.from({ length: 8 }, (_, i) => (
					<div
						key={i}
						className="animate-spinner-blade"
						style={{
							position: "absolute",
							top: "0.71875rem",
							left: "0.9375rem",
							width: "0.3125rem",
							height: "0.75rem",
							backgroundColor: "#8e8e93",
							borderRadius: "0.15625rem",
							willChange: "opacity",
							transform: `rotate(${i * 45}deg) translateY(-0.71875rem)`,
							animationDelay: `${0.125 * (i - 14)}s`,
						}}
					></div>
				))}
			</div>
		</div>
	);
}
