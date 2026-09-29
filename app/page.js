import OrderForm from "./OrderForm";
import { PRODUCT } from "@/lib/config";
const { price, currency } = PRODUCT;
export default function Home() {
  return (
    <main>
      <header className="hero">
        <div className="hero-text">
          <h1>Brush your hair. Not the knots.</h1>
          <p>A curved, vented detangling brush with mixed nylon and boar bristles, safe to use on wet or dry hair. Order online and pay in cash when it reaches your door.</p>
          <a className="btn" href="#order">Order for {currency}{price}</a>
        </div>
        <div className="shot" aria-label="Product photo">
          <img src="/brush-bristles.jpg" width="900" height="1125" fetchPriority="high" alt="Curved vented paddle hairbrush held in one hand" />
          <b className="tag">{currency}{price}</b>
        </div>
      </header>

      <section className="why">
        <h2>Made for daily use</h2>
        <dl>
          <div><dt>Wet or dry</dt><dd>Waterproof, so you can use it in the shower or on damp hair.</dd></div>
          <div><dt>Curved and vented</dt><dd>The bowed head follows your head, and slots through the paddle let air pass while you blow-dry.</dd></div>
          <div><dt>Two kinds of bristle</dt><dd>Ball-tipped nylon pins work through knots, and natural boar bristles smooth the hair.</dd></div>
        </dl>
      </section>

      <section className="gallery" aria-label="More photos">
        {[["brush-curve","Curved paddle seen from the side"],["brush-side","Side profile showing the curve"],["brush-back","Back of the paddle showing the vent slots"]].map(([f,a])=><img key={f} src={`/${f}.jpg`} width="900" height="1125" alt={a} loading="lazy" />)}
      </section>

      <section id="order" className="order" tabIndex={-1}>
        <div>
          <h2>Order in one minute</h2>
          <p>No card needed. Fill in your details and we will call to confirm, then deliver to you. You pay the courier in cash.</p>
        </div>
        <OrderForm price={price} currency={currency} />
      </section>

      <section className="faq">
        <h2>Questions</h2>
        <details><summary>What is it made of?</summary><p>An ABS plastic body and handle, with a mix of nylon and natural boar bristles.</p></details>
        <details><summary>How do I pay?</summary><p>Cash on delivery. You pay when the brush is in your hands.</p></details>
        <details><summary>How long does delivery take?</summary><p>We call you after you order to agree on a delivery time.</p></details>
        <details><summary>What if I change my mind?</summary><p>Tell the courier before paying, or call us and we will cancel the order.</p></details>
      </section>
      <footer>© {new Date().getFullYear()} <span translate="no">{PRODUCT.name}</span></footer>
    </main>
  );
}
