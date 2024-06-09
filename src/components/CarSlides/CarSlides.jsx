import React, { useState, useRef, useEffect, useContext } from 'react';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext } from '../../context';

const CarSlides = ({ setCurrentCar, brandModels, pushBrandModels, selectedBrand }) => {
	// first 4 provided as props
	const [queryParams, setQueryParams] = useState({ skip: 4, limit: 2 });
	// observe for fetch new
	const lastElement = useRef();
	const lastElementObserver = useRef();
	const { servURL } = useContext(servURLContext);
	// if false stop fetch
	const [responseHasLength, setResponseHasLength] = useState(true);

	const [fetchCars, isFetching] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
	});

	// observe last slide to fetch next
	useEffect(() => {
		if (isFetching) return;
		if (lastElementObserver.current) lastElementObserver.current.disconnect();
		let callback = async function (entries, observer) {
			if (entries[0].isIntersecting && responseHasLength) {
				const cars = await fetchCars(`models/getMany?brand=${selectedBrand}&skip=${queryParams.skip}&limit=${queryParams.limit}`);
				if (!cars.length || cars[0]?._id === brandModels[brandModels.length - 1]?._id) return setResponseHasLength(false);
				pushBrandModels(cars);
				setQueryParams(prev => ({ ...prev, skip: prev.skip + prev.limit }));
			}
		}

		lastElementObserver.current = new IntersectionObserver(callback);
		if (lastElement.current) {
			lastElementObserver.current.observe(lastElement.current);
		}
		return () => lastElementObserver.current.disconnect();
	}, [isFetching]);

	const selectCar = async (model) => {
		const [selectedCar] = await fetchCars(`models/getOne?id=${model._id}`);
		setCurrentCar(selectedCar);
	}

	return (
		<div className='mt-4 p-4 bg-zinc-700/35 rounded-md flex gap-12 overflow-x-scroll custom-scrollbar'>
			{brandModels.map((model, index) => {
				// последнему ref для подгрузки
				return index === brandModels.length - 1 ?
					<div className='relative duration-100 hover:scale-105 hover:cursor-grab' key={`car-slide-${index}`} onClick={() => selectCar(model)} ref={lastElement} onMouseEnter={event => event.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}>
						<img className='h-32 min-w-56 lg:h-44 rounded-md' alt='' draggable="false" src={model.img?.[0]?.srcset[0]} loading='lazy' />
						<span className='py-1 absolute left-0 bottom-0 w-full text-center text-slate-200 dark:text-orange-400 bg-zinc-700/65 rounded-b'>{model.model}</span>
					</div> :
					<div className='relative duration-100 hover:scale-105 hover:cursor-grab' key={`car-slide-${index}`} onClick={() => selectCar(model)} onMouseEnter={event => event.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}>
						<img className='h-32 min-w-56 lg:h-44 lg:min-w-72 rounded-md' alt='' draggable="false" src={model.img?.[0]?.srcset[0]} loading='lazy' />
						<span className='py-1 absolute left-0 bottom-0 w-full text-center text-slate-200 dark:text-orange-400 bg-zinc-700/65 rounded-b'>{model.model}</span>
					</div>
			})}
		</div>
	);
};

export default CarSlides;