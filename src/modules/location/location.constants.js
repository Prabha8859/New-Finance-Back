/*
==========================================
Location Master constants

One status vocabulary is shared by all five collections so the admin UI can
filter/render any level of the hierarchy the same way.
==========================================
*/

const LOCATION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMING_SOON: "coming_soon",
};

const LOCATION_STATUS_VALUES = Object.values(LOCATION_STATUS);

const LOCATION_STATUS_DEFAULT = LOCATION_STATUS.ACTIVE;

/* Human labels used in API messages ("State is inactive"). */
const LOCATION_STATUS_LABELS = {
  [LOCATION_STATUS.ACTIVE]: "active",
  [LOCATION_STATUS.INACTIVE]: "inactive",
  [LOCATION_STATUS.COMING_SOON]: "coming soon",
};

const MAX_NAME_LENGTH = 120;
const MAX_PREFIX_LENGTH = 10;
const PINCODE_REGEX = /^\d{3,10}$/;

module.exports = {
  LOCATION_STATUS,
  LOCATION_STATUS_VALUES,
  LOCATION_STATUS_DEFAULT,
  LOCATION_STATUS_LABELS,
  MAX_NAME_LENGTH,
  MAX_PREFIX_LENGTH,
  PINCODE_REGEX,
};
