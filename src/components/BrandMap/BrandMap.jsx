import React, { useEffect, useState, useContext } from 'react';
import { Cross1Icon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import * as Separator from '@radix-ui/react-separator';
import * as HoverCard from '@radix-ui/react-hover-card';
import Regions from './Regions';
import { LangContext } from '../../context';
import { dictionary } from './dictionary';


const BrandMap = ({ setSelectedBrand }) => {
	const [selectedRegion, setSelectedRegion] = useState(null);
	const { language } = useContext(LangContext);
	const rectangles = [];

	/* map init */
	useEffect(() => {
		try {
			// изначально минимальное приближение
			let zoom = 0;
			// под экраны побольше можно приблизить
			if (window.matchMedia("(min-width: 460px)").matches) zoom = 1;
			if (window.matchMedia("(min-width: 1023px)").matches) zoom = 2;
			// init map
			const map = window.L.map('map', {
				zoomControl: false,
				dragging: false
			}).setView([40, 10], zoom);
			// set view
			window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: zoom,
				minZoom: zoom,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);
			// draw regions
			Object.entries(Regions).forEach(([region, regionInfo]) => {
				const rectangle = window.L.rectangle([
					[regionInfo.y + 17, regionInfo.x - 28],
					[regionInfo.y - 17, regionInfo.x + 28]
				]).addTo(map);
				rectangle.on("click", () => setSelectedRegion(region));

				rectangle.on("mouseover", () => rectangle.setBounds([
					[regionInfo.y + 20, regionInfo.x - 32],
					[regionInfo.y - 20, regionInfo.x + 32]
				]));
				rectangle.on("mouseout", () => rectangle.setBounds([
					[regionInfo.y + 17, regionInfo.x - 28],
					[regionInfo.y - 17, regionInfo.x + 28]
				]));

				rectangles.push(rectangle);
			});
		} catch (error) {
			console.log(error.toString());
		}

		return rectangles.forEach(rectangle => rectangle.removeEventListener("click", () => setSelectedRegion()));
	}, []);

	useEffect(() => {
		if (!selectedRegion) setSelectedBrand(null);
	}, [selectedRegion]);

	return (
		<div className='relative h-52 sm:h-60 md:h-80 lg:h-96'>
			{/* map container */}
			<div id='map' className='h-full border-2 border-slate-400 rounded shadow-2xl z-0'></div>
			<HoverCard.Root>
				<HoverCard.Trigger asChild>
					<QuestionMarkCircledIcon className='absolute top-3 right-4 size-8 text-blue-700' />
				</HoverCard.Trigger>
				<HoverCard.Portal>
					<HoverCard.Content className='bg-zinc-600/20 font-semibold text-blue-600' sideOffset={10} side='left'>
						{dictionary.instruction[language]}
					</HoverCard.Content>
				</HoverCard.Portal>
			</HoverCard.Root>
			{/* map overlay */}
			{selectedRegion && <div className='absolute top-0 left-0 p-2 w-full h-full overflow-hidden text-white bg-black bg-opacity-70 lg:px-10 lg:py-6'>
				<span className='font-bold lg:text-xl'>{selectedRegion}</span>
				<Cross1Icon className='float-right size-6 duration-150 hover:scale-150 hover:cursor-pointer' onClick={() => setSelectedRegion(null)} />
				{/* country-brands table */}
				<div className='flex flex-col pl-4 pt-2 pb-9 max-h-full overflow-y-scroll custom-scrollbar sm:pl-0'>
					{Object.entries(Regions[selectedRegion])
						.filter(entry => entry[0] !== "x" && entry[0] !== "y")
						.map(([country, brands], countryIndex) => (
							/* country-brands row */
							<div className='' key={`map-${country}-row`}>
								<Separator.Root className='bg-slate-400 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full' decorative />
								<div className='flex flex-col gap-4 pt-3 pb-9 sm:flex-row sm:gap-10 md:pb-11'>
									{/* country */}
									<div className='self-center text-wrap sm:w-16'>{country}</div>
									{/* brands */}
									<div className='flex flex-wrap pt-3 gap-x-16 gap-y-10'>
										{brands.map(brand => (
											<div className='flex flex-col size-10 duration-100 hover:scale-125 hover:cursor-pointer sm:size-16 md:size-20' onClick={() => setSelectedBrand(brand)} key={`map-brand-${brand}`}>
												<img className='size-20 self-center' draggable="false" src={`./icons/brands/${brand}.svg`} alt={brand} />
												<span className='self-center text-nowrap'>{brand}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
				</div>
			</div>}
		</div>
	);
};

export default BrandMap;