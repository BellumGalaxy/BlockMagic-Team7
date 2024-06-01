import { Schema, model, models } from "mongoose";

const restaurantSchema = new Schema({
  name: { type: String, required: true },
  restaurantWallet: { type: String, required: true },
  description: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  zip: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  district: { type: String, required: true },
  complement: { type: String, required: true },
});

const Restaurant = models.Restaurant || model("Restaurant", restaurantSchema);

export default Restaurant;
