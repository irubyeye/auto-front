import React, { useContext, useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

import { useFetching } from '../../hooks/useFetching';
import Input from '../../UI/Input';
import Button from '../../UI/Button';
import { LangContext, servURLContext } from '../../context';
import dictionary from './dictionary';
import schemas from './schemas';

const CarComplectationTabs = ({ adminMode, currentCar, setCurrentCar, cars, setCars }) => {
	const [availableEngines, setAvailableEngines] = useState([]);
	const [availableTransmissions, setAvailableTransmissions] = useState([]);
	const [availableSuspensions, setAvailableSuspensions] = useState([]);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);

	useEffect(() => {
		// Immediately-invoked Function Expression for async logic
		// в dev mode после данного эфеекта повторно срабатывает эффект, который присылает машину только с существующими комплектациями
		// благодаря async / await новая комплектация пушится после того, как машина окончательно прогрузилась 
		(async () => {
			await fetchDocument(`engines/getAvailable?id=${currentCar._id}`, setAvailableEngines);
			await fetchDocument(`transmissions/getAvailable?id=${currentCar._id}`, setAvailableTransmissions);
			await fetchDocument(`suspensions/getAvailable?id=${currentCar._id}`, setAvailableSuspensions);

			if (adminMode) {
				await fetchDocument(`models/getAll`, setCars);
				setCurrentCar(prev => {
					const tmp = prev.complectations;
					// т.к. в dev mode хук вызывается дважды, будет дополнительная дублирующая вкладка создания новой комплектации
					tmp.push(schemas.complectation);
					// по дефолту отмечаем
					tmp[tmp.length - 1].baseModel = [currentCar._id];
					tmp[tmp.length - 1].engine.availableFor = [currentCar._id];
					tmp[tmp.length - 1].transmission.availableFor = [currentCar._id];
					tmp[tmp.length - 1].suspension.availableFor = [currentCar._id];
					return {
						...prev,
						complectations: tmp
					}
				})
			}
		})();
	}, [currentCar._id]);

	const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
		return (
			<Select.Item className={`flex items-center pr-9 pl-6 relative select-none rounded hover:bg-slate-300 hover:cursor-pointer dark:text-orange-400 dark:hover:bg-zinc-600 border-b-2 border-black ${className}`} {...props} ref={forwardedRef}>
				<Select.ItemText>{children}</Select.ItemText>
				<Select.ItemIndicator className="inline-flex align-center justify-center absolute left-0 w-6 bg-red-500">
					<CheckIcon />
				</Select.ItemIndicator>
			</Select.Item>
		);
	});

	const MySelect = React.forwardRef(({ value, name, complectIndex, field, selectHandler, items, setItems, defaultItems, filter, className, ...props }, forwardedRef) => {
		return <Select.Root value={value} onValueChange={value => handleSelect(value, items, setItems, complectIndex, name, field)} {...props} ref={forwardedRef}>
			<Select.Trigger className={`inline-flex items-center justify-center gap-1 px-1 bg-slate-100 dark:bg-zinc-700 dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400 dark:border-zinc-500 ${className}`} aria-label="car-body-select-trigger">
				<Select.Value className='' placeholder={dictionary[name][language]} />
				<Select.Icon className="">
					<ChevronDownIcon />
				</Select.Icon>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className="overflow-hidden bg-slate-100 dark:bg-zinc-700 rounded-md shadow-xl">
					<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronUpIcon />
					</Select.ScrollUpButton>
					<Select.Viewport className="p-1">
						<Select.Group>
							<Select.Label className="px-6 text-gray-600 dark:text-zinc-400 dark:font-semibold">{dictionary[name][language]}</Select.Label>
							<Select.Separator className="h-px bg-violet-500 m-1" />
							{items.length ?
								items.map(item => {
									return <SelectItem value={item._id} key={`car-${item._id}`}>
										{Object.entries(item)
											.filter(filter)
											.map(([partName, partValue]) => `${partName}: ${partValue}, `)}
									</SelectItem>
								}) :
								<SelectItem disabled value={defaultItems._id}>{
									Object.entries(defaultItems)
										.filter(filter)
										.map(([partName, partValue]) => `${partName}: ${partValue}, `)
								}</SelectItem>}
						</Select.Group>
					</Select.Viewport>
					<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		</Select.Root >
	})

	const [fetchDocument, isFetching, fetchError, setFetchError] = useFetching(async (endpoint, stateSetter) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		console.log(data);
		stateSetter(data);
	});

	const [pushDocument, isPushing, pushError, setPushError] = useFetching(async (document, endpoint, method) => {
		let res = await fetch(servURL + endpoint, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(document)
		})
		res = await res.json();
		return res;
	});

	const pushComplect = async (complect, index, endpoint, method) => {
		const res = await pushDocument(complect, endpoint, method);
		if (method === "PATCH") return;

		setCurrentCar(prev => {
			const tmp = prev.complectations;

			method === "POST" ?
				// вставляем комплектацию на предпоследнее место (последнее под NewComplect)
				// в devMode рендерится 2 newComplect, поэтому новая вставится между ними
				tmp.splice(tmp.length - 2, 0, res) :
				// или соответственно удаляем текущую комплектацию по индексу
				tmp.splice(index, 1);

			return {
				...prev,
				complectations: tmp
			}
		})
	}

	const pushDetail = async (detail, endpoint, method, complectIndex, path, availableDetails, setAvailableDetails) => {
		const res = await pushDocument(detail, endpoint, method);

		if (method !== "PATCH") {
			setCurrentCar(prev => {
				const tmp = prev.complectations;
				method === "DELETE" ? tmp[complectIndex][path] = availableDetails[0] || schemas[path] : tmp[complectIndex][path] = res;
				return {
					...prev,
					complectations: tmp
				}
			});
		}

		setAvailableDetails(prev => {
			if (method === "DELETE") {
				return prev.filter(item => item?._id !== detail?._id)
			} else if (method === "PATCH") {
				const targetIndex = prev.findIndex(item => item._id === res._id);
				prev[targetIndex] = res;
				return prev
			} else {
				// returns new array with added detail in the end
				return prev.toSpliced(prev.length, Infinity, res);
			}
		})
	}

	const setProperty = (event, complectIndex, key, field) => {
		const tmp = currentCar.complectations;
		if (!field) {
			// set number || string
			tmp[complectIndex][key] = +event.target.value || event.target.value;
		} else {
			// set number || string
			tmp[complectIndex][key][field] = +event.target.value || event.target.value;
		}
		setCurrentCar(prev => ({
			...prev,
			complectations: tmp
		}))
	}

	const handleSelect = (value, availableParts, setAvailableParts, complectIndex, key, path) => {
		if (!path) {
			return setCurrentCar(prev => {
				// select для выбора доступной машины для соотв. комплектации
				if (key === "baseModel") {
					const tmp = prev.complectations;
					const targetIndex = tmp[complectIndex].baseModel.findIndex(id => id === value);
					if (targetIndex >= 0) {
						tmp[complectIndex].baseModel.splice(targetIndex, 1);
					} else {
						tmp[complectIndex].baseModel.push(value);
					}

					return {
						...prev,
						complectations: tmp
					}
				}

				// select детали в комплектацию
				const targetIndex = availableParts.findIndex(item => item._id === value);
				const tmp = prev.complectations;
				tmp[complectIndex][key] = availableParts[targetIndex];
				return { ...prev, complectations: tmp };
			})
		}

		// path = выбор доступной машины для соотв. детали (select элементы с пропсом path рендерятся только в adminMode)
		setCurrentCar(prev => {
			const tmp = prev.complectations;
			const idList = prev.complectations[complectIndex][key][path];
			const targetIndex = idList.findIndex(id => id == value);

			if (targetIndex >= 0) {
				idList.splice(targetIndex, 1);
			} else {
				idList.push(value);
			}
			tmp[complectIndex][key][path] = idList;

			return {
				...prev,
				complectations: tmp
			}
		});

		setAvailableParts(prev => {
			// value = car_id
			const tmp = prev;
			// индекс установленной детали
			const targetDetailIndex = tmp.findIndex(item => item._id === currentCar.complectations[complectIndex][key]._id);
			// индекс id текущей машины
			const targetIDIndex = tmp[targetDetailIndex]?.availableFor.findIndex(id => id === value);

			// если id уже находится в массиве
			if (targetIDIndex >= 0) {
				tmp[targetDetailIndex].availableFor.splice(targetIDIndex, 1);
				// если id в массиве нет, но установленная деталь существует
			} else if (targetIDIndex < 0 && targetDetailIndex >= 0) {
				tmp[targetDetailIndex].availableFor.push(value);
			} else {
				tmp.push(currentCar.complectations[complectIndex][key]);
			}
			return tmp;
		})
	}

	const handleCheck = (isChecked, complectIndex, path = "baseModel") => {
		setCurrentCar(prev => {
			const tmp = prev.complectations;
			const targetIndex = (path === "baseModel")
				? tmp[complectIndex].baseModel.findIndex(id => id === currentCar._id)
				: tmp[complectIndex][path].availableFor.findIndex(id => id === currentCar._id);

			if (isChecked && targetIndex < 0) {
				// комплект/деталь отмечены как доступны — пушим им id машины
				(path === "baseModel")
					? tmp[complectIndex].baseModel.push(currentCar._id)
					: tmp[complectIndex][path].availableFor.push(currentCar._id);
			} else if (!isChecked && targetIndex >= 0) {
				// отметка снята
				(path === "baseModel")
					? tmp[complectIndex].baseModel.splice(targetIndex, 1)
					: tmp[complectIndex][path].availableFor.splice(targetIndex, 1);
			}

			return {
				...prev,
				complectations: tmp
			};
		});
	};

	const handleEngineTurbo = (value, complectIndex) => {
		const tmp = currentCar.complectations;
		tmp[complectIndex].engine.turbo = value;
		setCurrentCar(prev => ({
			...prev,
			complectations: tmp
		}))
	}

	const setDetailBlock = (complectIndex, key, availableParts, setAvailableParts) => {
		return <div className='flex flex-col my-3 rounded border-2 border-slate-400'>
			<p className='py-2 text-center bg-blue-300 dark:bg-orange-400'>{dictionary[key][language]}</p>
			{/* select from all available details from set */}
			<MySelect
				value={currentCar.complectations[complectIndex][key]?._id}
				name={key}
				complectIndex={complectIndex}
				items={availableParts}
				setItems={setAvailableParts}
				defaultItems={currentCar.complectations[complectIndex]?.[key] || schemas[key]}
				filter={property => property[0] !== "_id" && property[0] !== "availableFor"}
			/>

			{/* fields for all properties of specifyed detail */}
			<div className='flex flex-wrap gap-4 p-4'>
				{Object.entries(schemas.complectation[key])
					.filter(entry => entry[0] !== "_id" && entry[0] !== "__v")
					.map(([field, value], fieldIndex) => {
						switch (field) {

							case "availableFor":
								if (adminMode) return <div className=''>
									<span className='font-semibold'>{dictionary[field][language]}</span>
									<div className='flex py-2'>
										{/* checkbox — make current car available for detail */}
										<Checkbox.Root
											onCheckedChange={isChecked => handleCheck(isChecked, complectIndex, key)}
											className="flex items-center justify-center bg-white dark:bg-zinc-500 size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 dark:hover:bg-zinc-400 focus:shadow-[0_0_0_2px_black]"
											defaultChecked
											id={`${complectIndex}-${field}-availableFor`}
										>
											<Checkbox.Indicator className="text-violet-600 dark:text-orange-400">
												<CheckIcon />
											</Checkbox.Indicator>
										</Checkbox.Root>
										<label className="pl-2" htmlFor={`${complectIndex}-${field}-availableFor`}>
											{dictionary.thisCar[language]}
										</label>
									</div>
									{/* select — make available any car from list */}
									<MySelect
										value={currentCar._id}
										name={key}
										complectIndex={complectIndex}
										field={field}
										items={cars}
										setItems={setAvailableParts}
										defaultItems={currentCar}
										filter={property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear"}
									/>
								</div>
								break;

							case "turbo":
								return <div className=''>
									<span className='mb-3 self-center'>{dictionary[field][language]}</span>
									<RadioGroup.Root onValueChange={value => handleEngineTurbo(value, complectIndex)} className="flex gap-4" value={currentCar.complectations[complectIndex]?.engine?.turbo || false} aria-label="engine-turbo-tuning">
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" value={true} id="turbo1">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400" />
											</RadioGroup.Item>
											<label className="pl-2" htmlFor="r1">{dictionary.yes[language]}</label>
										</div>
										<div className='flex items-center'>
											<RadioGroup.Item className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" value={false} id="tubo2">
												<RadioGroup.Indicator className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400" />
											</RadioGroup.Item>
											<label className="pl-2" htmlFor="r2">{dictionary.no[language]}</label>
										</div>
									</RadioGroup.Root>
								</div>

							default:
								return <Form.Field className="md:max-w-40" key={`field-${key}-${field}-${complectIndex}-${fieldIndex}`}>
									<Form.Label className="">{dictionary[field]?.[language]}</Form.Label>
									<Form.Control asChild>
										<Input
											callback={event => setProperty(event, complectIndex, key, field)}
											name={field}
											key={`input-${key}-${field}-${complectIndex}-${fieldIndex}`}
											type={typeof currentCar.complectations[complectIndex]?.[key]?.[field] || typeof schemas[key][field]}
											value={currentCar.complectations[complectIndex]?.[key]?.[field] || schemas[key][field]}
											disabled={!adminMode}
										/>
									</Form.Control>
								</Form.Field>
						}
					})}

				{adminMode && <div className='flex gap-2'>
					<Button
						callback={() => pushDetail(currentCar.complectations[complectIndex][key], `${key}s/add`, "POST", complectIndex, key, availableParts, setAvailableParts)}
					>Add</Button>
					<Button
						callback={() => pushDetail(currentCar.complectations[complectIndex][key], `${key}s/update`, "PATCH", complectIndex, key, availableParts, setAvailableParts)}
					>Update</Button>
					<Button
						callback={() => pushDetail(currentCar.complectations[complectIndex][key], `${key}s/delete`, "DELETE", complectIndex, key, availableParts, setAvailableParts)}
					>Remove</Button>
				</div>}
			</div>
		</div>
	}

	return (
		<Tabs.Root className="" defaultValue="complect0">
			<Tabs.List className='border-y-2 border-solid border-slate-400'>
				{currentCar.complectations.map((complect, index) => (
					<Tabs.Trigger
						className='px-4 py-2 select-none hover:bg-blue-300 dark:hover:bg-zinc-600 data-[state=active]:bg-orange-500 data-[state=active]:hover:bg-orange-500'
						value={`complect${index}`}
						key={`tabs-nav-${index}`}>{complect.name}</Tabs.Trigger>
				))}
			</Tabs.List>

			{currentCar.complectations.map((complect, complectIndex) => {
				return <Tabs.Content className='p-4' value={`complect${complectIndex}`} key={`tab-${complectIndex}`}>
					<Form.Root className='flex flex-col gap-y-4 rounded-md shadow' key={`form-${complectIndex}`} >

						{/* итерация по полям комплектаций */}
						{Object.keys(schemas.complectation).map((key, keyIndex) => {
							switch (key) {
								case "description":
									return <div key={`description-${complectIndex}`} >
										<Form.Field className='flex flex-col gap-x-2' name={key}>
											<Form.Label className='pb-2 dark:text-zinc-400 dark:font-semibold'>{dictionary[key][language]}</Form.Label>
											<Form.Control asChild>
												<textarea
													onInput={event => setCurrentCar(prev => {
														const tmp = prev.complectations;
														tmp[complectIndex].description.ua = event.target.value;
														return { ...prev, complectations: tmp }
													})}
													key={"field-complect-" + key + "-" + "ua" + "-" + complectIndex}
													className='px-2 border-2 border-solid border-slate-400 rounded-md dark:bg-zinc-700 dark:text-orange-400'
													type="text"
													value={currentCar.complectations[complectIndex].description['ua']}
													name="description-ua" required />
											</Form.Control>
										</Form.Field>
										<Form.Field className='flex flex-col gap-x-2' name={key}>
											<Form.Control asChild>
												<textarea
													onInput={event => setCurrentCar(prev => {
														const tmp = prev.complectations;
														tmp[complectIndex].description.en = event.target.value;
														return { ...prev, complectations: tmp }
													})}
													key={"field-complect-" + key + "-" + "en" + "-" + complectIndex}
													className='px-2 border-2 border-solid border-slate-400 rounded-md dark:bg-zinc-700 dark:text-orange-400'
													type="text"
													value={currentCar.complectations[complectIndex].description['en']}
													name="description-en" required />
											</Form.Control>
										</Form.Field>
									</div>

								case "baseModel":
									if (adminMode) return <div className=''>
										<div className='flex py-2'>
											<span className='font-semibold pr-6'>{dictionary.baseModel[language]}</span>
											<Checkbox.Root
												onCheckedChange={isChecked => handleCheck(isChecked, complectIndex)}
												className="flex items-center justify-center bg-white dark:bg-zinc-500 size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 dark:hover:bg-zinc-400 focus:shadow-[0_0_0_2px_black]"
												defaultChecked
												id={`avalCar-field-baseModel-${complectIndex}`}
											>
												<Checkbox.Indicator className="text-violet-600 dark:text-orange-400">
													<CheckIcon />
												</Checkbox.Indicator>
											</Checkbox.Root>
											<label className="pl-2" htmlFor={`avalCar-field-baseModel-${complectIndex}`}>
												{dictionary.thisCar[language]}
											</label>
										</div>
										<MySelect
											value={currentCar._id}
											name={key}
											complectIndex={complectIndex}
											items={cars}
											setItems={setCars}
											defaultItems={currentCar}
											filter={property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear"}
											className="w-full"
										/>
									</div>
									break;

								case "engine":
									return setDetailBlock(complectIndex, key, availableEngines, setAvailableEngines);
								case "transmission":
									return setDetailBlock(complectIndex, key, availableTransmissions, setAvailableTransmissions);
								case "suspension":
									return setDetailBlock(complectIndex, key, availableSuspensions, setAvailableSuspensions);

								default:
									return <Form.Field className='flex flex-col gap-x-2' key={`${key}-${complectIndex}`}>
										<Form.Label className='pb-2 dark:text-zinc-400 dark:font-semibold'>{dictionary[key][language]}</Form.Label>
										<Form.Control asChild>
											<Input
												callback={event => setProperty(event, complectIndex, key)}
												name={key}
												key={"field-" + complectIndex + "-" + keyIndex}
												type={typeof currentCar.complectations[complectIndex][key]}
												value={currentCar.complectations[complectIndex][key]}
											/>
										</Form.Control>
										<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
									</Form.Field>
							}
						})}

						{adminMode && <div className='flex flex-wrap justify-center gap-5'>
							<Button callback={() => pushComplect(complect, complectIndex, "complectations/add", "POST")}>Save complect</Button>
							<Button callback={() => pushComplect(complect, complectIndex, "complectations/update", "PATCH")}>Update complect</Button>
							<Button callback={() => pushComplect(complect, complectIndex, "complectations/delete", "DELETE")}>Delete complect</Button>
						</div>}
					</Form.Root>
				</Tabs.Content>
			})}
		</Tabs.Root>
	);
};

export default CarComplectationTabs;