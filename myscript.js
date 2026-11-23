"use strict";
// Fitness Meals — CIS201 demonstration project (no server, no real purchases)
const MENU_ITEMS = {"butter-chicken":{"name":"Butter chicken","price":26},"bbq-slider":{"name":"Barbecue Slider","price":32},"cheese-pasta":{"name":"Pasta with cheese","price":28},"meat-pasta":{"name":"Pasta with meat","price":32},"caesar-salad":{"name":"Caesar salad","price":18},"barbeer-salad":{"name":"Barbeer salad","price":20},"waffle":{"name":"Waffle","price":18},"kunafa":{"name":"Cheese kunafa","price":12},"cinnabon":{"name":"Cinnabon","price":20},"chocolate":{"name":"Chocolate with Chantilly cream","price":16},"vanilla-milk":{"name":"Vanilla protein milk","price":8},"chocolate-milk":{"name":"Chocolate protein milk","price":8},"plain-milk":{"name":"Plain protein milk","price":8},"strawberry-milk":{"name":"Strawberry protein milk","price":8},"orange-juice":{"name":"Orange juice","price":10},"lemon-juice":{"name":"Lemon juice","price":10}};
const KEY = "fitnessMealsDemo";

function readData() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (error) { return {}; }
}
function writeData(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (error) { /* Browser storage may be disabled; pages still load. */ }
}
function saveFields(fields) {
    const data = readData();
    Object.assign(data, fields);
    writeData(data);
}
function goTo(filename) { window.location.href = filename; }

function saveBasic(event) {
    event.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const checked = document.querySelector('input[name="gender"]:checked');
    if (!name || !checked) { alert("Please enter your name and choose a gender."); return; }
    saveFields({name: name, gender: checked.value});
    goTo("page2.html");
}
function saveContact(event) {
    event.preventDefault();
    const form = document.getElementById("contactForm");
    if (!form.reportValidity()) return;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    saveFields({phone: phone, email: email});
    goTo("page3.html");
}
function saveHealth(event) {
    event.preventDefault();
    const form = document.getElementById("healthForm");
    if (!form.reportValidity()) return;
    const birthday = document.getElementById("birthdate").value;
    if (birthday > new Date().toISOString().slice(0,10)) { alert("Date of birth cannot be in the future."); return; }
    saveFields({birthdate: birthday, weight: document.getElementById("weight").value, height: document.getElementById("height").value});
    goTo("page4.html");
}
function showMessage(event) {
    if (event) event.preventDefault();
    const raw = document.getElementById("burn").value;
    const message = document.getElementById("message");
    const next = document.getElementById("nextBtn");
    next.classList.add("hidden");
    message.className = "feedback";
    if (raw.trim() === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0) {
        message.textContent = "Please enter a valid number of calories (zero or more).";
        message.classList.add("bad");
        return;
    }
    const burn = Number(raw);
    if (burn < 1000) { message.textContent = "You need to move more this week."; message.classList.add("bad"); }
    else if (burn < 2500) { message.textContent = "Good job! Keep going."; message.classList.add("ok"); }
    else if (burn < 4000) { message.textContent = "Great! You are very active."; message.classList.add("good"); }
    else { message.textContent = "Excellent! Keep it up!"; message.classList.add("excellent"); }
    saveFields({burn: burn});
    next.classList.remove("hidden");
}
function getCart() {
    const stored = readData().cart;
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
}
function updateCartCount() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = Object.values(getCart()).reduce((s, n) => s + (Number(n) || 0), 0);
}
function addItem(id) {
    if (!MENU_ITEMS[id]) return;
    const cart = getCart();
    cart[id] = (Number(cart[id]) || 0) + 1;
    saveFields({cart: cart});
    updateCartCount();
    const toast = document.getElementById("toast");
    if (toast) {
        toast.textContent = MENU_ITEMS[id].name + " added to your demo order.";
        toast.classList.add("show");
    }
}
function removeItem(id) {
    const cart = getCart();
    delete cart[id];
    saveFields({cart: cart});
    updateCartCount();
    renderOrder();
}
function renderOrder() {
    const rows = document.getElementById("orderRows");
    if (!rows) return;
    rows.replaceChildren();
    const cart = getCart();
    let total = 0, count = 0;
    Object.keys(cart).forEach(id => {
        if (!MENU_ITEMS[id]) return;
        const quantity = Number(cart[id]);
        if (!Number.isInteger(quantity) || quantity < 1) return;
        const info = MENU_ITEMS[id];
        total += info.price * quantity;
        count += quantity;
        const tr = document.createElement("tr");
        const name = document.createElement("td"); name.textContent = info.name;
        const qty = document.createElement("td"); qty.textContent = quantity;
        const price = document.createElement("td"); price.textContent = (info.price * quantity).toFixed(2) + " SAR";
        const actions = document.createElement("td");
        const btn = document.createElement("button"); btn.type = "button"; btn.className = "small-button"; btn.textContent = "Remove";
        btn.addEventListener("click", () => removeItem(id));
        actions.appendChild(btn);
        tr.append(name, qty, price, actions);
        rows.appendChild(tr);
    });
    document.getElementById("orderTotal").textContent = total.toFixed(2) + " SAR";
    document.getElementById("emptyCart").classList.toggle("hidden", count > 0);
    document.getElementById("orderTable").classList.toggle("hidden", count === 0);
    document.getElementById("confirmButton").disabled = count === 0;
    const data = readData();
    const summary = document.getElementById("customerSummary");
    summary.replaceChildren();
    const labels = [['Name',data.name],['Gender',data.gender],['Email',data.email],['Phone',data.phone],['Weekly Calories',data.burn]];
    labels.forEach(([label,value]) => {
        if (value === undefined || value === null || value === "") return;
        const line = document.createElement("p");
        const strong = document.createElement("strong"); strong.textContent = label + ": ";
        line.append(strong,document.createTextNode(String(value)));
        summary.appendChild(line);
    });
    if (!summary.hasChildNodes()) summary.textContent = "No details entered yet. You can start from the Contact page.";
}
function confirmOrder() {
    const cart = getCart();
    if (!Object.keys(cart).some(id => MENU_ITEMS[id] && Number(cart[id]) > 0)) return;
    saveFields({demoConfirmedAt: new Date().toISOString()});
    const el = document.getElementById("confirmation");
    el.textContent = "Demo order confirmed locally! Nothing was sent to a restaurant.";
    el.className = "feedback good";
}
function clearOrder() {
    saveFields({cart: {}, demoConfirmedAt: null});
    const el = document.getElementById("confirmation");
    if (el) el.textContent = "";
    renderOrder();
    updateCartCount();
}
function prefill() {
    const data = readData();
    const values = {fullName: data.name, phone: data.phone, email: data.email, birthdate: data.birthdate, weight: data.weight, height: data.height, burn: data.burn};
    for (const [id, value] of Object.entries(values)) {
        const input = document.getElementById(id);
        if (input && value !== null && value !== undefined) input.value = value;
    }
    if (data.gender) {
        const input = document.querySelector('input[name="gender"][value="'+data.gender+'"]');
        if (input) input.checked = true;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    prefill();
    updateCartCount();
    renderOrder();
    if (document.querySelector(".food-item")) {
        const toast = document.createElement("div");
        toast.id = "toast"; toast.className = "toast"; toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        document.body.appendChild(toast);
    }
    document.querySelectorAll(".food-item img").forEach(img => {
        img.addEventListener("mouseenter", () => img.classList.add("image-zoom"));
        img.addEventListener("mouseleave", () => img.classList.remove("image-zoom"));
    });
});
