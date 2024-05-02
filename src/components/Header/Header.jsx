import React, { useContext, lazy, useState } from 'react';
import { LangContext, PageNavContext } from '../../context';
import dictionary from './dictionary';
const Main = lazy(() => import('../../pages/Main/Main'));
const Admin = lazy(() => import('../../pages/Admin/Admin'));
const Account = lazy(() => import('../../pages/Account/Account'));

const Header = ({ toggleTheme }) => {
	const { currentPage, setCurrentPage } = useContext(PageNavContext);
	const { language, toggleLang } = useContext(LangContext);
	const [theme, setTheme] = useState(localStorage.theme || "light");

	const PAGES = [
		[dictionary.main[language], <Main />],
		[dictionary.admin[language], <Admin />],
		[dictionary.account[language], <Account />],
	]

	const handleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else {
			setTheme("light");
		}
		toggleTheme();
	}

	return (
		<>
			<header className='pt-4 px-6 pb-2 bg-slate-400 dark:bg-zinc-900'>
				<div className="flex items-center">
					<h1 className='inline-block mx-auto text-3xl font-semibold text-orange-600 dark:text-yellow-700'>Trident</h1>
					<img className="size-6 cursor-pointer" onClick={toggleLang} src={`./icons/${localStorage.language.toUpperCase()}-flag.svg`} alt={dictionary.language[localStorage.language]} />
					<svg className='size-8 cursor-pointer' onClick={handleTheme} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM7.49988 1.82689C4.36688 1.8269 1.82707 4.36672 1.82707 7.49972C1.82707 10.6327 4.36688 13.1725 7.49988 13.1726V1.82689Z" fill={localStorage.theme === "dark" ? "#dedede" : "#212121"} fillRule="evenodd" clipRule="evenodd" data-darkreader-inline-fill=""></path>
					</svg>
				</div>
			</header>
			<nav className="flex justify-center sticky bg-blue-200 dark:bg-orange-400 top-0 z-50">
				{PAGES.map(([title, page], index) => (
					<div className='px-5 py-3 cursor-pointer duration-150 hover:bg-blue-300' onClick={() => setCurrentPage(page)} key={index}>{title}</div>
				))}
			</nav>
		</>
	);
};

export default Header;