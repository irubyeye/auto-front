import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useFetching } from '../../hooks/useFetching';
import { LangContext, servURLContext } from '../../context';
import dictionary from './dictionary';
import CarPanel from '../CarPanel/CarPanel';
import CarComplectationTabs from '../CarComplectationTabs/CarComplectationTabs';

const Configurator = ({ currentCar, setCurrentCar, adminMode }) => {
	const [cars, setCars] = useState([]);
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async (endpoint, stateSetter) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		console.log(data[0]);
		stateSetter(data[0]);
	});

	// const handleResponse = res => {
	// 	setPushResult(res.statusText);
	// 	// http status 2xx => clear inputs
	// 	if (res.status.toString()[0] === "2") setCurrentCar(schemas.car);	// устанавливать не пустую схему, а зафетченую
	// }

	return (
		<div className="py-4 bg-slate-300 dark:bg-zinc-700 border-2 border-solid border-slate-400 rounded-xl">
			<CarPanel adminMode={adminMode} currentCar={currentCar} setCurrentCar={setCurrentCar} />
			<CarComplectationTabs adminMode={adminMode} currentCar={currentCar} setCurrentCar={setCurrentCar} cars={cars} setCars={setCars} />
			{/* adminMode && <AdminExtensions /> */}
		</div>
	);
};

export default Configurator;