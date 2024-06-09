import React, { useContext, useRef, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useFetching } from '../../hooks/useFetching';
import { servURLContext, LangContext } from '../../context';
import CarPanel from '../CarPanel/CarPanel';
import CarComplectationTabs from '../CarComplectationTabs/CarComplectationTabs';
import AppearanceEditor from '../AppearanceEditor/AppearanceEditor';
import Input from '../../UI/Input';
import dictionary from './dictionary';
import Button from '../../UI/Button';

const Configurator = ({ currentCar, setCurrentCar, selectedColor, setSelectedColor, brandModels, setBrandModels, setSelectedBrand, selectedComplectIndex, setSelectedComplectIndex, appearanceColors, setAppearanceColors, createOrder, adminMode }) => {
	const [isConfiguring, setIsConfiguring] = useState(false);
	const [appearanceMode, setAppearanceMode] = useState(false);
	const { servURL } = useContext(servURLContext);
	const { language } = useContext(LangContext);
	const colorField = useRef(null);

	const [pushDocument, pushError, setPushError] = useFetching(async (document, endpoint, method) => {
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

	const MySelect = React.forwardRef(({ value, name, selectHandler, items, fetchHandler, ...props }, forwardedRef) => {
		return <Select.Root value={value} onValueChange={selectHandler} onOpenChange={fetchHandler} {...props} ref={forwardedRef}>
			<Select.Trigger className={`inline-flex items-center justify-center gap-1 px-1 py-1 w-full bg-transparent border-0  dark:text-orange-400 shadow-xl rounded border-2 border-solid border-slate-400 dark:border-zinc-500 sm:py-0`} aria-label="car-body-select-trigger">
				<Select.Value className='' placeholder={dictionary[name][language]} />
				<Select.Icon className="">
					<ChevronDownIcon />
				</Select.Icon>
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
							{items?.map((item, itemIndex) => <SelectItem value={item} key={`configAdminExtendions-${name}-${item}`}>{item}</SelectItem>)}
						</Select.Group>
					</Select.Viewport>
					<Select.ScrollDownButton className="flex items-center justify-center h-6 bg-slate-100">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	})

	const AdminExtensions = () => {
		return <div className='p-4 mt-2'>
			{/* colors block */}
			<div ref={colorField}>
				<MySelect
					value={currentCar.img.find(item => item?.color?.en === selectedColor?.en)?.color[language] || currentCar.img[0]?.color[language]}
					name="color"
					selectHandler={value => setSelectedColor(currentCar.img.find(item => item.color[language] === value).color)}
					items={Object.values(currentCar.img).map(colors => colors.color[language])}
				/>
				<fieldset className=''>
					<label className='text-slate-600 dark:text-orange-400' htmlFor="color">{dictionary.colorLabel[language]}</label>
					<Input className="ml-2 md:w-44" id="color" placeholder="color/колір" />
				</fieldset>
				<fieldset className='text-slate-600 dark:text-orange-400'>
					<label htmlFor="srcset">{dictionary.srcset[language]}</label>
					<Input className="ml-2 md:ml-0" id="srcset" />
				</fieldset>
				<span className='text-red-600'>{pushError?.msg || pushError}</span>
				<div className='flex mt-2 gap-4'>
					<Button callback={async () => {
						if (pushError) setPushError(null);
						const [newColorEN, newColorUA] = colorField.current.querySelector('#color').value.split('/');
						const srcset = colorField.current.querySelector('#srcset').value.split(", ");
						const newColor = { color: { en: newColorEN, ua: newColorUA }, srcset: srcset }
						const res = await pushDocument({ _id: currentCar._id, img: newColor }, `models/addColor`, 'PATCH');
						if (res.errors) return setPushError(res.errors.errors[0]);
						if (res.message) return setPushError(res.message);
						const outdatedModelIndex = brandModels.findIndex(model => model._id === currentCar._id);
						if (!currentCar.img.length) setBrandModels(prev => {
							const tmpModels = [...prev];
							tmpModels[outdatedModelIndex].img = [newColor];
							return tmpModels;
						});
						setCurrentCar(prev => {
							if (!prev.img) {
								return { ...prev, img: [newColor] }
							} else {
								return { ...prev, img: [...prev.img, newColor] }
							}
						})
					}}>Add</Button>

					<Button callback={async () => {
						const tmp = [...currentCar.img];
						const targetIndex = tmp.findIndex(item => item.color.en === selectedColor.en);
						tmp.splice(targetIndex, 1);
						setCurrentCar(prev => ({ ...prev, img: tmp }));

						const res = await pushDocument({ _id: currentCar._id, img: currentCar.img[targetIndex] }, `models/deleteColor`, 'PATCH');
					}}>Delete</Button>
				</div>
			</div>
		</div>
	}

	return (
		<div className="py-4 bg-slate-300 dark:bg-zinc-700 border-2 border-solid border-slate-400 rounded-xl">
			{currentCar && <CarPanel
				adminMode={adminMode}
				currentCar={currentCar}
				setCurrentCar={setCurrentCar}
				selectedColor={selectedColor}
				setSelectedColor={setSelectedColor}
				brandModels={brandModels}
				setBrandModels={setBrandModels}
				setSelectedBrand={setSelectedBrand}
				setIsConfiguring={setIsConfiguring}
				setAppearanceMode={setAppearanceMode}
				createOrder={createOrder} />}

			{isConfiguring &&
				<CarComplectationTabs
					adminMode={adminMode}
					currentCar={currentCar}
					setCurrentCar={setCurrentCar}
					brandModels={brandModels}
					selectedComplectIndex={selectedComplectIndex}
					setSelectedComplectIndex={setSelectedComplectIndex} />}

			{appearanceMode &&
				<AppearanceEditor
					adminMode={adminMode}
					currentCar={currentCar}
					setCurrentCar={setCurrentCar}
					brandModels={brandModels}
					appearanceColors={appearanceColors}
					setAppearanceColors={setAppearanceColors} />}

			{(adminMode && currentCar._id) &&
				<AdminExtensions />}
		</div>
	);
};

export default Configurator;