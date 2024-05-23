import React, { useState, useRef, useEffect, useContext } from 'react';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext } from '../../context';

const CarSlides = ({ setCurrentCar, brandModels, setBrandModels }) => {
	// first 4 provided as props
	const [queryParams, setQueryParams] = useState({ skip: 4, limit: 2 });
	const lastElement = useRef();
	const lastElementObserver = useRef();
	const { servURL } = useContext(servURLContext);
	const [responseHasLength, setResponseHasLength] = useState(true);

	const [fetchCars, isFetching, fetchError, setFetchError] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();

		if (!data.length) return setResponseHasLength(false);

		setBrandModels(prev => {
			const tmp = [...prev];
			tmp.push(data);
			return tmp;
		});
	});

	// observe last slide to fetch next
	useEffect(() => {
		if (isFetching) return;
		if (lastElementObserver.current) lastElementObserver.current.disconnect();
		let callback = function (entries, observer) {
			if (entries[0].isIntersecting && responseHasLength) {
				fetchCars(`models/getMany?brand=${brandModels[0].brand}&skip=${queryParams.skip}&limit=${queryParams.limit}`);
				setQueryParams(prev => ({ ...prev, skip: prev.skip + prev.limit }));
			}
		}

		lastElementObserver.current = new IntersectionObserver(callback);
		if (lastElement.current) {
			lastElementObserver.current.observe(lastElement.current);
		}
		return () => lastElementObserver.current.disconnect();
	}, [isFetching]);

	return (
		<div className='mt-4 flex overflow-x-scroll border-2 border-slate-400 custom-scrollbar'>
			{brandModels.map((model, index) => {
				// последнему ref для подгрузки
				return index === brandModels.length - 1 ?
					<div className='relative border-2 border-slate-200 hover:border-blue-300 rounded' key={`car-slide-${index}`} onClick={() => setCurrentCar(model)} ref={lastElement} onMouseEnter={event => event.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}>
						<img className='h-32 min-w-56' draggable="false" src={model.img[0]?.srcset[0]} loading='lazy' />
						<span className='py-1 absolute left-0 bottom-0 w-full text-center text-slate-200 dark:text-orange-400 bg-zinc-700/65'>{model.model}</span>
					</div> :
					<div className='relative border-2 border-slate-200 hover:border-blue-300 rounded' key={`car-slide-${index}`} onClick={() => setCurrentCar(model)} onMouseEnter={event => event.target.scrollIntoView({ behavior: "smooth", block: "nearest" })}>
						<img className='h-32 min-w-56' draggable="false" src={model.img[0]?.srcset[0]} loading='lazy' />
						<span className='py-1 absolute left-0 bottom-0 w-full text-center text-slate-200 dark:text-orange-400 bg-zinc-700/65'>{model.model}</span>
					</div>
			})}
		</div>
	);
};

export default CarSlides;