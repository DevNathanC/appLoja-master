
import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
// Importa logoBase64 do App



const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><NavLink to="/" end>✂️ Entradas de Serviços</NavLink></li>
        <li><NavLink to="/caixa">💰 Caixa</NavLink></li>
        <li><NavLink to="/clientes">👥 Clientes</NavLink></li>
      </ul>
    </div>
  );
};

export default Sidebar;
