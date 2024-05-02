import React from 'react';

const Button = ({ children, callback, ...props }) => {
	return (
		<button className='self-center w-fit py-1 px-2 rounded-lg bg-blue-300 hover:scale-95' onClick={callback} type='button' {...props}>
			{children}
		</button>
	);
};

export default Button;