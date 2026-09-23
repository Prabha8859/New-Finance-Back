const customerService = require("../../services/admin/customer.service");

/*
==========================================
List Customers
GET /api/admin/customers?search=
==========================================
*/
exports.list = async (req, res, next) => {
  try {
    const customers = await customerService.listCustomers({ search: req.query.search });
    res.json({ success: true, customers });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Get One Customer
GET /api/admin/customers/:id
==========================================
*/
exports.getOne = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};
