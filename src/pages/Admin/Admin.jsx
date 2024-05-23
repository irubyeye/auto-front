import React, { useContext, useEffect, useState } from 'react';
import Configurator from '../../components/Configurator/Configurator';
import CarSlides from '../../components/CarSlides/CarSlides';

const Admin = ({ currentCar, setCurrentCar, brandModels, setBrandModels }) => {

	return (
		<div className="size-full relative">
			<h2 className="dark:text-orange-400">Admin</h2>
			{brandModels && <CarSlides
				setCurrentCar={setCurrentCar}
				brandModels={brandModels}
				setBrandModels={setBrandModels} />}
			{currentCar && <Configurator
				currentCar={currentCar}
				setCurrentCar={setCurrentCar}
				brandModels={brandModels}
				setBrandModels={setBrandModels}
				adminMode={true} />}
		</div>
	);
};

export default Admin;
