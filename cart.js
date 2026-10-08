const CART_STORAGE_KEY = "beanBoutiqueCart";
const MAX_QUANTITY = 99;

function readCart() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
        return [];
    }

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
        throw new Error("Saved basket data is invalid.");
    }

    const hasValidItems = parsedCart.every((item) =>
        item
        && typeof item.id === "string"
        && typeof item.name === "string"
        && Number.isFinite(item.price)
        && item.price >= 0
        && Number.isInteger(item.quantity)
        && item.quantity >= 1
        && item.quantity <= MAX_QUANTITY
    );
    if (!hasValidItems) {
        throw new Error("Saved basket contains invalid product data.");
    }

    return parsedCart;
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(price);
}

function showCartMessage(message, isError = false) {
    const status = document.querySelector("#cart-status");
    if (status) {
        status.textContent = message;
        status.setAttribute("aria-live", isError ? "assertive" : "polite");
    }

    document.querySelectorAll("[data-cart-feedback]").forEach((feedback) => {
        feedback.textContent = message;
    });
}

function renderCart() {
    const cartItems = document.querySelector("#cart-items");
    if (!cartItems) {
        return;
    }

    const cart = readCart();
    cartItems.replaceChildren();

    cart.forEach((item) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const priceCell = document.createElement("td");
        const quantityCell = document.createElement("td");
        const totalCell = document.createElement("td");
        const actionCell = document.createElement("td");
        const quantityInput = document.createElement("input");
        const removeButton = document.createElement("button");

        nameCell.textContent = item.name;
        priceCell.textContent = formatPrice(item.price);
        totalCell.textContent = formatPrice(item.price * item.quantity);

        quantityInput.className = "cart-quantity";
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.max = String(MAX_QUANTITY);
        quantityInput.step = "1";
        quantityInput.value = String(item.quantity);
        quantityInput.setAttribute("aria-label", `Quantity for ${item.name}`);
        quantityInput.dataset.cartQuantity = item.id;
        quantityCell.append(quantityInput);

        removeButton.className = "cart-button cart-remove-button";
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.dataset.cartRemove = item.id;
        removeButton.setAttribute("aria-label", `Remove ${item.name} from basket`);
        actionCell.append(removeButton);

        row.append(nameCell, priceCell, quantityCell, totalCell, actionCell);
        cartItems.append(row);
    });

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.querySelector("#cart-subtotal").textContent = formatPrice(subtotal);

    if (cart.length === 0) {
        showCartMessage("Your basket is empty. Add products from the coffee or equipment pages.");
    } else {
        showCartMessage(`${cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) in your basket.`);
    }
}

document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-cart-add]");
    const removeButton = event.target.closest("[data-cart-remove]");

    try {
        if (addButton) {
            const { productId, productName, productPrice } = addButton.dataset;
            const price = Number(productPrice);
            if (!productId || !productName || !Number.isFinite(price) || price < 0) {
                throw new Error("This product cannot be added because its details are invalid.");
            }

            const cart = readCart();
            const existingItem = cart.find((item) => item.id === productId);
            if (existingItem) {
                if (existingItem.quantity >= MAX_QUANTITY) {
                    throw new Error(`You can add up to ${MAX_QUANTITY} of each product.`);
                }
                existingItem.quantity += 1;
            } else {
                cart.push({ id: productId, name: productName, price, quantity: 1 });
            }
            saveCart(cart);
            showCartMessage(`${productName} added to your basket.`);
        } else if (removeButton) {
            const updatedCart = readCart().filter((item) => item.id !== removeButton.dataset.cartRemove);
            saveCart(updatedCart);
            renderCart();
        } else if (event.target.closest("#clear-cart")) {
            saveCart([]);
            renderCart();
        }
    } catch (error) {
        showCartMessage(`Basket could not be updated: ${error.message}`, true);
    }
});

document.addEventListener("change", (event) => {
    const quantityInput = event.target.closest("[data-cart-quantity]");
    if (!quantityInput) {
        return;
    }

    const quantity = Number(quantityInput.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        showCartMessage(`Enter a whole-number quantity between 1 and ${MAX_QUANTITY}.`, true);
        try {
            renderCart();
        } catch (error) {
            showCartMessage(`Basket could not be loaded: ${error.message}`, true);
        }
        return;
    }

    try {
        const cart = readCart();
        const item = cart.find((cartItem) => cartItem.id === quantityInput.dataset.cartQuantity);
        if (!item) {
            throw new Error("The selected product is no longer in your basket.");
        }
        item.quantity = quantity;
        saveCart(cart);
        renderCart();
    } catch (error) {
        showCartMessage(`Basket could not be updated: ${error.message}`, true);
    }
});

if (document.querySelector("#cart-items")) {
    try {
        renderCart();
    } catch (error) {
        showCartMessage(`Basket could not be loaded: ${error.message}`, true);
    }
}
