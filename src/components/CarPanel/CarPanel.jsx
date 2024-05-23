import React, { useContext, useEffect, useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useFetching } from '../../hooks/useFetching';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import Input from '../../UI/Input';
import { LangContext, PageNavContext, UserContext, servURLContext } from '../../context';
import schemas from '../../utils/schemas';
import dictionary from './dictionary';
import Button from '../../UI/Button';
import Admin from '../../pages/Admin/Admin';

const CarPanel = ({ adminMode, currentCar, setCurrentCar, brandModels, setBrandModels, setSelectedBrand, isConfiguring, setIsConfiguring, appearanceMode, setAppearanceMode }) => {
	const { setCurrentPage } = useContext(PageNavContext);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);
	const { user } = useContext(UserContext);
	const [selectedColor, setSelectedColor] = useState();
	const [isPanelOpen, setIsPanelOpen] = useState(window.matchMedia("(min-width: 768px)").matches);

	// select color on load
	useEffect(() => {
		if (currentCar.img.length) setSelectedColor(Object.values(currentCar.img[0])[0]);
	}, [currentCar.img]);

	const SelectItem = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
		return (
			<Select.Item className={`flex items-center pr-9 pl-6 relative select-none rounded hover:bg-slate-300 hover:cursor-pointer dark:text-orange-400 dark:hover:bg-zinc-600 ${className}`} {...props} ref={forwardedRef}>
				<Select.ItemText>{children}</Select.ItemText>
				<Select.ItemIndicator className="inline-flex align-center justify-center absolute left-0 w-6 bg-red-500">
					<CheckIcon />
				</Select.ItemIndicator>
			</Select.Item>
		);
	});

	const MySelect = React.forwardRef(({ value, name, selectHandler, items, fetchHandler, className, ...props }, forwardedRef) => {
		return <Select.Root value={value} onValueChange={selectHandler} onOpenChange={fetchHandler} {...props} ref={forwardedRef}>
			<Select.Trigger className={`inline-flex items-center justify-center gap-1 px-1 py-1 w-full bg-transparent border-0 text-slate-100  dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400 dark:border-zinc-500 sm:py-0 ${className}`} aria-label="car-body-select-trigger">
				<Select.Value className='' placeholder={dictionary[name][language]} />
				{adminMode && <Select.Icon className="">
					<ChevronDownIcon />
				</Select.Icon>}
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className="overflow-hidden bg-slate-100 z-40 dark:bg-zinc-700 rounded-md shadow-xl">
					<Select.ScrollUpButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronUpIcon />
					</Select.ScrollUpButton>
					<Select.Viewport className="p-1">
						<Select.Group>
							<Select.Label className="px-6 text-gray-600 dark:text-zinc-400 dark:font-semibold">{dictionary[name][language]}</Select.Label>
							<Select.Separator className="h-px bg-violet-500 m-1" />
							{items?.map((item, itemIndex) => {
								if (name !== "optionPacks") {
									return <SelectItem value={item} key={`car-body-${item}`}>{item}</SelectItem>
								}
							})}
						</Select.Group>
					</Select.Viewport>
					<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	})

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

	const toggleEditMode = mode => {
		if (mode === "complect") {
			setIsConfiguring(prev => (!prev));
			setAppearanceMode(false);
		} else {
			setAppearanceMode(prev => (!prev));
			setIsConfiguring(false)
		}
	}

	const pushCar = async (endpoint, method) => {
		const res = await pushDocument(currentCar, endpoint, method);
		if (res.errors) return setPushError(res.errors.errors.map(e => e.msg).join(', '))
		if (method === 'DELETE') {
			// setBrandModels(prev => prev.splice(targetIndex))
			return setCurrentCar(schemas.car);
		}
		if (method === 'POST') return setCurrentCar(res);
	}

	return (
		<div className={`px-4 relative ${adminMode && "min-h-96"} overflow-hidden dark:text-slate-300 dark:font-semibold`}>
			<ImageSlider slides={currentCar.img.find(item => item.color === selectedColor)?.srcset} className="" />
			<div className={`h-full w-full z-10 overflow-y-auto scrollbar-none sm:absolute sm:top-0 sm:right-0 duration-200 ${isPanelOpen ? "translate-x-0" : "hidden sm:block sm:translate-x-full"} sm:w-1/2 md:w-2/5 lg:w-2/6 bg-zinc-700/65 pr-4`}>
				<Form.Root className='flex flex-col gap-2 pl-2 md:gap-0'>
					{/* fields for filtered properties */}
					{Object.entries(currentCar)
						.filter(([key, value]) => key !== "complectations" && key !== "_id" && key !== "__v" && key !== "interior" && key !== "exterior" && key !== "optionPacks")
						.map(([key, value], index) => {
							switch (key) {
								case "brand":
									return <MySelect
										className="order-0"
										disabled={!adminMode}
										value={currentCar.brand}
										name={key}
										selectHandler={value => {
											setCurrentCar(prev => ({ ...prev, brand: value }));
											setSelectedBrand(value);
										}}
										items={schemas.brands}
										key={`car-panel-brand-select`}
									/>
								case "body":
									return <MySelect
										className="order-1"
										disabled={!adminMode}
										value={currentCar.body}
										name={key}
										selectHandler={value => setCurrentCar(prev => ({ ...prev, body: value }))}
										items={schemas.bodyTypes}
										key={`car-panel-body-select`}
									/>

								case "engineDisplacement":
									return <div className='flex w-full order-4' key={"car-panel-" + key}>
										{adminMode ?
											<RadioGroup.Root
												disabled={!adminMode}
												onValueChange={value => setCurrentCar(prev => { return { ...prev, engineDisplacement: value } })}
												className="flex py-2 flex-col flex-wrap gap-4 sm:flex-row sm:justify-around"
												value={currentCar.engineDisplacement}
												aria-label="Engine displacement"
											>
												<div className='flex items-center sm:flex-col'>
													<RadioGroup.Item
														className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500"
														value="front"
														id="r1">
														<RadioGroup.Indicator
															className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
													</RadioGroup.Item>
													<label className="pl-3.5" htmlFor="r1">{dictionary.front[language]}</label>
												</div>
												<div className='flex items-center sm:flex-col'>
													<RadioGroup.Item
														className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500"
														value="mid"
														id="r2">
														<RadioGroup.Indicator
															className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
													</RadioGroup.Item>
													<label className="pl-3.5" htmlFor="r2">{dictionary.mid[language]}</label>
												</div>
												<div className='flex items-center sm:flex-col'>
													<RadioGroup.Item
														className="bg-white size-6 rounded-full shadow-[0_2px_10px_black] hover:bg-violet-200 focus:shadow-[0_0_0_2px_black] dark:bg-zinc-500"
														value="rear"
														id="r3">
														<RadioGroup.Indicator
															className="flex items-center justify-center size-full relative after:content-[''] after:block after:size-3 after:rounded-full after:bg-violet-400 dark:after:bg-orange-400" />
													</RadioGroup.Item>
													<label className="pl-3.5" htmlFor="r3">{dictionary.rear[language]}</label>
												</div>
											</RadioGroup.Root> :
											<>
												<span className='pr-4 text-wrap text-slate-400 dark:text-zinc-400 md:self-start'>{dictionary.engineDisplacement[language]}</span>
												<span className='text-slate-200 dark:text-orange-400'>{dictionary[currentCar.engineDisplacement][language]}</span>
											</>}
									</div>

								case "img":
									if (currentCar.img.length) return <MySelect
										className="order-3"
										value={selectedColor}
										name="color"
										selectHandler={value => setSelectedColor(value)}
										/* берем названия цветов из соответствующих полей картинок */
										items={Object.values(currentCar.img).map(set => set.color)}
										key={`car-panel-color-select`}
									/>
									break;

								default: return <Form.Field className='flex w-full order-last' name={"car-" + key} key={"car-panel" + key}>
									<Form.Label className='text-slate-400 dark:text-zinc-400'>{`${dictionary[key][language]}:`}</Form.Label>
									<Form.Control asChild>
										<Input className={`w-24 !bg-transparent !border-0 text-slate-200 sm:w-28`} callback={event => setCurrentCar(prev => ({ ...prev, [key]: +event.target.value || event.target.value }))} type={typeof value} value={value} disabled={!adminMode} />
									</Form.Control>
									<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
								</Form.Field>
							}
						})}

					<div className='flex flex-wrap py-2 gap-2 order-last'>
						<span className='text-red-600'>{pushError}</span>
						{/* CRUD btns for admin panel */}
						{adminMode && <Button callback={() => pushCar("models/add", 'POST')}>Add</Button>}
						{adminMode && <Button callback={() => pushCar("models/update", 'PATCH')}>Update</Button>}
						{adminMode && <Button callback={() => pushCar("models/delete", 'DELETE')}>Delete</Button>}

						{/* btns for mainpage */}
						{(!adminMode && user.roles.some(role => role === "admin")) && <Button callback={() => setCurrentPage(<Admin currentCar={currentCar} setCurrentCar={setCurrentCar} brandModels={brandModels} setBrandModels={setBrandModels} />)}>{dictionary.edit[language]}</Button>}
						{(!adminMode && !user.roles.some(role => role === "admin")) && <Button /* callback={} */>{dictionary.purchase[language]}</Button>}

						{/* show appearanse editor / configurator */}
						{currentCar._id && <Button callback={() => toggleEditMode("complect")}>{dictionary.configure[language]}</Button>}
						{currentCar._id && <Button callback={() => toggleEditMode("appearance")}>{dictionary.appearance[language]}</Button>}
					</div>
				</Form.Root>
			</div>
			<HamburgerMenuIcon className='absolute top-1 right-5 z-10 text-blue-300 dark:text-orange-400 size-6 duration-150 hover:scale-150 hover:cursor-pointer' onClick={() => setIsPanelOpen(prev => !prev)} />
		</div>
	);
};

export default CarPanel;