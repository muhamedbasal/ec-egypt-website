import React from "react";
import { createRoot } from "react-dom/client";
import "./main.css";

function App() {
  return (
    <>
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="mark">EC</span>
            <div>
              <strong>Egyptian Canadian Company</strong>
              <small>EC-Egypt</small>
            </div>
          </div>
          <div className="links">
            <a href="#about">About</a>
            <a href="#products">Products</a>
            <a href="#packing">Packing</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <section className="hero-content">
          <p className="eyebrow">Since 1947 family trading heritage</p>
          <h1>Third-generation expertise in pulses, grains and agricultural commodities.</h1>
          <p>
            Egyptian Canadian Company is a trusted Egyptian family business serving wholesalers,
            food factories, distributors, restaurants and regional buyers with reliable agricultural commodities.
          </p>
          <div className="actions">
            <a className="btn primary" href="#contact">Request Inquiry</a>
            <a className="btn secondary" href="#products">View Products</a>
          </div>
        </section>
      </header>

      <main>
        <section id="about" className="section grid">
          <div>
            <p className="eyebrow">About us</p>
            <h2>Built on family experience, focused on reliable supply.</h2>
          </div>
          <p>
            Egyptian Canadian Company represents the third generation of the Basal family in agricultural
            commodities, built on family heritage dating back to 1947.
          </p>
        </section>

        <section id="products" className="section">
          <p className="eyebrow">Products</p>
          <h2>Our main commodities</h2>
          <div className="cards">
            <div>Whole Fava Beans</div>
            <div>Split Fava Beans</div>
            <div>White Beans</div>
            <div>Black-eyed Beans</div>
            <div>Chickpeas</div>
            <div>Green Lentils</div>
            <div>Red Lentils</div>
            <div>Rice</div>
            <div>Canary Seed</div>
            <div>Fennel Seeds</div>
          </div>
        </section>

        <section id="packing" className="section split">
          <div>
            <p className="eyebrow">Processing & Packing</p>
            <h2>Wholesale, cleaning, sorting and private label packing.</h2>
            <p>
              We provide flexible packing solutions for wholesale, foodservice, factories and private-label clients,
              including 25 kg and 50 kg bags, with customized packing available upon request.
            </p>
          </div>
          <div className="panel">
            <h3>Services</h3>
            <ul>
              <li>Wholesale supply</li>
              <li>Cleaning and screening</li>
              <li>Sorting and packing</li>
              <li>Private label solutions</li>
              <li>B2B inquiry-based supply</li>
            </ul>
          </div>
        </section>

        <section className="section arabic" dir="rtl" lang="ar">
          <p className="eyebrow">الشركة المصرية الكندية</p>
          <h2>خبرة عائلية في تجارة الحبوب والبقوليات منذ عام 1947.</h2>
          <p>
            الشركة المصرية الكندية هي شركة مصرية عائلية متخصصة في تجارة وتجهيز وتعبئة الحبوب والبقوليات
            والحاصلات الزراعية وتمثل امتداد الجيل الثالث من عائلة بصل في هذا المجال.
          </p>
        </section>

        <section id="contact" className="section contact">
          <p className="eyebrow">Contact</p>
          <h2>Lets discuss your commodity requirements.</h2>
          <p>Email: info@ec-egypt.com</p>
          <p>Phone: +20 100 957 7227 / +20 102 700 1142</p>
        </section>
      </main>

      <footer>
        <p>© Egyptian Canadian Company - EC-Egypt. All rights reserved.</p>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
