const state = {
  filter: "all",
  search: "",
  sort: "featured",
  wishlist: new Set(),
  cart: 0,
  reviewIndex: 0,
};

const categoryFor = (p) => {
  const n = p.name.toLowerCase();
  if (n.includes("racing") || n.includes("wheel")) return "Racing";
  if (n.includes("projector") || n.includes("screen")) return "Big Screen";
  if (n.includes("vr") || n.includes("oculus")) return "VR";
  if (n.includes("xbox")) return "Xbox";
  if (n.includes("game") || n.includes("fc") || n.includes("god of war") || n.includes("uncharted") || n.includes("spider-man") || n.includes("ghost") || n.includes("cricket")) return "Games";
  return "PS5";
};

const reviews = [
  {initials:"SB", name:"Satyaki", place:"Kolkata", type:"Trekking Gear", text:"I would recommend SharePal for anybody looking to rent trekking gears. On-time delivery, great product condition and a transparent deposit return policy."},
  {initials:"AS", name:"Afrana", place:"Bangalore", type:"Gaming Console", text:"Have used their services twice now. Quick responses, polite, transparent, hassle free, great products. Rented trekking gear and PS4."},
  {initials:"AA", name:"Amal", place:"Bangalore", type:"Gaming Console", text:"I am a regular customer and order PS4. It’s very affordable and booking an order is super easy and user friendly."},
  {initials:"PS", name:"Pankaj", place:"Mumbai", type:"Action Cameras", text:"The camera and service provided by them is good. Overall I am happy by renting camera gear from SharePal."},
  {initials:"MM", name:"Manish", place:"Mumbai", type:"Gaming Console", text:"Shoes and trekking poles arrived in excellent condition. Delivery and pickup were smooth and refund was done within the expected time."},
  {initials:"SJ", name:"Shruti", place:"Mumbai", type:"Winter Wear", text:"Awesome experience. Received excellent clothes and shoes in washed and clean state. They looked like new ones."}
];

const faqs = [
  ["How can I rent from SharePal?", "Choose your product, select the rental dates, review the price and complete the booking. The gear is delivered to your doorstep and collected after the rental period."],
  ["If I rent multiple products, can I extend only some of them?", "Yes. Rental durations can be managed according to the products and availability, subject to the applicable extension policy."],
  ["What is the minimum rental period?", "The minimum rental duration can vary by product. The available dates and price are shown during booking."],
  ["When does the rental start?", "Your rental starts on the confirmed delivery/rental start date shown in your booking details."],
  ["What will be the condition of the products at delivery?", "Products are checked and prepared before dispatch so they meet the expected quality standard."],
];

const grid = document.getElementById("productGrid");
const empty = document.getElementById("emptyState");
const resultCount = document.getElementById("resultCount");

function filteredProducts() {
  let list = [...PRODUCTS];
  if (state.filter !== "all") list = list.filter(p => categoryFor(p) === state.filter);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }
  if (state.sort === "price-low") list.sort((a,b) => a.per_day_rent - b.per_day_rent);
  if (state.sort === "price-high") list.sort((a,b) => b.per_day_rent - a.per_day_rent);
  if (state.sort === "rating") list.sort((a,b) => b.rating - a.rating);
  return list;
}

function productCard(p) {
  const saved = state.wishlist.has(p.id);
  return `<article class="product-card">
    <div class="product-image">
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      ${p.out_of_stock ? `<span class="stock">Out of stock</span>` : ""}
      <button class="heart ${saved ? "saved" : ""}" data-wish="${p.id}" type="button" aria-label="Wishlist">${saved ? "♥" : "♡"}</button>
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.opacity='.15'">
    </div>
    <div class="product-body">
      <h3 class="product-title">${p.name}</h3>
      <div class="product-meta">
        <span>★ ${p.rating ? p.rating.toFixed(1) : "New"}</span>
        <span>${p.booked_count} booked this month</span>
      </div>
      <div class="product-bottom">
        <div class="price"><strong>₹${p.per_day_rent}</strong> <span>/day</span></div>
        <button class="rent-btn" data-rent="${p.id}" ${p.out_of_stock ? "disabled" : ""}>${p.out_of_stock ? "Unavailable" : "Rent now"}</button>
      </div>
    </div>
  </article>`;
}

