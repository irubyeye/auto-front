import React, { useState, useContext, useEffect } from 'react';
import BrandMap from '../../components/BrandMap/BrandMap';
import Configurator from '../../components/Configurator/Configurator';
import { dictionary } from './dictionary';
import { LangContext, servURLContext } from '../../context';
import CarSlides from '../../components/CarSlides/CarSlides';
import { useFetching } from '../../hooks/useFetching';

const Mainpage = () => {
	const [selectedBrand, setSelectedBrand] = useState(null);
	const [brandModels, setBrandModels] = useState(null);
	const [currentCar, setCurrentCar] = useState(null);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
	});

	// загрузка машин
	useEffect(() => {
		const handleBrandModels = async () => {
			const data = await fetchDocument(`models/getMany?brand=${selectedBrand}&skip=0&limit=4`);
			setBrandModels(data);
			// if (!currentCar.brand.length) setCurrentCar(data[0] || schemas.car);
		}
		if (selectedBrand) {
			handleBrandModels();
		} else {
			setBrandModels(null);
			setCurrentCar(null);
		};
	}, [selectedBrand]);

	// выбор цвета после загрузки
	// useEffect(() => {
	// 	if (currentCar?.img?.length) setSelectedColor(currentCar.img[0].color);
	// }, [currentCar?.img]);

	return (
		<div className='flex flex-col gap-5 sm:px-4 lg:px-16'>
			<h1 className='text-2xl text-slate-800 dark:text-orange-400'>{dictionary.headline[language]}</h1>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.welcome[language]}</p>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.advantages[language]}</p>
			<p className='text-lg text-slate-800 dark:text-orange-400'>{dictionary.guidance[language]}</p>

			<BrandMap setSelectedBrand={setSelectedBrand} />
			{brandModels && <CarSlides
				setCurrentCar={setCurrentCar}
				brandModels={brandModels}
				setBrandModels={setBrandModels} />}
			{currentCar && <Configurator currentCar={currentCar} setCurrentCar={setCurrentCar} brandModels={brandModels} setBrandModels={setBrandModels} adminMode={false} />}
		</div>
	);
};

export default Mainpage;