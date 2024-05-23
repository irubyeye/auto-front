import React, { useState, useRef, useEffect } from 'react';

const ImageSlider = ({ slides, className }) => {
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

	return (
		<div className={`overflow-hidden relative ${className}`}>
			<swiper-container init="false" ref={swiperRef}>
				{slides?.map((slide, index) => {
					return (
						<swiper-slide key={index}>
							<img className='object-contain w-full max-h-96 sm:min-h-80' src={slide} loading='lazy' />
						</swiper-slide>
					)
				})}
			</swiper-container>
		</div>
	);
};

export default ImageSlider;