function renderProducts() {
  const list = filteredProducts();
  resultCount.textContent = `${list.length} item${list.length === 1 ? "" : "s"}`;
  grid.innerHTML = list.map(productCard).join("");
  empty.hidden = list.length !== 0;
  grid.hidden = list.length === 0;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

document.getElementById("categoryTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  state.filter = btn.dataset.filter;
  document.querySelectorAll(".category-tab").forEach(x => x.classList.toggle("active", x === btn));
  renderProducts();
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  state.search = e.target.value.trim();
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

grid.addEventListener("click", (e) => {
  const wish = e.target.closest("[data-wish]");
  if (wish) {
    const id = Number(wish.dataset.wish);
    state.wishlist.has(id) ? state.wishlist.delete(id) : state.wishlist.add(id);
    renderProducts();
    showToast(state.wishlist.has(id) ? "Added to wishlist" : "Removed from wishlist");
    return;
  }
  const rent = e.target.closest("[data-rent]");
  if (rent) {
    state.cart += 1;
    document.getElementById("cartCount").textContent = state.cart;
    showToast("Added to your rental shortlist");
  }
});

const modal = document.getElementById("dateModal");
function openDateModal(){ modal.hidden = false; document.body.style.overflow="hidden"; }
function closeDateModal(){ modal.hidden = true; document.body.style.overflow=""; }
document.getElementById("dateBtn").addEventListener("click", openDateModal);
document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", closeDateModal));
modal.addEventListener("click", e => { if (e.target === modal) closeDateModal(); });

const today = new Date();
const iso = today.toISOString().slice(0,10);
document.getElementById("startDate").min = iso;
document.getElementById("endDate").min = iso;

document.getElementById("saveDates").addEventListener("click", () => {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  if (!start || !end) return showToast("Please select both dates");
  if (end < start) return showToast("End date should be after start date");
  const format = d => new Date(d + "T00:00:00").toLocaleDateString("en-IN", {day:"2-digit", month:"short"});
  document.getElementById("dateSummary").textContent = `${format(start)} – ${format(end)}`;
  closeDateModal();
  showToast("Rental dates saved");
});

function renderReviews() {
  const track = document.getElementById("reviewTrack");
  const count = window.innerWidth < 760 ? 1 : 3;
  const cards = [];
  for (let i=0;i<count;i++) cards.push(reviews[(state.reviewIndex+i)%reviews.length]);
  track.innerHTML = cards.map(r => `<article class="review-card">
    <div class="stars">★★★★★</div>
    <blockquote>“${r.text}”</blockquote>
    <div class="reviewer"><div class="avatar">${r.initials}</div><div><strong>${r.name}</strong><span>${r.place} · ${r.type}</span></div></div>
  </article>`).join("");
}
document.getElementById("reviewNext").addEventListener("click",()=>{state.reviewIndex=(state.reviewIndex+1)%reviews.length;renderReviews()});
document.getElementById("reviewPrev").addEventListener("click",()=>{state.reviewIndex=(state.reviewIndex-1+reviews.length)%reviews.length;renderReviews()});
window.addEventListener("resize", renderReviews);

document.getElementById("faqList").innerHTML = faqs.map((f,i)=>`<div class="faq-item ${i===0?"open":""}">
  <button class="faq-question" type="button">${f[0]}<span>${i===0?"−":"+"}</span></button>
  <div class="faq-answer">${f[1]}</div>
</div>`).join("");
document.getElementById("faqList").addEventListener("click", e => {
  const btn = e.target.closest(".faq-question");
  if (!btn) return;
  const item = btn.parentElement;
  item.classList.toggle("open");
  btn.querySelector("span").textContent = item.classList.contains("open") ? "−" : "+";
});

document.getElementById("wishlistBtn").addEventListener("click", () => showToast(`${state.wishlist.size} item${state.wishlist.size===1?"":"s"} in wishlist`));
document.getElementById("cartBtn").addEventListener("click", () => showToast(`${state.cart} item${state.cart===1?"":"s"} in rental shortlist`));
document.getElementById("locationBtn").addEventListener("click", () => showToast("Showing availability for Bangalore"));
document.getElementById("ctaBtn").addEventListener("click", () => document.getElementById("products").scrollIntoView({behavior:"smooth"}));
document.getElementById("clearFilters").addEventListener("click", () => {
  state.filter="all"; state.search=""; state.sort="featured";
  document.getElementById("searchInput").value="";
  document.getElementById("sortSelect").value="featured";
  document.querySelectorAll(".category-tab").forEach((x,i)=>x.classList.toggle("active",i===0));
  renderProducts();
});
document.getElementById("menuBtn").addEventListener("click",()=>showToast("Use the sections below to explore the page"));

renderProducts();
renderReviews();
