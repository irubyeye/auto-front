import React, { useContext, useEffect, useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Form from '@radix-ui/react-form';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { useFetching } from '../../hooks/useFetching';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import Input from '../../UI/Input';
import { LangContext, PageNavContext, UserContext, servURLContext, userAuthContext } from '../../context';
import schemas from '../../utils/schemas';
import dictionary from './dictionary';
import Button from '../../UI/Button';
import Admin from '../../pages/Admin/Admin';

const CarPanel = ({ adminMode, currentCar, setCurrentCar, selectedColor, setSelectedColor, brandModels, setBrandModels, setSelectedBrand, setIsConfiguring, setAppearanceMode, createOrder }) => {
	const { setCurrentPage } = useContext(PageNavContext);
	const { language } = useContext(LangContext);
	const { servURL } = useContext(servURLContext);
	const { user } = useContext(UserContext);
	const { setIsAuthDialogOpen } = useContext(userAuthContext);
	const [isPanelOpen, setIsPanelOpen] = useState(window.matchMedia("(min-width: 768px)").matches);

	// select color on load
	useEffect(() => {
		if (currentCar.img.length) setSelectedColor(currentCar.img[0].color);
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
								return <SelectItem value={item} key={`car-body-${item}`}>{item}</SelectItem>
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

	const [fetchDocument] = useFetching(async (endpoint) => {
		let data = await fetch(servURL + endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		data = await data.json();
		return data;
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
		setAppearanceMode(false);
		setIsConfiguring(false);
		if (pushError) setPushError(null);

		const carToPush = { ...currentCar };

		if (method !== "DELETE" && carToPush.complectations) {
			carToPush.complectations = carToPush.complectations?.map(complect => {
				if (typeof complect === 'string') return complect;
				if (!complect?._id) return;
				return complect = complect._id;
			});
		}

		const res = await pushDocument(carToPush, endpoint, method);
		if (res.errors) return setPushError(`${res.message} ${res?.errors?.errors?.map(e => e?.msg)?.join(', ')}`);
		if (method === 'POST') {
			setBrandModels(prev => ([...prev, res]));
			return setCurrentCar(res);
		}
		const targetIndex = brandModels.findIndex(car => car._id === carToPush._id);
		if (method === 'DELETE') {
			if (targetIndex >= 0) {
				const tmp = [...brandModels];
				tmp.splice(targetIndex, 1);
				setBrandModels(tmp);
				if (tmp.length) {
					const car = await fetchDocument(`models/getOne?id=${brandModels[0]._id}`);
					setCurrentCar(car[0]);
				}
				return;
			}
			return setCurrentCar(schemas.car);
		}

		if (method === 'PATCH' && targetIndex >= 0) return setBrandModels(prev => {
			const tmp = [...prev];
			if (carToPush.model !== tmp[targetIndex].model) tmp[targetIndex].model = carToPush.model;
			if (carToPush.img.length && !brandModels[targetIndex].img.length) tmp[targetIndex].img = carToPush.img;
			return tmp;
		})
	}

	const handlePurchase = () => {
		if (!user || !user._id) return setIsAuthDialogOpen(true);
		createOrder();
	}

	return (
		<div className={`px-4 relative ${adminMode && "min-h-96"} overflow-hidden dark:text-slate-300 dark:font-semibold`}>
			<ImageSlider slides={currentCar.img?.find(item => item.color.en === selectedColor?.en)?.srcset} data-isopen={isPanelOpen} className={`duration-150 ${isPanelOpen ? "sm:translate-x-[-15%] lg:translate-x-[-17%]" : null}`} slideStyles={`max-h-96 duration-200 sm:min-h-80 ${isPanelOpen ? "sm:scale-75 lg:scale-100" : null}`} />
			<div className={`pt-3 h-full w-full z-10 overflow-y-auto overflow-x-hidden scrollbar-none sm:absolute sm:top-0 sm:pt-9 sm:right-0 duration-200 ${isPanelOpen ? "translate-x-0 sm:mr-3" : "hidden sm:block sm:translate-x-full"} sm:w-3/12 lg:w-2/6 bg-zinc-700/65 pr-4`}>
				<Form.Root className='flex flex-col gap-2 pl-2 md:gap-0'>
					{/* fields for filtered properties */}
					{Object.entries(currentCar)
						.filter(([key, value]) => key !== "complectations" && key !== "_id" && key !== "__v" && key !== "interior" && key !== "exterior")
						.map(([key, value], index) => {
							switch (key) {
								case "brand":
									return <MySelect
										className="order-0"
										disabled={!adminMode}
										value={currentCar.brand}
										name={key}
										selectHandler={value => {
											setPushError(false);
											setIsConfiguring(false);
											setAppearanceMode(false);
											setCurrentCar({ ...schemas.car, brand: value });
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
										selectHandler={value => {
											setPushError(false);
											setCurrentCar(prev => ({ ...prev, body: value }));
										}}
										items={schemas.bodyTypes}
										key={`car-panel-body-select`}
									/>

								case "engineDisplacement":
									return <div className='flex w-full order-4 sm:flex-col md:flex-row' key={"car-panel-" + key}>
										{adminMode ?
											<RadioGroup.Root
												disabled={!adminMode}
												onValueChange={value => {
													setPushError(false);
													setCurrentCar(prev => { return { ...prev, engineDisplacement: value } });
												}}
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
										value={currentCar.img.find(item => item.color.en === selectedColor?.en)?.color[language] || currentCar.img[0].color[language]}
										name="color"
										selectHandler={value => setSelectedColor(currentCar.img.find(item => item.color[language] === value).color)}
										/* берем названия цветов из соответствующих полей в картинках */
										items={Object.values(currentCar.img).map(set => set.color[language])}
										key={`car-panel-color-select`}
									/>
									return null;

								default: return <Form.Field className='flex w-full order-last sm:flex-col md:flex-row' name={"car-" + key} key={"car-panel" + key}>
									<Form.Label className='text-slate-400 dark:text-zinc-400'>{`${dictionary[key][language]}:`}</Form.Label>
									<Form.Control asChild>
										<Input className={`md:ml-2 w-24 !bg-transparent ${!adminMode && "!border-0"} text-slate-200 sm:w-28`} callback={event => { setCurrentCar(prev => ({ ...prev, [key]: +event.target.value || event.target.value })); setPushError(false); }} type={typeof value} value={value} disabled={!adminMode} />
									</Form.Control>
									<Form.Message match="valueMissing">{dictionary.required[language]}</Form.Message>
								</Form.Field>
							}
						})}
					{/* buttons */}
					<div className='flex flex-wrap py-2 gap-2 order-last'>
						<span className='text-red-600'>{pushError}</span>
						{/* CRUD btns for admin panel */}
						{adminMode && <Button callback={() => pushCar("models/add", 'POST')}>Add</Button>}
						{adminMode && <Button callback={() => pushCar("models/update", 'PATCH')}>Update</Button>}
						{adminMode && <Button callback={() => pushCar("models/delete", 'DELETE')}>Delete</Button>}

						{/* btns for mainpage */}
						{(!adminMode && user.roles.some(role => role === "admin")) &&
							<Button callback={() => setCurrentPage(<Admin providedCar={currentCar} providedModels={brandModels} />)}>{dictionary.edit[language]}</Button>}
						{(!adminMode && !user.roles.some(role => role === "admin")) &&
							<Button callback={handlePurchase}>{dictionary.purchase[language]}</Button>}

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