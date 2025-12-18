// expert.js
const PREMIUM_PRICE_RATE = { 1:0.05,2:0.07,3:0.10,4:0.15,5:0.20,6:0.30,7:0.40,8:0.50 };

function getPremiumRate() {
    const lv = +document.getElementById("info-expert-premium-price")?.value || 0;
    return PREMIUM_PRICE_RATE[lv] || 0;
}

function getPremiumText(rate) {
    return rate ? `+${Math.floor(rate*100)}%` : '+0%';
}