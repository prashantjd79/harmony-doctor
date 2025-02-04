const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true }, // ✅ Promo Code Text
    discountPercentage: { type: Number, required: true }, // ✅ Discount in percentage
    validTill: { type: Date, required: true }, // ✅ Expiration Date

    // ✅ Condition 1: Apply only on a specific transaction (Optional)
    applicableTransactions: { type: Number, default: null }, 

    // ✅ Condition 2: Apply only for patients with MH score > 2.0 (Optional)
    specialForMentalHealth: { type: Boolean, default: false }, 

    createdAt: { type: Date, default: Date.now }
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
module.exports = PromoCode;
