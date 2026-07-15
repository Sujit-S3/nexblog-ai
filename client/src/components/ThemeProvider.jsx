import { useSelector } from 'react-redux';

export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div className={theme}>
      <div className='min-h-screen transition-colors duration-300 bg-background dark:bg-background-dark text-slate-800 dark:text-slate-200'>
        {children}
      </div>
    </div>
  );
}
