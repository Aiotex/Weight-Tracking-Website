import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
	children: React.ReactNode;
	to: string;
	className?: string;
}

const ButtonNav: React.FC<ButtonProps> = ({ children, to, className }) => (
	<Link className={`${className} flex h-12 w-max items-center rounded-lg px-6 transition duration-200 ease-in-out hover:brightness-90`} to={to}>
		{children}
	</Link>
);

const Landingpage: React.FC = () => (
	<body className="text-m text-primary px-16 py-8">
		<nav className="flex items-center justify-between">
			<ul>
				<li className="flex w-min items-center gap-4">
					<img
						src="logo.png"
						alt="Logo"
						className="fil h-10 w-10"
						style={{
							filter: "invert(82%) sepia(57%) saturate(3995%) hue-rotate(136deg) brightness(88%) contrast(85%)",
						}}
					/>
					<h1 className="text-xl">Placeholder</h1>
				</li>
			</ul>

			<ul className="flex w-min items-center justify-center">
				<li>
					<ButtonNav to="/register">Regiter</ButtonNav>
				</li>
				<li>
					<ButtonNav className="bg-primary text-accent" to="/login">
						Login
					</ButtonNav>
				</li>
			</ul>
		</nav>

		<div className="flex w-max flex-col gap-14 px-32 py-40">
			<div className="text-xxl flex flex-col gap-4">
				<h1>Track your weight.</h1>
				<h1 className="bg-gradient-to-r from-[#3ab0b9] to-[#6bb591] bg-clip-text text-transparent">Understand your progress.</h1>
			</div>
			<div className="text-l flex flex-col gap-2">
				<p>Effortless logging meets powerful analytics</p>
				<p>so you can stay on track and actually see what's working</p>
			</div>
			<ButtonNav className="border-1 border-white" to="/register">
				Sign Up Today
			</ButtonNav>
		</div>

		<img src="/backgound-img.png" alt="Background" className="absolute right-0 bottom-0 z-[-1] h-[100%] object-cover" />
		<circle className="absolute top-75 left-[60%] z-[-2] aspect-square w-300 rounded-full bg-gradient-to-r from-[#3ab0b9] to-[#6bb591] opacity-70"></circle>
	</body>
);

export default Landingpage;
