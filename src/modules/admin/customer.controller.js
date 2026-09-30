const customerService = require("./customer.service");
const {
  listCustomerApplications,
} = require("../loans/shared/adminStatus.service");

/*
==========================================
List Customers
GET /api/admin/customers?search=&page=&limit=&isActive=
==========================================
*/
exports.list = async (req, res, next) => {
  try {
    const { search, page, limit, isActive } = req.query;

    let activeFilter;
    if (isActive === "true") activeFilter = true;
    else if (isActive === "false") activeFilter = false;

    const customers = await customerService.listCustomers({
      search,
      page,
      limit,
      isActive: activeFilter,
    });
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

/*
==========================================
Delete Customer (P0)
DELETE /api/admin/customers/:id

404 unknown id, 409 while the customer still has open (Submitted/Pending)
applications; a closed-history customer is removed together with their
application archive.
==========================================
*/
exports.remove = async (req, res, next) => {
  try {
    const { customer, removedApplications } = await customerService.deleteCustomer(req.params.id);

    res.json({
      success: true,
      message:
        removedApplications > 0
          ? `Customer deleted successfully along with ${removedApplications} closed application${removedApplications === 1 ? "" : "s"}`
          : "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Set Customer Active Status
PATCH /api/admin/customers/:id/status   { isActive: true|false }
==========================================
*/
exports.setStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body ?? {};
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const customer = await customerService.getCustomerById(req.params.id);
    customer.isActive = isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${isActive ? "activated" : "deactivated"} successfully`,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/*
==========================================
Applications of one customer
GET /api/admin/customers/:id/applications
==========================================
*/
exports.listApplications = listCustomerApplications;
