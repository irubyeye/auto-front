import React, { useContext, useEffect, useState } from 'react';
import { useFetching } from '../../hooks/useFetching';
import Configurator from '../../components/Configurator/Configurator';
import { servURLContext } from '../../context';
import schemas from './schemas';

const Admin = () => {
	const [currentCar, setCurrentCar] = useState();
	const { servURL } = useContext(servURLContext);

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

	useEffect(() => {
		fetchDocument("models/:id?id=66321d2a7291952489119f52", setCurrentCar);
	}, []);



	return (
		<div className="size-full relative">
			<h2 className="">Admin</h2>
			{currentCar && <Configurator currentCar={currentCar} setCurrentCar={setCurrentCar} adminMode={true} />}
		</div>
	);
};

export default Admin;
