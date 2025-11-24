module.exports = {
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  PRINTIFY_ENABLED: process.env.DEMO_MODE !== 'true',
  ADMIN_DEMO_ENABLED: process.env.DEMO_MODE === 'true'
};
