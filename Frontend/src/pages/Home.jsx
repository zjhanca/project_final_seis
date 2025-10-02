// src/pages/Home.jsx
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  // Auto-avance del carrusel cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      title: "Sistema de Gestión Empresarial",
      description: "Optimiza los procesos de tu organización con nuestra plataforma integral",
      buttonText: "Comenzar"
    },
    {
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",
      title: "Análisis y Reportes",
      description: "Toma decisiones informadas con dashboards intuitivos y reportes detallados",
      buttonText: "Ver Reportes"
    },
    {
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80",
      title: "Colaboración en Equipo",
      description: "Mejora la comunicación y productividad de tu equipo de trabajo",
      buttonText: "Explorar Herramientas"
    }
  ];

  return (
    <div className="home-container">
      {/* Carrusel */}
      <section className="carousel-container">
        <div className="carousel" id="mainCarousel">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="carousel-content">
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
          
          {/* Indicadores */}
          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Información básica */}
      <section className="info-section">
        <div className="container">
          <h2>Sobre Nuestra Plataforma</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Gestión Integral</h3>
              <p>Administra todos los aspectos de tu empresa desde una sola plataforma</p>
            </div>
            <div className="info-card">
              <h3>Seguridad Avanzada</h3>
              <p>Protección de datos con encriptación de nivel empresarial</p>
            </div>
            <div className="info-card">
              <h3>Soporte 24/7</h3>
              <p>Asistencia técnica especializada disponible las 24 horas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="services-section">
        <div className="container">
          <h2>Nuestros Módulos</h2>
          <div className="services-grid">
            <div className="service-item">
              <h3>Recursos Humanos</h3>
              <p>Gestiona nóminas, vacaciones y evaluaciones de desempeño</p>
            </div>
            <div className="service-item">
              <h3>Contabilidad</h3>
              <p>Control financiero completo con reportes automatizados</p>
            </div>
            <div className="service-item">
              <h3>Inventario</h3>
              <p>Seguimiento en tiempo real de productos y materiales</p>
            </div>
            <div className="service-item">
              <h3>CRM</h3>
              <p>Administra relaciones con clientes y oportunidades de venta</p>
            </div>
            <div className="service-item">
              <h3>Proyectos</h3>
              <p>Planifica, ejecuta y supervisa proyectos empresariales</p>
            </div>
            <div className="service-item">
              <h3>Reportes</h3>
              <p>Dashboards personalizables con métricas clave de negocio</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}