const mapSearchForm = document.querySelector("#map-search-form");
const shopMap = document.querySelector("#shop-map");
const mapOpenLink = document.querySelector("#map-open-link");
const pageSearchInput = document.querySelector("#page-search-input");
const clearPageSearch = document.querySelector("#clear-page-search");
const pageSearchStatus = document.querySelector("#page-search-status");

if (pageSearchInput && clearPageSearch && pageSearchStatus) {
    const searchableItems = Array.from(document.querySelectorAll(
        "#introduction, #equipment-items .equipment, .home-widget"
    ));
    const equipmentSection = document.querySelector("#equipment-items");
    const widgetsSection = document.querySelector(".home-widgets");

    pageSearchInput.addEventListener("input", () => {
        const query = pageSearchInput.value.trim().toLocaleLowerCase();
        let matchCount = 0;

        searchableItems.forEach((item) => {
            const matches = !query || item.textContent.toLocaleLowerCase().includes(query);
            item.classList.remove("search-result-enter");
            item.hidden = !matches;

            if (matches) {
                matchCount += 1;
                if (query) {
                    requestAnimationFrame(() => item.classList.add("search-result-enter"));
                }
            }
        });

        if (equipmentSection) {
            equipmentSection.hidden = !searchableItems.some((item) =>
                item.matches("#equipment-items .equipment") && !item.hidden
            );
        }
        if (widgetsSection) {
            widgetsSection.hidden = !searchableItems.some((item) =>
                item.matches(".home-widget") && !item.hidden
            );
        }

        pageSearchStatus.textContent = query
            ? `${matchCount} ${matchCount === 1 ? "match" : "matches"} for “${pageSearchInput.value.trim()}”.`
            : "Showing all page content.";
    });

    clearPageSearch.addEventListener("click", () => {
        pageSearchInput.value = "";
        pageSearchInput.dispatchEvent(new Event("input", { bubbles: true }));
        pageSearchInput.focus();
    });
}

function updateMap(query) {
    const embedUrl = new URL("https://www.google.com/maps");
    embedUrl.searchParams.set("q", query);
    embedUrl.searchParams.set("output", "embed");
    shopMap.src = embedUrl.toString();

    const mapUrl = new URL("https://www.google.com/maps/search/");
    mapUrl.searchParams.set("api", "1");
    mapUrl.searchParams.set("query", query);
    mapOpenLink.href = mapUrl.toString();
}

if (mapSearchForm && shopMap && mapOpenLink) {
    mapSearchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = new FormData(mapSearchForm).get("query").trim();
        if (query) {
            updateMap(query);
        }
    });
}

const shareButton = document.querySelector("#share-brew");
const shareStatus = document.querySelector("#share-status");

if (shareButton && shareStatus) {
    shareButton.addEventListener("click", async () => {
        const shareData = {
            title: "Bean Botique Coffee",
            text: "Coffee brings us together at Bean Botique.",
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                shareStatus.textContent = "Thanks for sharing Bean Botique.";
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareData.url);
                shareStatus.textContent = "Page link copied. Share it with your coffee community.";
            } else {
                shareStatus.textContent = "Use your browser's address bar to share this page.";
            }
        } catch (error) {
            if (error.name !== "AbortError") {
                shareStatus.textContent = "Sharing is unavailable in this browser.";
            }
        }
    });
}

const REMEMBER_CART_KEY = "beanBoutiqueRememberCart";
const CART_STORAGE_KEY = "beanBoutiqueCart";
const CART_SESSION_KEY = "beanBoutiqueSessionCart";
const rememberBasket = document.querySelector("#remember-basket");
const connectionStatus = document.querySelector("#connection-status");

if (rememberBasket) {
    rememberBasket.checked = localStorage.getItem(REMEMBER_CART_KEY) !== "false";

    rememberBasket.addEventListener("change", () => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        const sessionCart = sessionStorage.getItem(CART_SESSION_KEY);

        if (rememberBasket.checked) {
            if (sessionCart !== null) {
                localStorage.setItem(CART_STORAGE_KEY, sessionCart);
                sessionStorage.removeItem(CART_SESSION_KEY);
            }
            localStorage.setItem(REMEMBER_CART_KEY, "true");
        } else {
            if (savedCart !== null) {
                sessionStorage.setItem(CART_SESSION_KEY, savedCart);
                localStorage.removeItem(CART_STORAGE_KEY);
            }
            localStorage.setItem(REMEMBER_CART_KEY, "false");
        }
    });
}

if (connectionStatus) {
    if (window.location.protocol === "https:") {
        connectionStatus.textContent = "HTTPS is active. This demo does not process payments or send personal details.";
    } else {
        connectionStatus.textContent = "This page is not using HTTPS. Do not enter sensitive information.";
    }
}
