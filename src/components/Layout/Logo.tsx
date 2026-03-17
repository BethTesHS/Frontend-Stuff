import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center group ml-0 md:ml-8 lg:ml-14">
      <div className="text-2xl font-bold text-blue-1000 dark:text-whitee flex items-center gap-2 transition-transform duration-200 group-hover:scale-105">
        <img
          src="/logo.svg"
          alt="Homed Logo"
          className="h-8 w-auto transition-transform duration-200 group-hover:rotate-6"
        />
      </div>
    </Link>
  );
};

export default Logo;