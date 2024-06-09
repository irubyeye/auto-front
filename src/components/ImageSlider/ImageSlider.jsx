import React, { useRef, useEffect } from 'react';

const ImageSlider = ({ slides, className, slideStyles, ...props }) => {
	const swiperRef = useRef(null);

	useEffect(() => {
		const params = {
			slidesPerView: 1,
			grabCursor: true,
			pagination: true,
		};
		Object.assign(swiperRef.current, params);
		swiperRef.current.initialize();
	}, [slides?.length]);

	return (
		<div className={`overflow-hidden relative ${className}`} {...props}>
			<swiper-container init="false" ref={swiperRef}>
				{slides?.map((slide, index) => {
					return (
						<swiper-slide key={index}>
							<img className={`object-contain w-full ${slideStyles}`} src={slide} loading='lazy' />
						</swiper-slide>
					)
				})}
			</swiper-container>
		</div>
	);
};

export default ImageSlider;