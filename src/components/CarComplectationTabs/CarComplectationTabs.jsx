import React, { memo, useContext, useEffect, useState } from 'react';
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
	const [newComplect, setNewComplect] = useState(schemas.complectation);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);

	const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
		return (
			<Select.Item className={`flex items-center pr-9 pl-6 relative select-none rounded border-b-2 border-black ${className}`} {...props} ref={forwardedRef}>
				<Select.ItemText>{children}</Select.ItemText>
				<Select.ItemIndicator className="inline-flex align-center justify-center absolute left-0 w-6 bg-red-500">
					<CheckIcon />
				</Select.ItemIndicator>
			</Select.Item>
		);
	});

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

	const setDescription = () => {

	}

	const handleSelect = (value, setter, availableParts, complectIndex, key) => {
		setter(prev => {
			const tmp = prev.complectations;
			const targetID = availableParts.findIndex(item => item._id === value);
			tmp[complectIndex][key] = availableParts[targetID];
			return { ...prev, complectations: tmp };
		})
	}

	const handleCheck = (isChecked, path, complectIndex) => {
		setCurrentCar(prev => {
			const tmp = prev.complectations;
			const targetIndex = tmp[complectIndex][path]?.availableFor.findIndex(id => id === currentCar._id)
			// если нет id текущей машины в списке baseModel данной комплектации
			if (isChecked && targetIndex < 0) {
				tmp[complectIndex][path]?.availableFor.push(currentCar._id);
				// если не отмечено для текущей машины то удалить id машины из списка availableFor
			} else if (!isChecked && targetIndex >= 0) {
				tmp[complectIndex][path]?.availableFor.splice(targetIndex, 1);
			}
			return {
				...prev,
				complectations: tmp
			}
		})
	}

	const setDetailBlock = (complectIndex, key, keyIndex, availableParts, setAvailableParts) => {
		return <div className='flex flex-col my-3 rounded border-2 border-slate-400'>
			<p className='py-2 text-center bg-blue-300'>{dictionary[key][language]}</p>
			{/* select from all available details from set */}
			<Select.Root value={currentCar.complectations[complectIndex]?.[key]?._id || availableParts[0]?._id || ""} className="self-center" onValueChange={value => handleSelect(value, setCurrentCar, availableParts, complectIndex, key)} onOpenChange={() => fetchDocument(`${key}s/getAvailable?id=${currentCar._id}`, setAvailableParts)}>
				<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 py-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="">
					<Select.Value placeholder={dictionary[key][language]} />
					<Select.Icon className="">
						<ChevronDownIcon />
					</Select.Icon>
				</Select.Trigger>

				<Select.Portal>
					<Select.Content className="overflow-hidden bg-slate-100 rounded-md shadow-xl dark:bg-zinc-700 max-w-60 sm:max-w-xl md:max-2-full">
						<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
							<ChevronUpIcon />
						</Select.ScrollUpButton>
						<Select.Viewport className="p-1">
							<Select.Group>
								<Select.Label className="px-6 text-gray-600">{dictionary[key][language]}</Select.Label>
								<Select.Separator className="h-px bg-violet-500 m-1" />
								{availableParts.length ?
									availableParts.map((part, partIndex) => {
										return <SelectItem value={part._id} key={`car-${key}-${part._id}`}>
											{Object.entries(part)
												.filter(property => property[0] !== "_id" && property[0] !== "availableFor")
												.map(([partName, partValue]) => `${dictionary[partName][language]}: ${partValue}; `)}
										</SelectItem>
									}) :
									/* placeholder (current installed) */
									<SelectItem disabled value={currentCar.complectations[complectIndex]?.[key]?._id}>{
										Object.entries(currentCar.complectations[complectIndex]?.[key] || schemas[key])
											.filter(property => property[0] !== "_id" && property[0] !== "availableFor")
											.map(([partName, partValue]) => `${dictionary[partName][language]}: ${partValue}; `)
									}</SelectItem>
								}
							</Select.Group>
						</Select.Viewport>
						<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
							<ChevronDownIcon />
						</Select.ScrollDownButton>
					</Select.Content>
				</Select.Portal>
			</Select.Root>
			{/* fields for all properties of specifyed detail */}
			<div className='flex flex-wrap gap-4 p-4'>
				{Object.entries(schemas[key])
					.map(([field, value], fieldIndex) => {
						switch (field) {
							case "value":
								return <div key={`description-${complectIndex}`} >
									<Form.Field className='flex flex-col gap-x-2' name={field}>
										<Form.Label>{dictionary[field][language]}</Form.Label>
										<Form.Control asChild>
											<textarea onInput={event => setDescription(event, setCurrentCar, complectIndex, "ua")} key={"field-" + key + "-" + "ua"} className='px-2 border-2 border-solid border-slate-400 rounded-md' type="text" value={currentCar.complectations[complectIndex].description['ua']} name="description-ua" required />
											<textarea
												onInput={event => setCurrentCar(prev => {
													const tmp = prev.complectations[complectIndex].options;
													tmp[complectIndex].description.ua = event.target.value;
													return { ...prev, complectations: tmp }
												})}
												key={"field-" + field + "-" + "ua"}
												className='px-2 border-2 border-solid border-slate-400 rounded-md'
												type="text"
												value={currentCar.complectations[complectIndex].description['ua']}
												name="description-ua" required />
										</Form.Control>
									</Form.Field>
									<Form.Field className='flex flex-col gap-x-2' name={field}>
										<Form.Control asChild>
											<textarea
												onInput={event => setCurrentCar(prev => {
													const tmp = prev.complectations;
													tmp[complectIndex].description.en = event.target.value;
													return { ...prev, complectations: tmp }
												})}
												key={"field-" + field + "-" + "en"}
												className='px-2 border-2 border-solid border-slate-400 rounded-md'
												type="text"
												value={currentCar.complectations[complectIndex].description['en']}
												name="description-en" required />
										</Form.Control>
									</Form.Field>
								</div>

							case "availableFor":
								return <div className=''>
									<span className='font-semibold'>{dictionary[field][language]}</span>
									<div className='flex py-2'>
										{/* checkbox — make current car available for detail */}
										<Checkbox.Root onCheckedChange={isChecked => handleCheck(isChecked, key, complectIndex)} className="flex items-center justify-center bg-white size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" defaultChecked id={`${complectIndex}-${field}-availableFor`}>
											<Checkbox.Indicator className="text-violet-600">
												<CheckIcon />
											</Checkbox.Indicator>
										</Checkbox.Root>
										<label className="pl-2" htmlFor={`${complectIndex}-${field}-availableFor`}>
											{dictionary.thisCar[language]}
										</label>
									</div>
									{/* select — make available any car from list */}
									<Select.Root value={currentCar._id} className="self-center" /* onValueChange={value => setCurrentCar(cars[cars.findIndex(item => item._id === value)])} */ onOpenChange={() => fetchDocument(`models/getAll`, setCars)}>
										<Select.Trigger className="inline-flex items-center justify-center gap-1 px-1 py-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400 max-w-60" aria-label="">
											<Select.Value placeholder={dictionary.choose[language]} />
											<Select.Icon className="">
												<ChevronDownIcon />
											</Select.Icon>
										</Select.Trigger>

										<Select.Portal>
											<Select.Content className="overflow-hidden bg-slate-100 rounded-md shadow-xl dark:bg-zinc-700 max-w-60 sm:max-w-xl md:max-2-full">
												<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
													<ChevronUpIcon />
												</Select.ScrollUpButton>
												<Select.Viewport className="p-1">
													<Select.Group>
														<Select.Label className="px-6 text-gray-600">Model</Select.Label>
														<Select.Separator className="h-px bg-violet-500 m-1" />
														{cars.length ?
															cars.map(car => {
																return <SelectItem value={car._id} key={`car-${car._id}`}>
																	{Object.entries(car)
																		.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																		.map(([partName, partValue]) => `${partValue}, `)}
																</SelectItem>
															}) :
															/* placeholder (current installed) */
															<SelectItem disabled value={currentCar._id}>{
																Object.entries(currentCar)
																	.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																	.map(([partName, partValue]) => `${partValue}, `)
															}</SelectItem>
														}
													</Select.Group>
												</Select.Viewport>
												<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
													<ChevronDownIcon />
												</Select.ScrollDownButton>
											</Select.Content>
										</Select.Portal>
									</Select.Root>
								</div>

							case "turbo":
								return <div className=''>
									<span className='mb-3 self-center'>{dictionary[field][language]}</span>
									<RadioGroup.Root /* onValueChange={value => } */ className="flex gap-4" value={currentCar.complectations[complectIndex]?.engine?.turbo || false} aria-label="engine-turbo-tuning">
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
										<Input /* callback={event => setProperty(event, setNewParticle, complectIndex, key)} */ name={field} key={`input-${key}-${field}-${complectIndex}-${fieldIndex}`} type={typeof currentCar.complectations[complectIndex]?.[key]?.[field] || typeof schemas[key][field]} value={currentCar.complectations[complectIndex]?.[key]?.[field] || schemas[key][field]} disabled={!adminMode} />
									</Form.Control>
								</Form.Field>
						}
					})}
				<Button>Add</Button>
				<Button>Update</Button>
				<Button>Remove</Button>
			</div>
		</div>
	}

	return (
		<Tabs.Root className="" defaultValue="complect0">
			<Tabs.List className='border-y-2 border-solid border-slate-400'>
				{/* перечисление существующих комплектаций */}
				{currentCar.complectations.map((complect, index) => <Tabs.Trigger className='px-4 py-2 select-none hover:bg-blue-300 data-[state=active]:bg-orange-500' value={`complect${index}`} key={`tabs-nav-${index}`}>{complect.name}</Tabs.Trigger>)}
				{/* добавить новую комплектацию */}
				{/* {adminMode && <div className='px-4 py-2 select-none inline-block hover:bg-blue-300' onClick={} key="complectNewTrigger">{dictionary.newComplect[language]}</div>} */}
				{adminMode && <Tabs.Trigger className='px-4 py-2 select-none hover:bg-blue-300 data-[state=active]:bg-orange-500' value="complect-new" key="tabs-nav-new-complect">{newComplect.name}</Tabs.Trigger>}
			</Tabs.List>

			{/* tabs for fetched complects */}
			{currentCar.complectations.map((complect, complectIndex) => {
				return <Tabs.Content className='p-4' value={`complect${complectIndex}`} key={`tab-${complectIndex}`}>
					<Form.Root className='flex flex-col gap-y-4 rounded-md shadow' key={`form-${complectIndex}`} >

						{/* итерация по полям комплектаций */}
						{Object.keys(schemas.complectation).map((key, keyIndex) => {
							switch (key) {
								case "description":
									return <div key={`description-${complectIndex}`} >
										<Form.Field className='flex flex-col gap-x-2' name={key}>
											<Form.Label>{dictionary[key][language]}</Form.Label>
											<Form.Control asChild>
												<textarea
													onInput={event => setCurrentCar(prev => {
														const tmp = prev.complectations;
														tmp[complectIndex].description.ua = event.target.value;
														return { ...prev, complectations: tmp }
													})}
													key={"field-" + key + "-" + "ua"}
													className='px-2 border-2 border-solid border-slate-400 rounded-md'
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
													key={"field-" + key + "-" + "en"}
													className='px-2 border-2 border-solid border-slate-400 rounded-md'
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
											<Checkbox.Root onCheckedChange={isChecked => handleCheck(isChecked, "baseModel", complectIndex)} className="flex items-center justify-center bg-white size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" defaultChecked id={`avalCar-field-baseModel-${complectIndex}`}>
												<Checkbox.Indicator className="text-violet-600">
													<CheckIcon />
												</Checkbox.Indicator>
											</Checkbox.Root>
											<label className="pl-2" htmlFor={`avalCar-field-baseModel-${complectIndex}`}>
												{dictionary.thisCar[language]}
											</label>
										</div>
										<Select.Root value={currentCar._id} className="self-center" /* onValueChange={value => } */ onOpenChange={() => fetchDocument(`models/getAll`, setCars)}>
											<Select.Trigger className="inline-flex w-full items-center justify-center gap-1 px-1 py-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="">
												<Select.Value placeholder={dictionary.choose[language]} />
												<Select.Icon className="">
													<ChevronDownIcon />
												</Select.Icon>
											</Select.Trigger>
											<Select.Portal>
												<Select.Content className="overflow-hidden bg-slate-100 rounded-md shadow-xl dark:bg-zinc-700 max-w-60 sm:max-w-xl md:max-2-full">
													<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
														<ChevronUpIcon />
													</Select.ScrollUpButton>
													<Select.Viewport className="p-1">
														<Select.Group>
															<Select.Label className="px-6 text-gray-600">Model</Select.Label>
															<Select.Separator className="h-px bg-violet-500 m-1" />
															{cars.length ?
																cars.map(car => {
																	return <SelectItem value={car._id} key={`carSelect-baseModel-${complectIndex}-${car._id}`}>
																		{Object.entries(car)
																			.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																			.map(([partName, partValue]) => `${partValue}, `)}
																	</SelectItem>
																}) :
																/* placeholder (current installed) */
																<SelectItem disabled value={currentCar._id}>{
																	Object.entries(currentCar)
																		.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																		.map(([partName, partValue]) => `${partValue}, `)
																}</SelectItem>
															}
														</Select.Group>
													</Select.Viewport>
													<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
														<ChevronDownIcon />
													</Select.ScrollDownButton>
												</Select.Content>
											</Select.Portal>
										</Select.Root>
									</div>
									break;
								case "engine":
									return setDetailBlock(complectIndex, key, keyIndex, availableEngines, setAvailableEngines);
								case "transmission":
									return setDetailBlock(complectIndex, key, keyIndex, availableTransmissions, setAvailableTransmissions);
								case "suspension":
									return setDetailBlock(complectIndex, key, keyIndex, availableSuspensions, setAvailableSuspensions);

								default:
									return <Form.Field className='flex flex-col gap-x-2' key={`${key}-${complectIndex}`}>
										<Form.Label>{dictionary[key][language]}</Form.Label>
										<Form.Control asChild>
											<Input /* callback={event => setProperty(event, setComplectations, complectIndex, key)} */ name={key} key={"field-" + complectIndex + "-" + keyIndex} type={typeof currentCar.complectations[complectIndex][key]} value={currentCar.complectations[complectIndex][key]} />
										</Form.Control>
										<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
									</Form.Field>
							}
						})}

						<div className='flex flex-wrap justify-center gap-5'>
							<Button /* callback={} */>Save complect</Button>
							<Button /* callback={} */>Update complect</Button>
							<Button /* callback={} */>Delete complect</Button>
						</div>
					</Form.Root>
				</Tabs.Content>
			})}

			{/* tab for new complect */}
			{adminMode && <Tabs.Content className='p-4' value={`complect-new`} key={`tab-new-complect`}>
				<Form.Root className='flex flex-col gap-y-4 rounded-md shadow' key={`form-new-complect`} >
					{Object.keys(newComplect).map((key, keyIndex) => {
						switch (key) {
							case "description":
								return <div key={`description-new-complect`} >
									<Form.Field className='flex flex-col gap-x-2' name={key}>
										<Form.Label>{dictionary[key][language]}</Form.Label>
										<Form.Control asChild>
											<textarea
												onInput={event => setNewComplect(prev => ({ ...prev, description: { ...prev.description, ua: event.target.value } }))}
												className='px-2 border-2 border-solid border-slate-400 rounded-md'
												type="text"
												value={newComplect.description.ua}
												name="description-ua" required />
										</Form.Control>
									</Form.Field>
									<Form.Field className='flex flex-col gap-x-2' name={key}>
										<Form.Control asChild>
											<textarea
												onInput={event => setNewComplect(prev => ({ ...prev, description: { ...prev.description, en: event.target.value } }))}
												className='px-2 border-2 border-solid border-slate-400 rounded-md'
												type="text"
												value={newComplect.description.en}
												name="description-en" required />
										</Form.Control>
									</Form.Field>
								</div>

							case "baseModel":
								return <div className=''>
									<div className='flex py-2'>
										<span className='font-semibold pr-6'>{dictionary.baseModel[language]}</span>
										<Checkbox.Root /* onCheckedChange={isChecked => currentCar.complectations[complectIndex].baseModel} */ className="flex items-center justify-center bg-white size-6 rounded-lg shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black]" defaultChecked id={`avalCar-field-baseModel-new-complect`}>
											<Checkbox.Indicator className="text-violet-600">
												<CheckIcon />
											</Checkbox.Indicator>
										</Checkbox.Root>
										<label className="pl-2" htmlFor={`avalCar-field-baseModel-new-complect`}>
											{dictionary.thisCar[language]}
										</label>
									</div>
									<Select.Root value={currentCar._id} className="self-center" /* onValueChange={value => } */ onOpenChange={() => fetchDocument(`models/getAll`, setCars)}>
										<Select.Trigger className="inline-flex w-full items-center justify-center gap-1 px-1 py-1 bg-slate-100 shadow-xl rounded border-2 border-solid border-slate-400" aria-label="">
											<Select.Value placeholder={dictionary.choose[language]} />
											<Select.Icon className="">
												<ChevronDownIcon />
											</Select.Icon>
										</Select.Trigger>
										<Select.Portal>
											<Select.Content className="overflow-hidden bg-slate-100 rounded-md shadow-xl dark:bg-zinc-700 max-w-60 sm:max-w-xl md:max-2-full">
												<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
													<ChevronUpIcon />
												</Select.ScrollUpButton>
												<Select.Viewport className="p-1">
													<Select.Group>
														<Select.Label className="px-6 text-gray-600">Model</Select.Label>
														<Select.Separator className="h-px bg-violet-500 m-1" />
														{cars.length ?
															cars.map(car => {
																return <SelectItem value={car._id} key={`carSelect-baseModel-new-complect-${car._id}`}>
																	{Object.entries(car)
																		.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																		.map(([partName, partValue]) => `${partValue}, `)}
																</SelectItem>
															}) :
															/* placeholder (current installed) */
															<SelectItem disabled value={currentCar._id}>{
																Object.entries(currentCar)
																	.filter(property => property[0] === "brand" || property[0] === "model" || property[0] === "body" || property[0] === "modelYear")
																	.map(([partName, partValue]) => `${partValue}, `)
															}</SelectItem>
														}
													</Select.Group>
												</Select.Viewport>
												<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
													<ChevronDownIcon />
												</Select.ScrollDownButton>
											</Select.Content>
										</Select.Portal>
									</Select.Root>
								</div>
							case "engine":
								return setDetailBlock(0, key, keyIndex, availableEngines, setAvailableEngines);
							case "transmission":
								return setDetailBlock(0, key, keyIndex, availableTransmissions, setAvailableTransmissions);
							case "suspension":
								return setDetailBlock(0, key, keyIndex, availableSuspensions, setAvailableSuspensions);

							default:
								return <Form.Field className='flex flex-col gap-x-2' key={`${key}-new-complect`}>
									<Form.Label>{dictionary[key][language]}</Form.Label>
									<Form.Control asChild>
										<Input callback={event => setNewComplect(prev => ({ ...prev, [key]: event.target.value }))} name={key} key={"field-" + "new-complect" + "-" + keyIndex} type={typeof schemas.complectation[key]} /* value={schemas.complectation[key]} */ />
									</Form.Control>
									<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
								</Form.Field>
						}
					})}

					<div className='flex flex-wrap justify-center gap-5'>
						<Button /* callback={} */>Save complect</Button>
						<Button /* callback={} */>Update complect</Button>
						<Button /* callback={} */>Delete complect</Button>
					</div>
				</Form.Root>
			</Tabs.Content>}
		</Tabs.Root>
	);
};

export default CarComplectationTabs;