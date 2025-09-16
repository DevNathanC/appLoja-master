
import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
// Importa logoBase64 do App



const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
  {/* Logo removida conforme solicitado */}
      <h2>Menu</h2>
      <ul>
        <li><Link to="/">Entradas de Serviços</Link></li>
        <li><Link to="/caixa">Caixa</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
