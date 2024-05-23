import { useEffect, useState, Suspense } from 'react';
import { UserContext, PageNavContext, LangContext, servURLContext } from './context';
import { register } from 'swiper/element/bundle';
import Main from './pages/Main/Main';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Spinner from './UI/Spinner';
import { useFetching } from './hooks/useFetching';

const servURL = process.env.REACT_APP_backURL || "http://192.168.0.179:8080/api/" || "http://localhost:8080/api/";
const Languages = {
  en: 'en',
  ua: 'ua'
}
// set language on load
if (!localStorage.language) {
  localStorage.setItem('language', Languages.ua);
}
// set theme on load
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

function App() {
  const [user, setUser] = useState({ roles: ["guest"] });
  const [currentPage, setCurrentPage] = useState(<Main />);
  const [language, setLanguage] = useState(localStorage.language);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const [userAuth] = useFetching(async (token) => {
    let res = await fetch(servURL + "users/auth", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + token
      },
    })
    res = await res.json();
    return res;
  })

  useEffect(() => {
    register(); // swiper

    const userToken = localStorage.getItem("userToken");

    async function handleAuth(token) {
      const res = await userAuth(token);
      // error message = clear token
      if (res.message) {
        return localStorage.setItem("userToken", "");
      }
      const { username, roles } = res;
      setUser({
        username,
        roles
      });
    }

    if (userToken.length) {
      handleAuth(userToken);
    }
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
    <UserContext.Provider value={{ user, setUser }}>
      <servURLContext.Provider value={{ servURL }}>
        <LangContext.Provider value={{ language, toggleLang }}>
          <PageNavContext.Provider value={{ currentPage, setCurrentPage }}>
            <div className='flex flex-col h-screen'>
              <Header toggleTheme={toggleTheme} isAuthDialogOpen={isAuthDialogOpen} setIsAuthDialogOpen={setIsAuthDialogOpen} />
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
    </UserContext.Provider>
  );
}

export default App;