module.exports = (req, res, next) => {
  const payload =
    req.body?.data && typeof req.body.data === "object" && !Array.isArray(req.body.data)
      ? req.body.data
      : req.body;

  if (
    payload &&
    String(payload.loanTenureYears) === "-1" &&
    (payload.loanTenureYearsCustom === undefined || payload.loanTenureYearsCustom === "") &&
    payload.loanTenure === undefined
  ) {
    payload.loanTenureYears = 11;
  }

  next();
};