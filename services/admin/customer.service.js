const User = require("../../models/User");

/*
==========================================
Customers are the registered users of the public loan portal
(the "User" collection) — surfaced read-only in the admin panel.
==========================================
*/

const notFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const listCustomers = async ({ search } = {}) => {
  const filter = {};

  const q = String(search ?? "").trim();
  if (q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: regex }, { email: regex }, { mobile: regex }];
  }

  const customers = await User.find(filter).sort({ createdAt: -1 });
  return customers;
};

const getCustomerById = async (id) => {
  const customer = await User.findById(id);
  if (!customer) throw notFound("Customer not found");
  return customer;
};

module.exports = {
  listCustomers,
  getCustomerById,
};
