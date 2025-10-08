
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center mt-auto border-t border-solid border-t-[#f0f2f4]">
      <div className="flex max-w-[960px] flex-1 flex-col">
        <div className="flex flex-col gap-6 px-5 py-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-around">
            <Link className="text-[#637588] text-base font-normal leading-normal min-w-40" to="#">Política de Privacidad</Link>
            <Link className="text-[#637588] text-base font-normal leading-normal min-w-40" to="#">Términos de Servicio</Link>
            <Link className="text-[#637588] text-base font-normal leading-normal min-w-40" to="#">Contacto</Link>
            <Link className="text-[#637588] text-base font-normal leading-normal min-w-40" to="/admin">Admin Panel</Link>
          </div>
          <p className="text-[#637588] text-base font-normal leading-normal">© {new Date().getFullYear()} CIEC Noticias. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
