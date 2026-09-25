const requiredFor = (employmentType) => function () {
  return this.employmentType === employmentType;
};

module.exports = { requiredFor };
