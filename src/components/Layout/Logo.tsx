
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center group">
      <div className="text-2xl font-bold text-blue-900 font-serif flex items-center">
        Homed
      </div>
    </Link>
  );
};

export default Logo;
