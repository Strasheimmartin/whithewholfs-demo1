import React from 'react';
import './EducationOverview.css'; // Asegúrate de tener este archivo en la misma carpeta

const articles = [
  {
    id: 1,
    title: "Introducción a la inversión",
    summary: "Aprende los fundamentos de la inversión de forma sencilla y práctica.",
    image: "https://via.placeholder.com/400x200?text=Inversi%C3%B3n"
  },
  {
    id: 2,
    title: "Cómo crear un presupuesto",
    summary: "Consejos y pasos para estructurar y cumplir un presupuesto personal.",
    image: "https://via.placeholder.com/400x200?text=Presupuesto"
  },
  {
    id: 3,
    title: "Estrategias de ahorro",
    summary: "Descubre métodos efectivos para optimizar tu ahorro personal.",
    image: "https://via.placeholder.com/400x200?text=Ahorro"
  }
];

const EducationOverview = () => {
  return (
    <div className="education-container">
      <h2>Educación Financiera</h2>
      <div className="articles-grid">
        {articles.map((article) => (
          <div className="article-card" key={article.id}>
            <img src={article.image} alt={article.title} className="article-image" />
            <div className="article-content">
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <button className="read-more-btn">Leer más</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationOverview;