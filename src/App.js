import { useEffect, useState, Suspense } from 'react';
import { PageNavContext, LangContext, servURLContext } from './context';
import { register } from 'swiper/element/bundle';
import Main from './pages/Main/Main';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Spinner from './UI/Spinner';

const Languages = {
  en: 'en',
  ua: 'ua'
}

const servURL = process.env.REACT_APP_backURL || "http://localhost:8080/api/";

if (!localStorage.language) {
  localStorage.setItem('language', Languages.ua);
}

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

function App() {
  const [currentPage, setCurrentPage] = useState(<Main />);
  const [language, setLanguage] = useState(localStorage.language);

  useEffect(() => {
    register(); // swiper

    // console.log(document.cookie?.split(';'));
    /* if (
      document.cookie?.split(';')?.filter(string => {
        return string === "username"
      }).length
    ) {
      console.log(document.cookie?.split(';')?.filter(string => {
        return string === "username"
      }));
    } */
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  const toggleLang = () => {
    if (language === "ua") {
      setLanguage(Languages.en);
      localStorage.setItem("language", "en");
    } else {
      setLanguage(Languages.ua);
      localStorage.setItem("language", "ua");
    }
  }

  return (
    <servURLContext.Provider value={{ servURL }}>
      <LangContext.Provider value={{ language, toggleLang }}>
        <PageNavContext.Provider value={{ currentPage, setCurrentPage }}>
          <div className='flex flex-col h-screen'>
            <Header toggleTheme={toggleTheme} />
            <main className='basis-full grow p-4 bg-cyan-100 dark:bg-zinc-800 relative'>
              <Suspense fallback={<Spinner />}>
                {currentPage}
              </Suspense>
            </main>
            <Footer />
          </div>
        </PageNavContext.Provider>
      </LangContext.Provider>
    </servURLContext.Provider>
  );
}

export default App;