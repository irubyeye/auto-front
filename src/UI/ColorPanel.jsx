import React, { useRef, useState } from 'react';
import { ColorWheelIcon } from '@radix-ui/react-icons';
import Input from './Input';

const ColorPanel = ({ adminMode, category, slot, providedColors, appearanceColors, setAppearanceColors, }) => {
	const [colors, setColors] = useState(providedColors || ["#000000"]);

	const handleDrag = (event, index) => {
		if (colors.length <= 1) return;
		const container = event.target.parentNode.getBoundingClientRect();
		if (event.clientX < container.left || event.clientX > container.right ||
			event.clientY < container.top || event.clientY > container.bottom) {
			setColors(prev => {
				const tmp = [...prev];
				tmp.splice(index, 1);
				return tmp;
			})
		}
	}

	const handleInput = (event, index) => {
		setColors(prev => {
			const tmp = [...prev];
			tmp[index] = event.target.value;
			if (index === tmp.length - 1) tmp.push("#000000");
			return tmp;
		})
	}

	const handleClick = event => {
		if (adminMode) return;
		event.preventDefault();
		setAppearanceColors(prev => ({ ...prev, [slot]: event.target.value }));
	}

	return (
		<div className='relative'>
			{/* colors-trigger */}
			<div onClick={e => { e.target.nextElementSibling.dataset.visible = "true"; e.target.nextElementSibling.nextElementSibling.dataset.visible = "true" }} className='p-1 bg-slate-100 dark:bg-zinc-700 border-2 rounded border-zinc-500 duration-75 hover:cursor-pointer hover:scale-110'><ColorWheelIcon className='pointer-events-none dark:text-orange-500' /></div>
			{/* colors-covering */}
			<div onClick={e => { e.target.dataset.visible = "false"; e.target.nextElementSibling.dataset.visible = "false" }} className='invisible fixed z-20 bg-transparent top-0 left-0 w-full h-full data-[visible=true]:visible' data-visible="false"></div>
			{/* colors-pop-up */}
			<div className='invisible flex flex-wrap gap-2 absolute top-[-55%] left-[-55%] w-24 h-24 p-1 rounded-lg z-20 bg-slate-200 dark:bg-zinc-600 overflow-y-auto custom-scrollbar border-2 border-slate-400 dark:border-zinc-400 data-[visible=true]:visible' id={category + "-" + slot + "-colors"} data-visible="false">
				{colors.map((color, index) => <Input onClick={handleClick} value={color} draggable onDragEnd={event => handleDrag(event, index)} callback={event => handleInput(event, index)} className={`!px-0 !w-7 duration-75 hover:scale-110 hover:cursor-pointer ${color === appearanceColors?.[slot] ? "!bg-orange-400" : "bg-transparent"}`} data-selected="false" key={category + "-" + slot + "-color-" + index} type="color" />)}
			</div>
		</div>
	);
};

export default ColorPanel;