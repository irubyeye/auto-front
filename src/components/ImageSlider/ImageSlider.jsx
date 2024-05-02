import React, { useState, useRef, useEffect } from 'react';

const ImageSlider = (props) => {
	const { images, className } = props;
	const [slides, setSlides] = useState([1, 2, 3,]);
	const swiperRef = useRef(null);

	useEffect(() => {
		const params = {
			injectStyles: [`.swiper-horizontal {padding-bottom: 30px}`],
			slidesPerView: 1,
			grabCursor: true,
			pagination: true,
		};
		Object.assign(swiperRef.current, params);
		swiperRef.current.initialize();
	}, []);

	const renderSlides = () => {
		if (!slides.length) {
			return (
				<swiper-slide>
					<div className="min-w-60 min-h-36 p-4 bg-gray-200"></div>
				</swiper-slide>
			)
		}

		return (
			slides.map((el, index) => {
				return (
					<swiper-slide key={index}>
						<p className=''>asdad</p>
						{/* <img className='' src={el.src} alt={el.label} loading='lazy' /> */}
					</swiper-slide>
				)
			})
		)
	}

	return (
		<div className={`overflow-hidden relative	${className}`}>
			<swiper-container init="false" ref={swiperRef}>
				{renderSlides()}
			</swiper-container>
		</div>
	);
};

export default ImageSlider;